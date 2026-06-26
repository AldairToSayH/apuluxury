import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { env } from "./env";

export type GoogleOAuthUser = {
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
};

export const isGoogleOAuthEnabled = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
);

if (isGoogleOAuthEnabled) {
  passport.use(
    new GoogleStrategy(
      {
        callbackURL: env.GOOGLE_CALLBACK_URL,
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      (_accessToken, _refreshToken, profile, done) => {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          done(null, false);
          return;
        }

        const googleUser = {
          googleId: profile.id,
          email,
          displayName: profile.displayName || email,
          avatarUrl: profile.photos?.[0]?.value ?? null,
        } satisfies GoogleOAuthUser;

        done(null, googleUser as unknown as Express.User);
      },
    ),
  );
}
