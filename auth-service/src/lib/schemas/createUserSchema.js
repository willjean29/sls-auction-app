const schema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email'
        },
        password: {
          type: 'string'
        },
        name: {
          type: 'string'
        }
      },
      required: ['email', 'password', 'name']
    }
  },
  required: ['body']
}

export default schema;