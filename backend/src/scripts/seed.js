import crypto from "node:crypto";
import { ObjectId } from "mongodb";
import { closeDatabaseConnection, connectToDatabase, getDb } from "../db.js";
import { hashPassword } from "../utils/auth.js";

const CATEGORIES = ["Anime", "Movie", "TV Show"];
const STATUSES = ["Plan to Watch", "Watching", "Completed"];
const PLATFORMS = [
  "Netflix",
  "Hulu",
  "Disney+",
  "HBO Max",
  "Amazon Prime",
  "Apple TV+",
  "Crunchyroll",
  "Other",
];
const EMOJIS = ["🎬", "🎥", "🍿", "📺", "🎭", "🎞️", "🎦", "🌟"];

const MOVIES = [
  "The Dark Knight",
  "Inception",
  "Interstellar",
  "The Godfather",
  "Pulp Fiction",
  "Fight Club",
  "The Matrix",
  "Forrest Gump",
  "The Shawshank Redemption",
  "Goodfellas",
  "Schindler's List",
  "The Silence of the Lambs",
  "Parasite",
  "Spirited Away",
  "Dune",
  "Everything Everywhere All at Once",
  "The Batman",
  "Top Gun Maverick",
  "Avatar",
  "Oppenheimer",
  "Barbie",
  "The Whale",
  "Tár",
  "Aftersun",
  "Nope",
  "Get Out",
  "Us",
  "Midsommar",
  "Hereditary",
  "The Lighthouse",
  "The Favourite",
  "Roma",
  "1917",
  "Knives Out",
  "Glass Onion",
  "The Menu",
  "Triangle of Sadness",
  "Banshees of Inisherin",
];

const TV_SHOWS = [
  "Breaking Bad",
  "Game of Thrones",
  "The Wire",
  "The Sopranos",
  "Succession",
  "The Bear",
  "Severance",
  "Andor",
  "House of the Dragon",
  "The Last of Us",
  "White Lotus",
  "Euphoria",
  "Yellowstone",
  "Stranger Things",
  "Squid Game",
  "Wednesday",
  "Emily in Paris",
  "Bridgerton",
  "Ozark",
  "Better Call Saul",
  "Peaky Blinders",
  "Dark",
  "Money Heist",
  "Lupin",
  "The Crown",
  "Ted Lasso",
  "Abbott Elementary",
  "Only Murders in the Building",
  "Barry",
  "Atlanta",
];

const ANIME = [
  "Attack on Titan",
  "Demon Slayer",
  "Jujutsu Kaisen",
  "My Hero Academia",
  "One Piece",
  "Naruto Shippuden",
  "Death Note",
  "Fullmetal Alchemist Brotherhood",
  "Hunter x Hunter",
  "Spy x Family",
  "Chainsaw Man",
  "Vinland Saga",
  "Mob Psycho 100",
  "Cowboy Bebop",
  "Steins;Gate",
  "Neon Genesis Evangelion",
  "Sword Art Online",
  "Dragon Ball Z",
  "Tokyo Ghoul",
  "Bleach",
  "Black Clover",
  "Re:Zero",
  "That Time I Got Reincarnated",
  "Overlord",
  "Violet Evergarden",
  "Your Lie in April",
  "A Silent Voice",
  "Weathering With You",
];

const FIRST_NAMES = [
  "Alex",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Avery",
  "Quinn",
  "Peyton",
  "Reese",
  "Hayden",
  "Cameron",
  "Dakota",
  "Sage",
  "River",
  "Phoenix",
  "Blake",
  "Drew",
  "Jamie",
  "Logan",
  "Sam",
  "Charlie",
  "Finley",
  "Emery",
];

const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Wilson",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
  "Thompson",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Green",
  "Baker",
];

const GROUP_PREFIXES = [
  "The",
  "Squad",
  "Club",
  "Crew",
  "Gang",
  "Circle",
  "Team",
];
const GROUP_THEMES = [
  "Movie Buffs",
  "Anime Lovers",
  "Binge Watchers",
  "Film Critics",
  "Stream Squad",
  "Night Owls",
  "Weekend Warriors",
  "Couch Potatoes",
  "Screen Addicts",
  "Watch Party",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateJoinCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

function getTitlesForCategory(category) {
  if (category === "Anime") return ANIME;
  if (category === "Movie") return MOVIES;
  return TV_SHOWS;
}

async function seed() {
  await connectToDatabase();
  const db = getDb();

  const users = db.collection("users");
  const watchlist = db.collection("watchlist");
  const groups = db.collection("groups");

  // Clear existing synthetic data (keep real user accounts)
  console.log("Clearing previous seed data...");
  await users.deleteMany({ isSeed: true });
  await watchlist.deleteMany({ isSeed: true });
  await groups.deleteMany({ isSeed: true });

  // Create 30 seed users
  console.log("Creating 30 users...");
  const passwordHash = hashPassword("password123");
  const seedUsers = [];

  for (let i = 0; i < 30; i++) {
    const firstName = randomFrom(FIRST_NAMES);
    const lastName = randomFrom(LAST_NAMES);
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`;
    seedUsers.push({
      username,
      email: `${username}@example.com`,
      displayName: `${firstName} ${lastName}`,
      passwordHash,
      isSeed: true,
      createdAt: new Date(Date.now() - randomInt(0, 90) * 86400000),
    });
  }

  const insertedUsers = await users.insertMany(seedUsers);
  const userIds = Object.values(insertedUsers.insertedIds);
  const userDocs = seedUsers.map((u, i) => ({ ...u, _id: userIds[i] }));
  console.log(`  Created ${userIds.length} users.`);

  // Create 800 watchlist items (spread across users)
  console.log("Creating 800 watchlist items...");
  const watchlistItems = [];

  for (let i = 0; i < 800; i++) {
    const user = randomFrom(userDocs);
    const category = randomFrom(CATEGORIES);
    const titles = getTitlesForCategory(category);
    const title = randomFrom(titles);
    const status = randomFrom(STATUSES);

    watchlistItems.push({
      ownerId: String(user._id),
      title,
      normalizedTitle: title.trim().toLowerCase().replace(/\s+/g, " "),
      category,
      status,
      platform: randomFrom(PLATFORMS),
      rating: status === "Completed" ? String(randomInt(1, 10)) : "",
      notes: "",
      posterUrl: "",
      episodeProgress: status === "Watching" ? String(randomInt(1, 24)) : "",
      isSeed: true,
      createdAt: new Date(Date.now() - randomInt(0, 180) * 86400000),
      updatedAt: new Date(Date.now() - randomInt(0, 30) * 86400000),
    });
  }

  await watchlist.insertMany(watchlistItems);
  console.log(`  Created 800 watchlist items.`);

  // Create 50 groups with recommendations
  console.log("Creating 50 groups with recommendations...");
  const groupDocs = [];

  for (let i = 0; i < 50; i++) {
    const owner = randomFrom(userDocs);
    const memberCount = randomInt(2, 8);
    const members = [{ userId: String(owner._id), username: owner.username }];

    for (let m = 0; m < memberCount - 1; m++) {
      const member = randomFrom(userDocs);
      if (!members.find((x) => x.userId === String(member._id))) {
        members.push({ userId: String(member._id), username: member.username });
      }
    }

    const recCount = randomInt(3, 10);
    const recommendations = [];

    for (let r = 0; r < recCount; r++) {
      const category = randomFrom(CATEGORIES);
      const titles = getTitlesForCategory(category);
      const recommender = randomFrom(members);
      recommendations.push({
        _id: new ObjectId(),
        title: randomFrom(titles),
        category,
        platform: randomFrom(PLATFORMS),
        rating: randomInt(1, 10),
        posterUrl: "",
        addedBy: recommender.username,
        votes: [],
        votesUp: randomInt(0, 5),
        votesDown: randomInt(0, 2),
        comments: [],
        createdAt: new Date(Date.now() - randomInt(0, 60) * 86400000),
      });
    }

    groupDocs.push({
      groupName: `${randomFrom(GROUP_PREFIXES)} ${randomFrom(GROUP_THEMES)} ${i + 1}`,
      description: "A group for watching great content together.",
      groupEmoji: randomFrom(EMOJIS),
      joinCode: generateJoinCode(),
      ownerId: String(owner._id),
      ownerName: owner.displayName,
      members,
      recommendations,
      isSeed: true,
      createdAt: new Date(Date.now() - randomInt(0, 120) * 86400000),
    });
  }

  await groups.insertMany(groupDocs);
  console.log(`  Created 50 groups.`);

  // Count totals
  const totalUsers = await users.countDocuments({ isSeed: true });
  const totalWatchlist = await watchlist.countDocuments({ isSeed: true });
  const totalGroups = await groups.countDocuments({ isSeed: true });
  const grandTotal = totalUsers + totalWatchlist + totalGroups;

  console.log("\nSeed complete!");
  console.log(`  Users:          ${totalUsers}`);
  console.log(`  Watchlist items: ${totalWatchlist}`);
  console.log(`  Groups:         ${totalGroups}`);
  console.log(`  Total records:  ${grandTotal}`);
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => closeDatabaseConnection());
