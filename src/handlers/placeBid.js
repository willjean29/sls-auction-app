import AWS from 'aws-sdk';
import { InternalServerError, BadRequest, Forbidden } from 'http-errors';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile'
import commonMiddleware from '../lib/commonMiddleware';
import placeBidSchema from '../lib/schemas/placeBidSchema';
import { getAuctionById } from './getAuction';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const auction = await getAuctionById(id);

  if (auction.status !== 'OPEN') {
    throw new Forbidden('You cannot bid on closed auctions!');
  }

  if (amount <= auction.highestBid.amount) {
    throw new BadRequest(`Your bid must be higher than ${auction.highestBid.amount}!`)
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: {
      ':amount': amount,
    },
    ReturnValues: 'ALL_NEW',
  }

  let updateAuction;

  try {
    const result = await dynamodb.update(params).promise()
    updateAuction = result.Attributes;
  } catch (error) {
    console.log(error);
    throw new InternalServerError(error)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updateAuction),
  }
}

export const handler = commonMiddleware(placeBid)
  .use(validator({ eventSchema: transpileSchema(placeBidSchema) }));