import { ObjectId } from "mongodb";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { getUsersCollection } from "./db.js";
import { normalizeEmail, verifyPassword } from "./utils/auth.js";

let isConfigured = false;

export function configurePassport() {
  if (isConfigured) {
    return passport;
  }

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const normalizedEmail = normalizeEmail(email);
          const user = await getUsersCollection().findOne({
            email: normalizedEmail,
          });

          if (!user || !verifyPassword(password, user.passwordHash)) {
            done(null, false, { message: "Invalid login credentials." });
            return;
          }

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, String(user._id));
  });

  passport.deserializeUser(async (userId, done) => {
    try {
      if (!ObjectId.isValid(userId)) {
        done(null, false);
        return;
      }

      const user = await getUsersCollection().findOne({
        _id: new ObjectId(userId),
      });

      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });

  isConfigured = true;
  return passport;
}

export default passport;
