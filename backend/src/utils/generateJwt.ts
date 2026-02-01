import jwt from 'jsonwebtoken';
import { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } from '../configs/config.js';

export const generateJwt = (payload: number | string) => {
  const accessToken = jwt.sign(
    {
      payload,
    },
    ACCESS_SECRET_KEY,
    {
      expiresIn: '1h',
    },
  );

  const refreshToken = jwt.sign(
    {
      payload,
    },
    REFRESH_SECRET_KEY,
    {
      expiresIn: '30d',
    },
  );

  return { accessToken, refreshToken };
};
