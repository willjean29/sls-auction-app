import middy from '@middy/core';
import { InternalServerError } from 'http-errors';
import httpErrorHandler from '@middy/http-error-handler';
import { uploadPictureToS3 } from "../lib/uploadPictureToS3";
import { getAuctionById } from "./getAuction";
import { setAuctionPictureUrl } from '../lib/setAuctionPictureUrl';

export async function uploadAuctionPicture(event) {
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);
  const base64 = event.body.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");
  let updateAuction;
  try {
    const pictureUrl = await uploadPictureToS3(auction.id + ".jpg", buffer);
    updateAuction = await setAuctionPictureUrl(id, pictureUrl);
  } catch (error) {
    console.log(error);
    throw new InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updateAuction),
  }
}

export const handler = middy(uploadAuctionPicture)
  .use(httpErrorHandler());