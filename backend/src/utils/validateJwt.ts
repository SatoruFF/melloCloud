import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } from '../configs/config.js';

export const validateAccessToken = (accessToken: string) => {
  const decoded = jwt.verify(accessToken, ACCESS_SECRET_KEY);
  return decoded;
};

export const validateRefreshToken = (refreshToken: string) => {
  const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
  return decoded;
};
