import {
  closeDatabaseConnection,
  connectToDatabase,
  getDatabaseName,
  isDatabaseConnected,
} from "../db.js";

try {
  await connectToDatabase();

  console.log(`MongoDB setup complete for "${getDatabaseName()}".`);
  console.log(
    `Connection status: ${isDatabaseConnected() ? "connected" : "disconnected"}`
  );
  console.log("Collections ready: users, groups, watchlist");
  console.log(
    "Indexes ready for usernames, emails, group names, join codes, dates, title, category, platform, and status."
  );
} finally {
  await closeDatabaseConnection();
}
