import { ObjectId } from "mongodb";
import { Router } from "express";
import { getUsersCollection, getWatchlistCollection } from "../db.js";

const router = Router();
const ALLOWED_CATEGORIES = ["Anime", "Movie", "TV Show"];
const ALLOWED_STATUSES = ["Plan to Watch", "Watching", "Completed"];

function createHttpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function requireAuthenticatedUser(req) {
  if (!req.isAuthenticated?.() || !req.user) {
    throw createHttpError("You must be signed in.", 401);
  }

  return req.user;
}

function parseObjectId(id, label) {
  if (!ObjectId.isValid(id)) {
    throw createHttpError(`Invalid ${label}.`, 400);
  }

  return new ObjectId(id);
}

function normalizeTitle(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function sanitizeWatchlistItem(item) {
  return {
    ...item,
    _id: String(item._id),
    episodeProgress:
      item.episodeProgress === null || item.episodeProgress === undefined
        ? ""
        : String(item.episodeProgress),
  };
}

function buildWatchlistQuery(query) {
  const ownerId = (query.ownerId ?? "").trim();
  const category = (query.category ?? "").trim();
  const status = (query.status ?? "").trim();
  const platform = (query.platform ?? "").trim();
  const search = (query.search ?? "").trim();
  const filters = {};

  if (ownerId) {
    filters.ownerId = ownerId;
  }

  if (category && ALLOWED_CATEGORIES.includes(category)) {
    filters.category = category;
  }

  if (status && ALLOWED_STATUSES.includes(status)) {
    filters.status = status;
  }

  if (platform) {
    filters.platform = platform;
  }

  if (search) {
    filters.title = {
      $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  }

  return filters;
}

async function findOwner(ownerId) {
  return getUsersCollection().findOne({
    _id: parseObjectId(ownerId, "owner id"),
  });
}

async function findWatchlistItem(itemId) {
  return getWatchlistCollection().findOne({
    _id: parseObjectId(itemId, "watchlist item id"),
  });
}

function validateWatchlistPayload(body) {
  const title = (body.title ?? "").trim();
  const category = (body.category ?? "").trim();
  const platform = (body.platform ?? "").trim();
  const status = (body.status ?? "").trim();
  const episodeProgress = String(body.episodeProgress ?? "").trim();
  const ratingValue = String(body.rating ?? "").trim();
  const reviewNote = (body.reviewNote ?? "").trim();
  const posterUrl = (body.posterUrl ?? "").trim();
  const imdbId = (body.imdbId ?? "").trim();
  const imdbRating = (body.imdbRating ?? "").trim();
  const rating = ratingValue ? Number(ratingValue) : null;

  if (!title) {
    throw createHttpError("Title is required.", 400);
  }

  if (!ALLOWED_CATEGORIES.includes(category)) {
    throw createHttpError("Category must be Anime, Movie, or TV Show.", 400);
  }

  if (!platform) {
    throw createHttpError("Platform is required.", 400);
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    throw createHttpError(
      "Status must be Plan to Watch, Watching, or Completed.",
      400
    );
  }

  if (
    rating !== null &&
    (!Number.isFinite(rating) || rating < 1 || rating > 10)
  ) {
    throw createHttpError("Rating must be between 1 and 10.", 400);
  }

  return {
    title,
    category,
    platform,
    status,
    episodeProgress,
    rating,
    reviewNote,
    posterUrl,
    imdbId,
    imdbRating,
  };
}

router.get("/", async (req, res, next) => {
  try {
    const user = requireAuthenticatedUser(req);
    const watchlistItems = await getWatchlistCollection()
      .find(buildWatchlistQuery({ ...req.query, ownerId: String(user._id) }))
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray();

    res.json(watchlistItems.map(sanitizeWatchlistItem));
  } catch (error) {
    next(error);
  }
});

router.get("/stats", async (req, res, next) => {
  try {
    const user = requireAuthenticatedUser(req);
    const ownerId = String(user._id);

    const items = await getWatchlistCollection()
      .find({ ownerId }, { projection: { category: 1, rating: 1, status: 1 } })
      .toArray();

    const totalTitles = items.length;
    const watchingCount = items.filter(
      (item) => item.status === "Watching"
    ).length;
    const completedCount = items.filter(
      (item) => item.status === "Completed"
    ).length;
    const ratings = items
      .map((item) => item.rating)
      .filter((rating) => Number.isFinite(rating));
    const averageRating =
      ratings.length === 0
        ? 0
        : Number(
            (
              ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            ).toFixed(1)
          );

    const categoryBreakdown = ALLOWED_CATEGORIES.map((category) => ({
      category,
      count: items.filter((item) => item.category === category).length,
    }));

    res.json({
      totalTitles,
      watchingCount,
      completedCount,
      averageRating,
      categoryBreakdown,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const user = requireAuthenticatedUser(req);
    const ownerId = String(user._id);

    const owner = await findOwner(ownerId);

    if (!owner) {
      throw createHttpError("Owner not found.", 404);
    }

    const payload = validateWatchlistPayload(req.body);
    const duplicate = await getWatchlistCollection().findOne({
      ownerId,
      $or: [
        payload.imdbId ? { imdbId: payload.imdbId } : null,
        {
          titleNormalized: normalizeTitle(payload.title),
          category: payload.category,
        },
      ].filter(Boolean),
    });

    if (duplicate) {
      throw createHttpError("That title is already in your watchlist.", 409);
    }

    const now = new Date();
    const document = {
      ownerId,
      ownerName: owner.displayName,
      ...payload,
      titleNormalized: normalizeTitle(payload.title),
      createdAt: now,
      updatedAt: now,
    };

    const result = await getWatchlistCollection().insertOne(document);
    const createdItem = await getWatchlistCollection().findOne({
      _id: result.insertedId,
    });

    res.status(201).json({
      item: sanitizeWatchlistItem(createdItem),
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:itemId", async (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    const user = requireAuthenticatedUser(req);
    const ownerId = String(user._id);

    const existingItem = await findWatchlistItem(itemId);

    if (!existingItem) {
      throw createHttpError("Watchlist item not found.", 404);
    }

    if (existingItem.ownerId !== ownerId) {
      throw createHttpError("You can only edit your own watchlist items.", 403);
    }

    const payload = validateWatchlistPayload(req.body);
    const duplicate = await getWatchlistCollection().findOne({
      _id: { $ne: existingItem._id },
      ownerId,
      $or: [
        payload.imdbId ? { imdbId: payload.imdbId } : null,
        {
          titleNormalized: normalizeTitle(payload.title),
          category: payload.category,
        },
      ].filter(Boolean),
    });

    if (duplicate) {
      throw createHttpError("That title is already in your watchlist.", 409);
    }

    await getWatchlistCollection().updateOne(
      { _id: existingItem._id },
      {
        $set: {
          ...payload,
          titleNormalized: normalizeTitle(payload.title),
          updatedAt: new Date(),
        },
      }
    );

    const updatedItem = await getWatchlistCollection().findOne({
      _id: existingItem._id,
    });

    res.json({
      item: sanitizeWatchlistItem(updatedItem),
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:itemId", async (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    const user = requireAuthenticatedUser(req);
    const ownerId = String(user._id);

    const existingItem = await findWatchlistItem(itemId);

    if (!existingItem) {
      throw createHttpError("Watchlist item not found.", 404);
    }

    if (existingItem.ownerId !== ownerId) {
      throw createHttpError(
        "You can only delete your own watchlist items.",
        403
      );
    }

    await getWatchlistCollection().deleteOne({ _id: existingItem._id });

    res.json({
      deletedItemId: String(existingItem._id),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
