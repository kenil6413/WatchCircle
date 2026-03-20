import {
  closeDatabaseConnection,
  connectToDatabase,
  getDatabaseName,
} from "../db.js";
import { normalizeEmail } from "../utils/auth.js";

const ADMIN_EMAIL = "admin@watchcircle.dev";

function getPosterPalette(category) {
  if (category === "Anime") {
    return {
      backgroundTop: "#1e2f6b",
      backgroundBottom: "#0d122c",
      accent: "#a4b9ff",
      label: "ANIME",
    };
  }

  if (category === "TV Show") {
    return {
      backgroundTop: "#134b39",
      backgroundBottom: "#091f19",
      accent: "#78f0be",
      label: "TV SHOW",
    };
  }

  return {
    backgroundTop: "#5a2517",
    backgroundBottom: "#1b0f0a",
    accent: "#ffb38d",
    label: "MOVIE",
  };
}

function escapeSvgText(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function splitTitle(title) {
  const words = title.split(/\s+/).filter(Boolean);

  if (words.length <= 2) {
    return [title];
  }

  const midpoint = Math.ceil(words.length / 2);
  return [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")];
}

function createPosterDataUrl(title, category) {
  const palette = getPosterPalette(category);
  const titleLines = splitTitle(title).slice(0, 2);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
      <defs>
        <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${palette.backgroundTop}" />
          <stop offset="100%" stop-color="${palette.backgroundBottom}" />
        </linearGradient>
      </defs>
      <rect width="600" height="900" fill="url(#bg)" rx="32" />
      <circle cx="510" cy="120" r="90" fill="${palette.accent}" opacity="0.14" />
      <circle cx="120" cy="760" r="130" fill="${palette.accent}" opacity="0.1" />
      <rect x="48" y="48" width="190" height="48" rx="24" fill="rgba(13,13,13,0.35)" />
      <text x="72" y="80" fill="${palette.accent}" font-size="26" font-family="Arial, Helvetica, sans-serif" font-weight="700">${palette.label}</text>
      <text x="52" y="640" fill="#f5f5f5" font-size="54" font-family="Arial, Helvetica, sans-serif" font-weight="700">${escapeSvgText(titleLines[0] ?? "")}</text>
      <text x="52" y="708" fill="#f5f5f5" font-size="54" font-family="Arial, Helvetica, sans-serif" font-weight="700">${escapeSvgText(titleLines[1] ?? "")}</text>
      <text x="52" y="828" fill="rgba(255,255,255,0.68)" font-size="24" font-family="Arial, Helvetica, sans-serif">WatchCircle Library</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

async function fillAdminWatchlistPosters() {
  const database = await connectToDatabase();
  const usersCollection = database.collection("users");
  const watchlistCollection = database.collection("watchlist");
  const adminUser = await usersCollection.findOne({
    email: normalizeEmail(ADMIN_EMAIL),
  });

  if (!adminUser) {
    throw new Error("Admin user not found. Seed the admin watchlist first.");
  }

  const watchlistItems = await watchlistCollection
    .find({ ownerId: String(adminUser._id) })
    .toArray();

  if (watchlistItems.length === 0) {
    throw new Error(
      "Admin watchlist is empty. Seed it before filling posters."
    );
  }

  await Promise.all(
    watchlistItems.map((item) =>
      watchlistCollection.updateOne(
        { _id: item._id },
        {
          $set: {
            posterUrl: createPosterDataUrl(item.title, item.category),
          },
        }
      )
    )
  );

  console.log(`Updated posters for admin watchlist in "${getDatabaseName()}".`);
  console.log(`Items updated: ${watchlistItems.length}`);
}

try {
  await fillAdminWatchlistPosters();
} finally {
  await closeDatabaseConnection();
}
