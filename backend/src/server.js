import app from "./app.js";
import {
  closeDatabaseConnection,
  connectToDatabase,
  getDatabaseName,
  port,
} from "./db.js";

async function startServer() {
  await connectToDatabase();
  console.log(`MongoDB connected to "${getDatabaseName()}".`);

  const server = app.listen(port, () => {
    console.log(`WatchCircle backend listening on http://localhost:${port}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down.`);

    server.close(async () => {
      await closeDatabaseConnection();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

startServer().catch(async (error) => {
  console.error(`Failed to start backend: ${error.message}`);
  await closeDatabaseConnection();
  process.exit(1);
});
