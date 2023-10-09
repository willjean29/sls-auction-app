import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
import { InternalServerError } from 'http-errors';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  let auctions;
  try {
    const result = await dynamodb.scan({
      TableName: process.env.AUCTIONS_TABLE_NAME,
    }).promise()
    auctions = result.Items;
  } catch (error) {
    console.log(error);
    throw new InternalServerError(error)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  }
}

export const handler = middy(getAuctions)
  .use(jsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());