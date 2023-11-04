import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  Category,
  PartySearchOptionsDto,
  SearchPaginationOptions,
} from './party.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PartyEntity } from './party.entity';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { AttendeeEntity } from './attendee.entity';
import { AttendeeState } from './statemachine';
import { UserService } from '../user/user.service';
import { ensureParty } from './helpers';

@Injectable()
export class PartyService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(PartyEntity)
    private readonly repo: Repository<PartyEntity>,
    @InjectRepository(AttendeeEntity)
    private readonly attendeeRepo: Repository<AttendeeEntity>,
  ) {}

  async createParty(uid: string, p: PartyEntity): Promise<PartyEntity> {
    p.owner = uid;
    await this.repo.save(p);

    return p;
  }

  async updateParty(
    uid: string,
    partyId: number,
    p: PartyEntity,
  ): Promise<PartyEntity> {
    // todo: update party where id = partyId
    // todo: take diff of cover images and delete what disappeared, call this.firebase.removeByUrls(diff)
    p.owner = uid;
    const e = this.repo.create(p);
    return e.save();
  }

  async getById(id: number): Promise<PartyEntity> {
    return this.repo.findOne(id, { relations: ['attendees'] });
  }

  async list(): Promise<PartyEntity[]> {
    return this.repo.find({ take: 50 });
  }

  _search(op: PartySearchOptionsDto): SelectQueryBuilder<any> {
    const query = this.repo.createQueryBuilder('party').select();
    const {
      title,
      categoryIds,
      endAt,
      startAt,
      minMemberAge,
      maxMemberAge,
      latitude,
      longitude,
      distance,
      confirmation,
    } = op;
    if (title) {
      query.where(
        new Brackets((qb) => {
          return qb
            .orWhere('party.title ILIKE :title', { title: `%${title}%` })
            .orWhere('party.description ILIKE :description', {
              description: `%${title}%`,
            });
        }),
      );
    }
    if (categoryIds && categoryIds.length) {
      query.andWhere('party.categoryId IN (:...categories)', {
        categories: categoryIds,
      });
    }
    if (startAt) {
      query.andWhere('party.startAt >= :start', { start: startAt });
    }
    if (endAt) {
      query.andWhere('party.endAt <= :end', { end: endAt });
    }
    if (minMemberAge) {
      query.andWhere('party.minMemberAge >= :min', { min: minMemberAge });
    }
    if (maxMemberAge) {
      query.andWhere('party.maxMemberAge <= :max', { max: maxMemberAge });
    }
    if (latitude && longitude && distance) {
      query.andWhere(
        '( 3959 * acos( cos( radians(:latitude) ) * cos( radians( party.latitude ) ) * cos( radians( party.longitude ) - radians(:longitude) ) + sin( radians(:latitude) ) * sin( radians( party.latitude ) ) ) * 1.6 ) <= :distance',
        { distance, latitude, longitude },
      );
    }
    if (confirmation !== undefined) {
      query.andWhere('party.confirmationRequired = :confirmation', {
        confirmation,
      });
    }

    return query;
  }

  async search(
    op: PartySearchOptionsDto,
    pagination?: SearchPaginationOptions,
  ): Promise<PartyEntity[]> {
    const query = this._search(op);
    if (pagination) {
      query
        .skip(pagination.limit * (pagination.page - 1))
        .take(pagination.limit);
    }
    return query.getMany();
  }

  async countSearchResult(op: PartySearchOptionsDto): Promise<number> {
    const query = this._search(op);
    return query.getCount();
  }

  async createdBy(uid: string): Promise<PartyEntity[]> {
    return this.repo.find({
      where: { owner: uid },
      order: { updatedAt: 'DESC' },
    });
  }

  async attendedBy(userId: string): Promise<PartyEntity[]> {
    // todo: find followers
    // select parties left join attendee where attendee.uid = uid AND attendee.status=пришел
    const attendeeList = await this.attendeeRepo.find({
      where: { uid: userId },
      order: { updatedAt: 'DESC' },
    });
    const partyIds = attendeeList.map((e) => e.partyId);
    return this.repo.findByIds(partyIds);
    // return this.repo.find({take: 5});
  }

  async attendParty(uid: string, partyId: number): Promise<AttendeeEntity> {
    let a = await this.attendeeRepo.findOne({ where: { partyId, uid } });
    if (a !== undefined) {
      return a;
    }

    const p = await this.getById(partyId);
    ensureParty(p);

    const user = await this.userService.getUser(uid);
    if (user === undefined) {
      throw new NotFoundException("user doesn't exist");
    }
    // todo:
    // const age = getAge(user.birthDate);
    // if (age < p.minMemberAge || age > p.maxMembers) {
    //     throw new ForbiddenException('Посещение запрещено из-за ограничений по возрасту');
    // }
    // todo: проверить свободные места

    a = new AttendeeEntity(
      p.confirmationRequired === true
        ? AttendeeState.ClaimForAttend
        : AttendeeState.FreeAttendee,
    );
    a.uid = uid;
    a.partyId = partyId;
    a.name = user.getFullName();
    // use state ma here
    // const sm = p.price > 0 ? new PaidAttendeeStateMachine(a.state) : new FreeAttendeeStateMachine(a.state);
    // sm.attend(??)
    if (!p.confirmationRequired && p.price > 0) {
      a.state = AttendeeState.WaitPayment;
    }

    a.ticketPrice = p.price;
    await a.save();
    // await this.notificationService.pushEvent(Event.ClaimForAttend, user);

    try {
      const count = await this.attendeeRepo
        .createQueryBuilder()
        .select()
        .where({ partyId, uid })
        .getCount();
      await this.repo
        .createQueryBuilder()
        .update()
        .set({ attendeesCount: count })
        .where('id = :id', { id: partyId })
        .execute();
    } catch (e) {
      Logger.error('update attendee count error: ' + e.message);
    }
    return a;
  }

  async partyAttendees(uid: string, partyId: number) {
    const p = await this.getById(partyId);
    if (p === undefined) {
      throw new NotFoundException('Вечеринка не существует');
    }

    if (uid === p.owner) {
      // todo: return claimForAttendee and rejected users as well
    }

    return p.attendees;
  }

  async getAttendee(uid: string, partyId: number): Promise<AttendeeEntity> {
    const a = await this.attendeeRepo.findOne({ where: { partyId, uid } });
    if (a === undefined) {
      return new AttendeeEntity(AttendeeState.NoAttendee);
    }

    return a;
  }

  async missParty(uid: string, partyId: number) {
    const p = await this.getById(partyId);
    ensureParty(p);

    const a = await this.attendeeRepo.findOne({ where: { partyId, uid } });
    Logger.log(a);
    if (
      a.state === AttendeeState.FreeAttendee ||
      a.state === AttendeeState.ClaimForAttend
    ) {
      await this.attendeeRepo.remove(a);

      const count = await this.attendeeRepo
        .createQueryBuilder()
        .select()
        .where({ where: { partyId, uid } })
        .getCount();
      await this.repo
        .createQueryBuilder()
        .update()
        .set({ attendeesCount: count })
        .where('id = :id', { id: partyId })
        .execute();
    }
  }

  // async categoriesAndTags(): Promise<Category[]> {
  //   // const doc = this.firestore.collection('cache').doc('tags');
  //   // const res = await doc.get();
  //   //
  //   // return  res.data().tags;
  //
  //   // return GetDefaultTags();
  //   return categoriesJson;
  // }

  async approveAttendee(loggedUid: string, partyId: number, uid: string) {
    const p = await this.getById(partyId);
    ensureParty(p);

    if (p.owner !== loggedUid) {
      throw new ForbiddenException('Вы не организатор вечеринки');
    }

    const a = await this.getAttendee(uid, partyId);
    if (
      a.state !== AttendeeState.ClaimForAttend &&
      a.state !== AttendeeState.RejectedAttendee
    ) {
      return;
    }

    a.state =
      p.price > 0 ? AttendeeState.WaitPayment : AttendeeState.FreeAttendee;
    await a.save();
  }

  async rejectAttendee(loggedUid: string, partyId: number, uid: string) {
    const p = await this.getById(partyId);
    ensureParty(p);

    if (p.owner !== loggedUid) {
      throw new ForbiddenException('Вы не организатор вечеринки');
    }

    const a = await this.getAttendee(uid, partyId);
    if (a.state === AttendeeState.PaidAttendee) {
      throw new ForbiddenException('todo: посетитель уже оплатил участие');
    }

    a.state = AttendeeState.RejectedAttendee;
    await a.save();
  }
}
