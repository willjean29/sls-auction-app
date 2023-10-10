async function processAuctions(event, context) {
  // const auctionsToClose = await getEndedAuctions();
  // const closePromises = auctionsToClose.map(auction => closeAuction(auction));
  // await Promise.all(closePromises);
  // return {
  //   closed: closePromises.length
  // };
  console.log('processing auctions')
}

export const handler = processAuctions;