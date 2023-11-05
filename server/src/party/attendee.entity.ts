import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PartyEntity } from './party.entity';
import { AttendeeState } from './statemachine';

@Entity({ name: 'attendees' })
export class AttendeeEntity extends BaseEntity {
  constructor(initialState: AttendeeState) {
    super();
    this.state = initialState;
  }

  // followed date time
  // change status history

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => PartyEntity, (party) => party.attendees)
  @JoinColumn({ name: 'party_id' })
  party: PartyEntity;

  @Column({ name: 'party_id' })
  partyId: number;

  @Column({ default: '' })
  name: string; // user first name + last name

  @Column()
  uid: string;

  @Column()
  state: AttendeeState;

  // прайс дублируется, ибо организатор может менять со временем стоимость билетов
  // тут указана конкрентая цена за которую был куплен этот билет
  @Column({ default: 0 })
  ticketPrice: number;
  @Column({ default: '' })
  qr: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
