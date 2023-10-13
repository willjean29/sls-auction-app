import jwt from 'jsonwebtoken';

function sign(payload, secret, { expiresIn }) {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
}

function verify(token, secret) {
  const value = jwt.verify(token, secret);
  return value;
}

export { sign, verify }
