import { ObjectId } from "mongodb";
import {
  closeDatabaseConnection,
  connectToDatabase,
  getDatabaseName,
} from "../db.js";
import { generateJoinCode } from "../utils/groups.js";
import { hashPassword } from "../utils/auth.js";

const categories = ["Anime", "Movie", "TV Show"];
const platforms = [
  "Netflix",
  "Prime Video",
  "Disney+",
  "Crunchyroll",
  "Hulu",
  "Max",
  "Other",
];
const statuses = ["Plan to Watch", "Watching", "Completed"];
const emojis = ["🎬", "🏠", "🎌", "📺", "⭐", "🍿", "🔥", "👻"];
const firstNames = [
  "Kenil",
  "Sukanya",
  "Priya",
  "Arjun",
  "Sam",
  "Rhea",
  "Kabir",
  "Ananya",
  "Aarav",
  "Nina",
  "Maya",
  "Rohit",
];
const lastNames = [
  "Patel",
  "Shete",
  "Shah",
  "Rao",
  "Singh",
  "Mehta",
  "Joshi",
  "Kapoor",
];
const descriptors = [
  "Midnight",
  "Neon",
  "Silver",
  "Hidden",
  "Electric",
  "Golden",
  "Crimson",
  "Silent",
  "Blue",
  "Shadow",
];
const nouns = [
  "Signal",
  "Orbit",
  "Promise",
  "Empire",
  "Chronicle",
  "Journey",
  "Legend",
  "Season",
  "Echo",
  "Archive",
];
const notes = [
  "Great pacing and easy to recommend.",
  "Perfect for a relaxed weekend watch.",
  "Strong characters and a solid payoff.",
  "Worth it just for the final stretch.",
  "One of those titles that is hard to stop watching.",
];
const groupThemes = [
  "College Crew",
  "Family Circle",
  "Weekend Watchers",
  "Anime Club",
  "Roommates",
  "Movie Night",
  "Work Friends",
];

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateWithinLastYear() {
  const now = Date.now();
  const daysBack = randomInt(0, 365);
  return new Date(now - daysBack * 24 * 60 * 60 * 1000);
}

function normalizeTitle(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildUsers(count) {
  return Array.from({ length: count }, (_, index) => {
    const displayName = `${randomItem(firstNames)} ${randomItem(lastNames)}`;
    const username = `${displayName.toLowerCase().replace(/\s+/g, "")}${index}`;
    const createdAt = randomDateWithinLastYear();

    return {
      _id: new ObjectId(),
      displayName,
      username,
      email: `${username}@watchcircle.dev`,
      passwordHash: hashPassword("password123"),
      bio: "",
      createdAt,
    };
  });
}

function buildMembers(users, owner) {
  const memberCount = randomInt(3, 6);
  const selectedUsers = [owner];

  while (selectedUsers.length < memberCount) {
    const candidate = randomItem(users);

    if (!selectedUsers.some((user) => user._id.equals(candidate._id))) {
      selectedUsers.push(candidate);
    }
  }

  return selectedUsers.map((user) => ({
    userId: String(user._id),
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    role: user._id.equals(owner._id) ? "owner" : "member",
  }));
}

function buildRecommendation(index, users) {
  const addedBy = randomItem(users);
  const category = randomItem(categories);
  const rating = Number((Math.random() * 4 + 6).toFixed(1));
  const createdAt = randomDateWithinLastYear();

  return {
    _id: new ObjectId(),
    title: `${randomItem(descriptors)} ${randomItem(nouns)} ${index + 1}`,
    category,
    platform: randomItem(platforms),
    note: randomItem(notes),
    rating,
    addedBy: addedBy.displayName,
    addedByUserId: String(addedBy._id),
    posterUrl: "",
    imdbId: "",
    imdbRating: "",
    votes: [],
    votesUp: randomInt(0, 8),
    votesDown: randomInt(0, 2),
    comments: [],
    createdAt,
  };
}

function buildGroups(users, count) {
  const usedJoinCodes = new Set();

  return Array.from({ length: count }, (_, index) => {
    const owner = randomItem(users);
    const members = buildMembers(users, owner);
    let joinCode = generateJoinCode();

    while (usedJoinCodes.has(joinCode)) {
      joinCode = generateJoinCode();
    }

    usedJoinCodes.add(joinCode);

    const recommendationCount = randomInt(2, 7);

    return {
      _id: new ObjectId(),
      groupName: `${randomItem(groupThemes)} ${index + 1}`,
      description: `A shared space for ${randomItem(categories).toLowerCase()} picks and trusted recommendations.`,
      groupEmoji: randomItem(emojis),
      joinCode,
      ownerId: String(owner._id),
      ownerName: owner.displayName,
      members,
      recommendations: Array.from(
        { length: recommendationCount },
        (_, recommendationIndex) =>
          buildRecommendation(index * 10 + recommendationIndex, users)
      ),
      createdAt: randomDateWithinLastYear(),
    };
  });
}

function buildWatchlistItems(users, count) {
  return Array.from({ length: count }, (_, index) => {
    const owner = randomItem(users);
    const category = randomItem(categories);
    const status = randomItem(statuses);
    const rating =
      status === "Plan to Watch"
        ? null
        : Number((Math.random() * 4 + 6).toFixed(1));
    const createdAt = randomDateWithinLastYear();
    const updatedAt = new Date(
      createdAt.getTime() + randomInt(0, 60) * 24 * 60 * 60 * 1000
    );
    const title = `${randomItem(descriptors)} ${randomItem(nouns)} ${index + 1}`;

    return {
      _id: new ObjectId(),
      ownerId: String(owner._id),
      ownerName: owner.displayName,
      title,
      titleNormalized: normalizeTitle(title),
      category,
      platform: randomItem(platforms),
      status,
      episodeProgress:
        status === "Plan to Watch"
          ? ""
          : `${randomInt(1, 12)}/${randomInt(8, 24)}`,
      rating,
      reviewNote: randomItem(notes),
      posterUrl: "",
      imdbId: "",
      imdbRating: "",
      createdAt,
      updatedAt,
    };
  });
}

async function seedDatabase() {
  const database = await connectToDatabase();
  const usersCollection = database.collection("users");
  const groupsCollection = database.collection("groups");
  const watchlistCollection = database.collection("watchlist");

  const users = buildUsers(24);
  const groups = buildGroups(users, 220);
  const watchlistItems = buildWatchlistItems(users, 900);

  await Promise.all([
    usersCollection.deleteMany({}),
    groupsCollection.deleteMany({}),
    watchlistCollection.deleteMany({}),
  ]);

  await usersCollection.insertMany(users);
  await groupsCollection.insertMany(groups);
  await watchlistCollection.insertMany(watchlistItems);

  console.log(`Seeded database "${getDatabaseName()}".`);
  console.log(`Users: ${users.length}`);
  console.log(`Groups: ${groups.length}`);
  console.log(`Watchlist items: ${watchlistItems.length}`);
  console.log(
    `Total synthetic records: ${users.length + groups.length + watchlistItems.length}`
  );
}

try {
  await seedDatabase();
} finally {
  await closeDatabaseConnection();
}
