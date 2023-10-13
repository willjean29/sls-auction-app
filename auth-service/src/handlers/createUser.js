import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import { InternalServerError, BadRequest } from 'http-errors';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile'
import commonMiddleware from '../lib/commonMiddleware';
import createUserSchema from '../lib/schemas/createUserSchema';
import { hashPassword } from '../lib/hashPassword';

const dynamodb = new AWS.DynamoDB.DocumentClient();
async function createUser(event, context) {
  const { email, password } = event.body;
  const now = new Date();
  const hashedPassword = await hashPassword(password);
  const user = {
    id: uuid(),
    email,
    password: hashedPassword,
    createdAt: now.toISOString(),
  }
  const existingUser = await dynamodb.query({
    TableName: process.env.USERS_TABLE_NAME,
    IndexName: 'UniqueEmailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  }).promise();

  if (existingUser.Items.length > 0) {
    throw new BadRequest('Email already exists');
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