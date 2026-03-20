import express from "express";
import session from "express-session";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import passport, { configurePassport } from "./passport.js";
import authRouter from "./routes/auth.js";
import groupsRouter from "./routes/groups.js";
import healthRouter from "./routes/health.js";
import mediaRouter from "./routes/media.js";
import watchlistRouter from "./routes/watchlist.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
const sessionSecret =
  process.env.SESSION_SECRET?.trim() || "watchcircle-dev-session-secret";

const app = express();
configurePassport();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRouter);
app.use("/api/health", healthRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/media", mediaRouter);
app.use("/api/watchlist", watchlistRouter);

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }

    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found.",
  });
});

app.use((error, req, res, next) => {
  void req;
  void next;
  const status = error.status ?? 500;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: status === 500 ? "Unexpected server error." : error.message,
  });
});

export default app;
