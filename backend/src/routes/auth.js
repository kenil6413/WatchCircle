import { Router } from "express";
import passport from "passport";
import { getUsersCollection } from "../db.js";
import {
  hashPassword,
  normalizeEmail,
  sanitizeUser,
  verifyPassword,
} from "../utils/auth.js";

const router = Router();

function createHttpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function createUsernameFromEmail(email) {
  return normalizeEmail(email).split("@")[0];
}

async function loginWithSession(req, user) {
  await new Promise((resolve, reject) => {
    req.login(user, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function logoutFromSession(req) {
  await new Promise((resolve, reject) => {
    req.logout((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function generateUniqueUsername(email) {
  const usersCollection = getUsersCollection();
  const baseUsername =
    createUsernameFromEmail(email).replace(/[^a-z0-9_]/g, "") || "user";
  let candidate = baseUsername;
  let suffix = 1;

  while (await usersCollection.findOne({ username: candidate })) {
    candidate = `${baseUsername}${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function validateSignupInput({ displayName, email, password }) {
  if (!displayName.trim()) {
    throw createHttpError("Display name is required.", 400);
  }

  if (!email.trim()) {
    throw createHttpError("Email is required.", 400);
  }

  if (password.trim().length < 6) {
    throw createHttpError("Password must be at least 6 characters.", 400);
  }
}

function requireAuthenticatedUser(req) {
  if (!req.isAuthenticated?.() || !req.user) {
    throw createHttpError("You must be signed in.", 401);
  }

  return req.user;
}

router.get("/session", (req, res) => {
  res.json({
    user: req.user ? sanitizeUser(req.user) : null,
  });
});

router.post("/signup", async (req, res, next) => {
  try {
    const displayName = req.body.displayName ?? "";
    const email = normalizeEmail(req.body.email ?? "");
    const password = req.body.password ?? "";

    validateSignupInput({ displayName, email, password });

    const usersCollection = getUsersCollection();
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      throw createHttpError("Email is already in use.", 409);
    }

    const username = await generateUniqueUsername(email);

    const newUser = {
      displayName: displayName.trim(),
      username,
      email,
      passwordHash: hashPassword(password),
      bio: "",
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    const createdUser = await usersCollection.findOne({
      _id: result.insertedId,
    });

    await loginWithSession(req, createdUser);

    res.status(201).json({
      user: sanitizeUser(createdUser),
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      next(error);
      return;
    }

    if (!user) {
      next(createHttpError(info?.message || "Invalid login credentials.", 401));
      return;
    }

    void loginWithSession(req, user)
      .then(() => {
        res.json({
          user: sanitizeUser(user),
        });
      })
      .catch(next);
  })(req, res, next);
});

router.post("/logout", async (req, res, next) => {
  try {
    await logoutFromSession(req);
    req.session.destroy((error) => {
      if (error) {
        next(error);
        return;
      }

      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully." });
    });
  } catch (error) {
    next(error);
  }
});

router.post("/change-password", async (req, res, next) => {
  try {
    const user = requireAuthenticatedUser(req);
    const currentPassword = req.body.currentPassword ?? "";
    const newPassword = req.body.newPassword ?? "";

    if (!currentPassword || !newPassword) {
      throw createHttpError(
        "Current password and new password are required.",
        400
      );
    }

    if (newPassword.trim().length < 6) {
      throw createHttpError("New password must be at least 6 characters.", 400);
    }

    if (!verifyPassword(currentPassword, user.passwordHash)) {
      throw createHttpError("Current password is incorrect.", 401);
    }

    await getUsersCollection().updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash: hashPassword(newPassword),
        },
      }
    );

    const updatedUser = await getUsersCollection().findOne({ _id: user._id });
    req.user = updatedUser;

    res.json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
