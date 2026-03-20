import crypto from "node:crypto";

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;
const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = crypto
    .scryptSync(password, salt, KEY_LENGTH, {
      cost: COST,
      blockSize: BLOCK_SIZE,
      parallelization: PARALLELIZATION,
    })
    .toString("hex");

  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password, storedHash) {
  const [salt, originalKey] = storedHash.split(":");

  if (!salt || !originalKey) {
    return false;
  }

  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH, {
    cost: COST,
    blockSize: BLOCK_SIZE,
    parallelization: PARALLELIZATION,
  });

  return crypto.timingSafeEqual(Buffer.from(originalKey, "hex"), derivedKey);
}

export function sanitizeUser(user) {
  return {
    _id: String(user._id),
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    bio: user.bio ?? "",
    createdAt: user.createdAt,
  };
}
