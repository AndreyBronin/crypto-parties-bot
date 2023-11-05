import { PartyEntity } from './party.entity';
import { NotFoundException } from '@nestjs/common';

/**
 * Throws NotFoundException if the party doesn't exist or cancelled
 * @param p
 */
export const ensureParty = (p: PartyEntity | undefined) => {
  if (p === undefined) {
    throw new NotFoundException("The party doesn't exist");
  }
  if (p.isCancelled) {
    throw new NotFoundException('The party is cancelled');
  }
};
