import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { CreatePartyDto, PartyDto } from './party.dto';
import { PartyEntity } from './party.entity';
import { PartyService } from './party.service';

@Controller('party')
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Post('/create')
  @UsePipes(ValidationPipe)
  // @UseGuards(AuthGuard('firebase-jwt'), AnonymousGuard)
  @ApiCreatedResponse({ description: 'Creates new party' })
  async createParty(
    @Req() { user },
    @Body() party: CreatePartyDto,
  ): Promise<PartyDto> {
    try {
      const p = PartyEntity.createFromDto(party);
      const partyEntity = await this.partyService.createParty(user.uid, p);

      return PartyDto.createFromEntity(partyEntity);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
