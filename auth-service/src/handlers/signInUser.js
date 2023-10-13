import AWS from 'aws-sdk';
import { BadRequest } from 'http-errors';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile'
import commonMiddleware from '../lib/commonMiddleware';
import signInUserSchema from '../lib/schemas/signInUserSchema';
import { comparePassword } from '../lib/hashPassword';
import { sign } from '../lib/jwtUtils';
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function signInUser(event, context) {
  const { email, password } = event.body;
  let user;

  const result = await dynamodb.get({
    TableName: process.env.USERS_TABLE_NAME,
    Key: { email },
  }).promise();

  if (!result.Item) {
    throw new BadRequest('Credentials not valid')
  }

  user = result.Item;
  const isCorrectPassword = await comparePassword(password, user.password);
  if (!isCorrectPassword) {
    throw new BadRequest('Credentials not valid')
  }

  const payload = user;
  const token = sign(payload, process.env.SECRET_KEY, { expiresIn: '24H' })

  return {
    statusCode: 200,
    body: JSON.stringify({ user, token }),
  }
}

export const handler = commonMiddleware(signInUser)
  .use(validator({ eventSchema: transpileSchema(signInUserSchema) }));
