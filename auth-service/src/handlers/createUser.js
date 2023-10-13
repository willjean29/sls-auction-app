import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import { InternalServerError } from 'http-errors';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile'
import commonMiddleware from '../lib/commonMiddleware';
import createUserSchema from '../lib/schemas/createUserSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();
async function createUser(event, context) {
  const { email, password } = event.body;
  const now = new Date();
  const user = {
    id: uuid(),
    email,
    password,
    createdAt: now.toISOString(),
  }
  try {
    await dynamodb.put({
      TableName: process.env.USERS_TABLE_NAME,
      Item: user,
      ConditionExpression: 'attribute_not_exists(email)'
    }).promise();
  } catch (error) {
    console.log(error)
    throw new InternalServerError(error)
  }
  return {
    statusCode: 200,
    body: JSON.stringify(user),
  }
}

export const handler = commonMiddleware(createUser)
  .use(validator({ eventSchema: transpileSchema(createUserSchema) }));