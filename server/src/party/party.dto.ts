import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PartyEntity } from './party.entity';
import { AttendeeState, PartyState } from './statemachine';

export class Category {
  id: number;
  name: string;
}

export class PlaceType {
  id: number;
  name: string;
}

export interface PartyListWithPagination {
  pagination: SearchPaginationOptions;
  parties: PartyListItemDto[];
}

export interface SearchPaginationOptions {
  limit: number;
  page: number;
  totalPages?: number;
}

export class PartySearchOptionsDto {
  @IsOptional()
  categoryIds?: number[];

  @IsOptional()
  @IsNumber()
  latitude?: number;
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  distance?: number;
  @IsOptional()
  @IsString()
  title?: string;
  @IsOptional()
  @IsNumber()
  minMemberAge?: number;
  @IsOptional()
  @IsNumber()
  maxMemberAge?: number;
  @IsOptional()
  @IsOptional()
  @IsBoolean()
  // need confirmation for attendee from party owner
  confirmation?: boolean;

  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;
}

export class CreatePartyDto {
  @IsNotEmpty({ message: 'Set title' })
  title: string;

  @IsNotEmpty({ message: 'Set description' })
  description: string;

  @IsNumber()
  categoryId: number;
  @IsNumber()
  placeType: number;

  @IsDateString()
  @IsOptional()
  showLocationDate?: string; // show hidden location datetime

  @IsNotEmpty({ message: 'Set address' })
  address: string; // party address: Country, city, street etc.
  @IsNumber()
  latitude: number;
  @IsNumber()
  longitude: number;

  @IsNumber()
  attendeesLimit: number; // zero if no limit
  @IsNumber()
  minMemberAge: number; // min attendee age
  @IsNumber()
  maxMemberAge: number; // max attendee age

  @IsDateString()
  startAt: string; // party start date time
  @IsDateString()
  endAt: string; // party end date time

  @IsBoolean()
  confirmationRequired: boolean; //  need confirmation for attendee from party owner

  @IsOptional()
  @IsArray()
  covers?: string[]; // Cover pic urls

  // https://stackoverflow.com/questions/14142071/typescript-and-field-initializers
  public constructor(init?: Partial<CreatePartyDto>) {
    Object.assign(this, init);
  }
}

export class PartyListItemDto {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  placeType: number;
  address: string;
  latitude: number;
  longitude: number;
  owner: string;

  startAt: string;
  endAt: string;
  maxMembers: number;
  // attendeeState: AttendeeState;

  state: PartyState;

  public constructor(p: PartyEntity) {
    return {
      id: p.id,
      title: p.title,
      owner: p.owner,
      description: p.description,
      categoryId: p.categoryId,
      placeType: p.placeType,
      address: p.address,
      latitude: p.latitude,
      longitude: p.longitude,
      startAt: p.startAt,
      endAt: p.endAt,
      maxMembers: p.maxMemberAge,
      // attendeeState: AttendeeState.NoAttendee, // todo: correct value
      state: p.getState(),
    } as PartyListItemDto;
  }
}

export class PartyDto extends CreatePartyDto {
  id: number;
  owner: string;

  attendeeState: AttendeeState;
  state: PartyState;

  public constructor(p: PartyEntity) {
    super(p);
    Object.assign(this, p);
  }

  static createFromEntity(p: PartyEntity): PartyDto {
    const result = {
      id: p.id,
      owner: p.owner,
      title: p.title,
      description: p.description,
      categoryId: p.categoryId,
      placeType: p.placeType,
      attendeesLimit: p.attendeesLimit,
      minMemberAge: p.minMemberAge,
      maxMemberAge: p.maxMemberAge,
      address: p.address,
      latitude: p.latitude,
      longitude: p.longitude,
      startAt: p.startAt,
      endAt: p.endAt,
      confirmationRequired: p.confirmationRequired,
      covers: p.covers,
      attendeeState: AttendeeState.NoAttendee,
      state: p.getState(),
    } as PartyDto;

    if (p.showLocationDate) {
      result.showLocationDate = p.showLocationDate;
    }

    return result;
  }
}

export class AttendeeDto {
  uid: string;
  name: string;
  state: AttendeeState;
}

export class AttendeeListsDto {
  totalAmount: number;
  claims: AttendeeDto[];
  rejected: AttendeeDto[];
  approved: AttendeeDto[];
}
