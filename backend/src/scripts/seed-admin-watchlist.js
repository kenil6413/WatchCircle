import { ObjectId } from "mongodb";
import {
  closeDatabaseConnection,
  connectToDatabase,
  getDatabaseName,
} from "../db.js";
import { hashPassword, normalizeEmail } from "../utils/auth.js";

const OMDB_API_BASE_URL = "https://www.omdbapi.com/";
const ADMIN_EMAIL = "admin@watchcircle.dev";
const ADMIN_PASSWORD = "123456";
const ADMIN_USERNAME = "admin";
const ADMIN_DISPLAY_NAME = "Admin";
const TARGET_COUNTS = {
  Anime: 320,
  Movie: 380,
  "TV Show": 300,
};

const statuses = ["Plan to Watch", "Watching", "Completed"];
const platforms = [
  "Netflix",
  "Prime Video",
  "Disney+",
  "Crunchyroll",
  "Hulu",
  "Max",
  "Other",
];

const animeQueries = [
  "anime",
  "naruto",
  "one piece",
  "bleach",
  "gundam",
  "pokemon",
  "dragon ball",
  "attack on titan",
  "death note",
  "demon slayer",
  "jujutsu kaisen",
  "my hero academia",
  "fullmetal alchemist",
  "haikyuu",
  "hunter x hunter",
  "code geass",
  "evangelion",
  "mob psycho",
  "vinland saga",
  "spy x family",
  "chainsaw man",
  "frieren",
  "sailor moon",
  "inuyasha",
  "digimon",
  "black clover",
  "fairy tail",
  "monster anime",
  "steins gate",
  "tokyo ghoul",
  "blue lock",
  "yugioh",
];

const movieQueries = [
  "movie",
  "film",
  "bollywood",
  "hindi",
  "shah rukh khan",
  "aamir khan",
  "ranbir kapoor",
  "hrithik roshan",
  "deepika padukone",
  "interstellar",
  "inception",
  "batman",
  "marvel",
  "mission impossible",
  "dune",
  "oppenheimer",
  "parasite",
  "la la land",
  "thriller",
  "action",
  "comedy",
  "romance",
  "drama",
  "classic movie",
  "oscar",
  "sci fi",
  "crime movie",
  "rrr",
  "jawan",
  "3 idiots",
  "queen",
  "barfi",
  "andhadhun",
  "lagaan",
  "swades",
  "tamasha",
  "wake up sid",
];

const tvShowQueries = [
  "series",
  "tv show",
  "game of thrones",
  "breaking bad",
  "better call saul",
  "succession",
  "the bear",
  "shogun",
  "sitcom",
  "drama series",
  "comedy series",
  "thriller series",
  "crime series",
  "fantasy series",
  "office",
  "friends",
  "stranger things",
  "dark",
  "severance",
  "panchayat",
  "mirzapur",
  "sacred games",
  "arcane",
  "house of the dragon",
  "the last of us",
  "detective series",
  "mini series",
  "hbo series",
  "netflix series",
  "prime series",
];

function getOmdbApiKey() {
  return (process.env.OMDB_API_KEY ?? "").trim();
}

function normalizeTitle(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

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

function buildEpisodeProgress(status, category) {
  if (status === "Plan to Watch" || category === "Movie") {
    return "";
  }

  return `${randomInt(1, 18)}/${randomInt(8, 24)}`;
}

function buildRating(status, imdbRating) {
  if (status === "Plan to Watch") {
    return null;
  }

  if (imdbRating) {
    return Number(imdbRating);
  }

  return Number((Math.random() * 4 + 6).toFixed(1));
}

function getSearchType(category) {
  if (category === "Movie") {
    return "movie";
  }

  if (category === "TV Show") {
    return "series";
  }

  return "";
}

async function fetchOmdbJson(params) {
  const response = await fetch(`${OMDB_API_BASE_URL}?${params}`);

  if (!response.ok) {
    throw new Error("OMDb request failed.");
  }

  return response.json();
}

async function searchTitles(query, category, page) {
  const params = new URLSearchParams({
    apikey: getOmdbApiKey(),
    s: query,
    page: String(page),
  });
  const searchType = getSearchType(category);

  if (searchType) {
    params.set("type", searchType);
  }

  const payload = await fetchOmdbJson(params);

  if (payload.Response === "False") {
    return [];
  }

  return payload.Search ?? [];
}

async function collectCatalogEntries(category, queries, targetCount) {
  const entries = [];
  const seenTitles = new Set();
  const seenImdbIds = new Set();

  for (const query of queries) {
    for (let page = 1; page <= 6; page += 1) {
      if (entries.length >= targetCount) {
        return entries;
      }

      const searchResults = await searchTitles(query, category, page);

      if (searchResults.length === 0) {
        break;
      }

      for (const result of searchResults) {
        if (entries.length >= targetCount) {
          return entries;
        }

        if (seenImdbIds.has(result.imdbID)) {
          continue;
        }

        if (!result.Poster || result.Poster === "N/A") {
          continue;
        }

        const titleKey = normalizeTitle(result.Title);

        if (seenTitles.has(titleKey)) {
          continue;
        }

        seenImdbIds.add(result.imdbID);
        seenTitles.add(titleKey);

        entries.push({
          title: result.Title,
          category,
          platform: randomItem(platforms),
          imdbId: result.imdbID,
          imdbRating: "",
          posterUrl: result.Poster,
        });
      }
    }
  }

  return entries;
}

function buildWatchlistItems(owner, catalogEntries) {
  return catalogEntries.map((entry) => {
    const status = randomItem(statuses);
    const createdAt = randomDateWithinLastYear();
    const updatedAt = new Date(
      createdAt.getTime() + randomInt(0, 45) * 24 * 60 * 60 * 1000
    );

    return {
      _id: new ObjectId(),
      ownerId: String(owner._id),
      ownerName: owner.displayName,
      title: entry.title,
      titleNormalized: normalizeTitle(entry.title),
      category: entry.category,
      platform: entry.platform,
      status,
      episodeProgress: buildEpisodeProgress(status, entry.category),
      rating: buildRating(status, entry.imdbRating),
      reviewNote: "",
      posterUrl: entry.posterUrl,
      imdbId: entry.imdbId,
      imdbRating: entry.imdbRating,
      createdAt,
      updatedAt,
    };
  });
}

async function upsertAdminUser(usersCollection) {
  const email = normalizeEmail(ADMIN_EMAIL);
  const existingUser = await usersCollection.findOne({ email });

  if (existingUser) {
    await usersCollection.updateOne(
      { _id: existingUser._id },
      {
        $set: {
          displayName: ADMIN_DISPLAY_NAME,
          username: ADMIN_USERNAME,
          email,
          passwordHash: hashPassword(ADMIN_PASSWORD),
          bio: "Demo admin account for seeded watchlist data.",
        },
      }
    );

    return usersCollection.findOne({ _id: existingUser._id });
  }

  const adminUser = {
    _id: new ObjectId(),
    displayName: ADMIN_DISPLAY_NAME,
    username: ADMIN_USERNAME,
    email,
    passwordHash: hashPassword(ADMIN_PASSWORD),
    bio: "Demo admin account for seeded watchlist data.",
    createdAt: new Date(),
  };

  await usersCollection.insertOne(adminUser);
  return adminUser;
}

async function seedAdminWatchlist() {
  const apiKey = getOmdbApiKey();

  if (!apiKey) {
    throw new Error("Missing OMDB_API_KEY in backend/.env.");
  }

  const database = await connectToDatabase();
  const usersCollection = database.collection("users");
  const watchlistCollection = database.collection("watchlist");

  const adminUser = await upsertAdminUser(usersCollection);
  const animeEntries = await collectCatalogEntries(
    "Anime",
    animeQueries,
    TARGET_COUNTS.Anime
  );
  const movieEntries = await collectCatalogEntries(
    "Movie",
    movieQueries,
    TARGET_COUNTS.Movie
  );
  const tvShowEntries = await collectCatalogEntries(
    "TV Show",
    tvShowQueries,
    TARGET_COUNTS["TV Show"]
  );

  const catalogEntries = [...animeEntries, ...movieEntries, ...tvShowEntries];
  const watchlistItems = buildWatchlistItems(adminUser, catalogEntries);

  await watchlistCollection.deleteMany({ ownerId: String(adminUser._id) });
  await watchlistCollection.insertMany(watchlistItems);

  console.log(`Seeded admin watchlist in "${getDatabaseName()}".`);
  console.log(`Admin email: ${ADMIN_EMAIL}`);
  console.log(`Admin password: ${ADMIN_PASSWORD}`);
  console.log(`Anime entries: ${animeEntries.length}`);
  console.log(`Movie entries: ${movieEntries.length}`);
  console.log(`TV Show entries: ${tvShowEntries.length}`);
  console.log(`Total watchlist items added: ${watchlistItems.length}`);
}

try {
  await seedAdminWatchlist();
} finally {
  await closeDatabaseConnection();
}
