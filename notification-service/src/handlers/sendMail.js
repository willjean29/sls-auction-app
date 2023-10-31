import AWS from 'aws-sdk';
const ses = new AWS.SES({ region: 'us-east-1' });

async function sendMail(event, context) {
  const paraams = {
    Source: 'willjean29@gmail.com',
    Destination: {
      ToAddresses: ['willjean29@gmail.com']
    },
    Message: {
      Body: {
        Text: {
          Data: 'Hello from AWS SES'
        }
      },
      Subject: {
        Data: 'Test email from AWS SES'

      }
    }
  }
  try {
    const result = await ses.sendEmail(paraams).promise();
    console.log({ result })
  } catch (error) {
    console.log({ error });
  }
}

export const handler = sendMail;