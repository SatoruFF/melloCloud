import "dotenv/config";
import _ from "lodash";
import jwt from "jsonwebtoken";

const accessSecretKey = process.env.ACCESS_SECRET_KEY;
const refreshSecretKey = process.env.REFRESH_SECRET_KEY;

export const validateAccessToken = (accessToken: string) => {
  const decoded = jwt.verify(accessToken, accessSecretKey);
  return decoded;
};

export const validateRefreshToken = (refreshToken: string) => {
  const decoded = jwt.verify(refreshToken, refreshSecretKey);
  return decoded;
};
