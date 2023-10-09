import AWS from 'aws-sdk';
import commonMiddleware from '../lib/commonMiddleware';
import { InternalServerError, NotFound } from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  let auction;
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: {
      ':amount': amount,
    },
    ReturnValues: 'ALL_NEW',
  }

  try {
    const result = await dynamodb.update(params).promise()
    auction = result.Attributes;
  } catch (error) {
    console.log(error);
    throw new InternalServerError(error)
  }

  if (!auction) {
    throw new NotFound(`Auction with ID "${id}" not found!`)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  }
}

export const handler = commonMiddleware(placeBid);