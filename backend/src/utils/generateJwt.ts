import jwt from "jsonwebtoken";
import "dotenv/config";

const accessSecretKey = process.env.ACCESS_SECRET_KEY;
const refreshSecretKey = process.env.REFRESH_SECRET_KEY;

export const generateJwt = (payload: number | string) => {
  const accessToken = jwt.sign(
    {
      payload,
    },
    accessSecretKey as string,
    {
      expiresIn: "1h",
    }
  );

  const refreshToken = jwt.sign(
    {
      payload,
    },
    refreshSecretKey as string,
    {
      expiresIn: "30d",
    }
  );

  return { accessToken, refreshToken };
};
