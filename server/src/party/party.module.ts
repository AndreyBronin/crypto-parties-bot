import { Module } from '@nestjs/common';
import { PartyController } from './party.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyEntity } from './party.entity';
import { PartyService } from './party.service';
import { AttendeeEntity } from './attendee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PartyEntity, AttendeeEntity])],
  controllers: [PartyController],
  providers: [PartyService],
  exports: [PartyService],
})
export class PartyModule {}
