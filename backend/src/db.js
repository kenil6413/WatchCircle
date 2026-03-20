import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const mongoUri = process.env.MONGO_URI?.trim() ?? "";
const configuredDatabaseName = process.env.MONGO_DB_NAME?.trim() ?? "";
const parsedPort = Number(process.env.PORT ?? 3000);

export const port =
  Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 3000;

let client = null;
let database = null;

function createDatabaseError(message, status = 500) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getDatabaseNameFromUri() {
  if (!mongoUri) {
    return "";
  }

  try {
    const normalizedUri = mongoUri
      .replace("mongodb+srv://", "https://")
      .replace("mongodb://", "http://");
    const parsedUri = new URL(normalizedUri);

    return parsedUri.pathname.replace(/^\//, "").trim();
  } catch {
    return "";
  }
}

function resolveDatabaseName() {
  return configuredDatabaseName || getDatabaseNameFromUri();
}

export function isDatabaseConfigured() {
  return Boolean(mongoUri && resolveDatabaseName());
}

export function isDatabaseConnected() {
  return Boolean(database);
}

export function getDatabaseName() {
  return resolveDatabaseName();
}

async function ensureCollection(name) {
  const existingCollection = await database
    .listCollections({ name }, { nameOnly: true })
    .toArray();

  if (existingCollection.length === 0) {
    await database.createCollection(name);
  }
}

async function ensureIndexes() {
  await Promise.all([
    database.collection("users").createIndexes([
      { key: { username: 1 }, name: "users_username_unique_idx", unique: true },
      { key: { email: 1 }, name: "users_email_unique_idx", unique: true },
      { key: { createdAt: -1 }, name: "users_createdAt_desc_idx" },
    ]),
    database.collection("groups").createIndexes([
      { key: { groupName: 1 }, name: "groups_groupName_idx" },
      {
        key: { joinCode: 1 },
        name: "groups_joinCode_unique_idx",
        unique: true,
      },
      { key: { ownerId: 1 }, name: "groups_ownerId_idx" },
      { key: { createdAt: -1 }, name: "groups_createdAt_desc_idx" },
    ]),
    database.collection("watchlist").createIndexes([
      { key: { title: 1 }, name: "watchlist_title_idx" },
      { key: { category: 1 }, name: "watchlist_category_idx" },
      { key: { platform: 1 }, name: "watchlist_platform_idx" },
      { key: { status: 1 }, name: "watchlist_status_idx" },
      { key: { updatedAt: -1 }, name: "watchlist_updatedAt_desc_idx" },
    ]),
  ]);
}

async function setupDatabase() {
  await ensureCollection("users");
  await ensureCollection("groups");
  await ensureCollection("watchlist");
  await ensureIndexes();
}

export async function connectToDatabase() {
  if (database) {
    return database;
  }

  if (!mongoUri) {
    throw createDatabaseError("Missing MONGO_URI in backend/.env.");
  }

  const databaseName = resolveDatabaseName();

  if (!databaseName) {
    throw createDatabaseError(
      "Missing database name. Set MONGO_DB_NAME or include the database name in MONGO_URI."
    );
  }

  const nextClient = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await nextClient.connect();
    const nextDatabase = nextClient.db(databaseName);

    await nextDatabase.command({ ping: 1 });

    client = nextClient;
    database = nextDatabase;

    await setupDatabase();

    return database;
  } catch (error) {
    await nextClient.close().catch(() => {});
    throw error;
  }
}

export function getDb() {
  if (!database) {
    throw createDatabaseError("MongoDB is not connected.", 503);
  }

  return database;
}

export function getGroupsCollection() {
  return getDb().collection("groups");
}

export function getWatchlistCollection() {
  return getDb().collection("watchlist");
}

export function getUsersCollection() {
  return getDb().collection("users");
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close();
  }

  client = null;
  database = null;
}
