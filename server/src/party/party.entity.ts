import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeepPartial,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AttendeeEntity } from './attendee.entity';
import { CreatePartyDto } from './party.dto';
import { PartyState } from './statemachine';
import { Index } from 'typeorm';

@Entity({ name: 'parties' })
export class PartyEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  @Index()
  owner: string; // user owner
  @Column()
  title: string;
  @Column()
  description: string;
  @Column({ default: 1 })
  @Index()
  categoryId: number;
  @Column({ type: 'text', array: true, nullable: true })
  covers: string[];
  @Column({ default: 0 })
  price: number;
  @Column({ default: 100 })
  attendeesLimit: number;
  @Column({ default: 12 })
  minMemberAge: number;
  @Column({ default: 50 })
  maxMemberAge: number;
  @Column({ default: 1 })
  placeType: number; // enum
  @Column({ default: '' })
  address: string;
  @Column({ default: 0, type: 'real' })
  latitude: number;
  @Column({ default: 0, type: 'real' })
  longitude: number;
  @Column({ default: '' })
  startAt: string; // date
  @Column({ default: '' })
  endAt: string; // date
  city?: string;
  cityId?: number;

  @Column({ default: false })
  confirmationRequired: boolean;

  @Column({ default: false })
  isCancelled: boolean; // флаг отмены

  @Column({ nullable: true })
  showLocationDate: string;

  @OneToMany(() => AttendeeEntity, (attendee) => attendee.party)
  attendees: AttendeeEntity[];

  @Column({ default: 0 })
  attendeesCount: number;

  // todo: attendee uids -> move to Redis cache
  // @Column({name: 'uids', type: 'text', array: true, nullable: true })
  // uids: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  public constructor(init?: DeepPartial<PartyEntity>) {
    super();
    Object.assign(this, init);
  }

  getState(): PartyState {
    if (this.isCancelled) {
      return PartyState.Cancelled;
    }

    const now = Date.now();
    const startAt = Date.parse(this.startAt);
    const endAt = Date.parse(this.endAt);

    if (now < startAt) {
      return PartyState.New;
    } else if (now > endAt) {
      return PartyState.Finished;
    }

    return PartyState.Started;
  }

  static createFromDto(dto: CreatePartyDto): PartyEntity {
    const p = new PartyEntity();
    p.title = dto.title;
    p.description = dto.description;
    p.address = dto.address;
    p.latitude = dto.latitude;
    p.longitude = dto.longitude;
    p.startAt = dto.startAt;
    p.endAt = dto.endAt;
    p.categoryId = dto.categoryId;
    p.placeType = dto.placeType;
    p.attendeesLimit = dto.attendeesLimit;
    p.maxMemberAge = dto.maxMemberAge;
    p.minMemberAge = dto.minMemberAge;
    p.confirmationRequired = dto.confirmationRequired;
    p.covers = dto.covers;
    p.showLocationDate = dto.showLocationDate;

    return p;
  }
}
