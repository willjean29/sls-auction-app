import { closeAuction } from '../lib/closeAuctions';
import { getEndedAuctions } from '../lib/getEndedAuctions';
import { InternalServerError } from 'http-errors';
async function processAuctions(event, context) {
  try {
    const auctionsToClose = await getEndedAuctions();
    const closePromises = auctionsToClose.map(auction => closeAuction(auction));
    await Promise.all(closePromises);
    return {
      closed: closePromises.length
    };
  } catch (error) {
    console.log(error);
    throw new InternalServerError(error);
  }

}

export const handler = processAuctions;