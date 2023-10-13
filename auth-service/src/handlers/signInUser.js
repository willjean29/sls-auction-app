import AWS from 'aws-sdk';
import { InternalServerError, BadRequest } from 'http-errors';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile'
import commonMiddleware from '../lib/commonMiddleware';
import signInUserSchema from '../lib/schemas/signInUserSchema';
import { comparePassword } from '../lib/hashPassword';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function signInUser(event, context) {
  const { email, password } = event.body;
  let user;

  try {
    const result = await dynamodb.get({
      TableName: process.env.USERS_TABLE_NAME,
      Key: { email },
    }).promise();

    if (!result) {
      throw new BadRequest('Credentials not valid')
    }

    user = result.Item;
    const isCorrectPassword = await comparePassword(password, user.password);
    if (!isCorrectPassword) {
      throw new BadRequest('Credentials not valid')
    }

  } catch (error) {
    console.log(error);
    throw new InternalServerError(error)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(user),
  }
}

export const handler = commonMiddleware(signInUser)
  .use(validator({ eventSchema: transpileSchema(signInUserSchema) }));
