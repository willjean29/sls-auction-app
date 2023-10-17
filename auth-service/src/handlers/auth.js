import { verify } from '../lib/jwtUtils';

// By default, API Gateway authorizations are cached (TTL) for 300 seconds.
// This policy will authorize all requests to the same API Gateway instance where the
// request is coming from, thus being efficient and optimising costs.
const generatePolicy = (principalId, methodArn) => {
  const apiGatewayWildcard = methodArn.split('/', 2).join('/') + '/*';

  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: apiGatewayWildcard,
        }
      ],
    },
  };
};

export async function handler(event, context) {
  if (!event.authorizationToken) {
    throw 'Unauthorized';
  }
  console.log({ event })
  const token = event.authorizationToken.replace('Bearer ', '');

  try {
    const claims = verify(token, process.env.SECRET_KEY);
    const policy = generatePolicy('users', event.methodArn);
    console.log(JSON.stringify({ claims, policy }));
    return {
      ...policy,
      context: claims
    };
  } catch (error) {
    console.log(error);
    throw 'Unauthorized';
  }
};
