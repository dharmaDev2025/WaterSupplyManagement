import "dotenv/config";

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import Customer from "../models/customer.model.js";

console.log(
  "GOOGLE_CLIENT_ID exists:",
  Boolean(process.env.GOOGLE_CLIENT_ID)
);

console.log(
  "GOOGLE_CLIENT_SECRET exists:",
  Boolean(process.env.GOOGLE_CLIENT_SECRET)
);

console.log(
  "GOOGLE_CALLBACK_URL:",
  process.env.GOOGLE_CALLBACK_URL
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (
      accessToken,
      refreshToken,
      profile,
      done
    ) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(
            new Error("Google email not available"),
            null
          );
        }

        let customer = await Customer.findOne({
          googleId: profile.id,
        });

        if (customer) {
          return done(null, customer);
        }

        customer = await Customer.findOne({
          email: email.toLowerCase(),
        });

        if (customer) {
          customer.googleId = profile.id;
          customer.isEmailVerified = true;

          await customer.save();

          return done(null, customer);
        }

        customer = await Customer.create({
          name: profile.displayName,
          email: email.toLowerCase(),
          googleId: profile.id,
          authProvider: "google",
          isEmailVerified: true,
          customerType: "home",
        });

        return done(null, customer);

      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;