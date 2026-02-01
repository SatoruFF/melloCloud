import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as YandexStrategy } from "passport-yandex";
import {
  API_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  prisma,
  YANDEX_CLIENT_ID,
  YANDEX_CLIENT_SECRET,
} from "../configs/config.js";
import { v4 as uuidv4 } from "uuid";
import { FileService } from "../services/fileService.js";

// ========================================
// Google OAuth Strategy
// ========================================
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${API_URL}/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email from Google"), undefined);
          }

          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            const storageGuid = uuidv4();

            user = await prisma.user.create({
              data: {
                email,
                userName: profile.displayName || email.split("@")[0],
                password: "", // OAuth users don't have password
                storageGuid,
                isActivated: true,
                oauthProvider: "google",
                oauthId: profile.id,
                avatar: profile.photos?.[0]?.value,
              },
            });

            // Create user config
            await prisma.userConfig.create({
              data: { userId: user.id },
            });

            // Create base directory for user
            const baseDir = {
              userId: user.id,
              path: "",
              type: "dir",
              name: "",
              storageGuid,
            };
            await FileService.createDir(baseDir);
          }

          return done(null, user);
        } catch (error) {
          console.error("Google OAuth error:", error);
          return done(error as Error, undefined);
        }
      }
    )
  );
} else {
  console.warn("Google OAuth credentials not configured");
}

// ========================================
// Yandex OAuth Strategy
// ========================================
if (YANDEX_CLIENT_ID && YANDEX_CLIENT_SECRET) {
  passport.use(
    new YandexStrategy(
      {
        clientID: YANDEX_CLIENT_ID,
        clientSecret: YANDEX_CLIENT_SECRET,
        callbackURL: `${API_URL}/auth/yandex/callback`,
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          const email = profile.emails?.[0]?.value || profile.default_email;
          if (!email) {
            return done(new Error("No email from Yandex"), undefined);
          }

          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            const storageGuid = uuidv4();

            user = await prisma.user.create({
              data: {
                email,
                userName: profile.display_name || profile.login || email.split("@")[0],
                password: "",
                storageGuid,
                isActivated: true,
                oauthProvider: "yandex",
                oauthId: profile.id,
                avatar: profile.default_avatar_id
                  ? `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`
                  : undefined,
              },
            });

            await prisma.userConfig.create({
              data: { userId: user.id },
            });

            // Create base directory for user
            const baseDir = {
              userId: user.id,
              path: "",
              type: "dir",
              name: "",
              storageGuid,
            };
            await FileService.createDir(baseDir);
          }

          return done(null, user);
        } catch (error) {
          console.error("Yandex OAuth error:", error);
          return done(error, undefined);
        }
      }
    )
  );
} else {
  console.warn("Yandex OAuth credentials not configured");
}

export default passport;
