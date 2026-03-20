import { Router } from "express";

const router = Router();
const OMDB_API_BASE_URL = "https://www.omdbapi.com/";

function createHttpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getOmdbApiKey() {
  return (process.env.OMDB_API_KEY ?? "").trim();
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

function normalizePosterUrl(poster) {
  return poster && poster !== "N/A" ? poster : "";
}

function normalizeImdbRating(rating) {
  if (!rating || rating === "N/A") {
    return "";
  }

  return rating;
}

function normalizeResult(searchResult, details) {
  return {
    imdbId: searchResult.imdbID,
    title: searchResult.Title,
    year: searchResult.Year,
    type: searchResult.Type,
    posterUrl: normalizePosterUrl(details?.Poster ?? searchResult.Poster),
    imdbRating: normalizeImdbRating(details?.imdbRating),
  };
}

function isEmptySearchError(errorMessage) {
  return (
    errorMessage === "Movie not found!" ||
    errorMessage === "Series not found!" ||
    errorMessage === "Episode not found!"
  );
}

router.get("/search", async (req, res, next) => {
  try {
    const apiKey = getOmdbApiKey();
    const query = (req.query.q ?? "").trim();
    const category = (req.query.category ?? "").trim();

    if (!apiKey) {
      throw createHttpError("Missing OMDB_API_KEY in backend/.env.", 500);
    }

    if (query.length < 2) {
      res.json([]);
      return;
    }

    const searchParams = new URLSearchParams({
      apikey: apiKey,
      s: query,
    });
    const searchType = getSearchType(category);

    if (searchType) {
      searchParams.set("type", searchType);
    }

    const response = await fetch(`${OMDB_API_BASE_URL}?${searchParams}`);

    if (!response.ok) {
      throw createHttpError("OMDb search request failed.", 502);
    }

    const payload = await response.json();

    if (payload.Response === "False") {
      if (isEmptySearchError(payload.Error)) {
        res.json([]);
        return;
      }

      throw createHttpError(payload.Error || "OMDb search failed.", 502);
    }

    const topMatches = (payload.Search ?? []).slice(0, 6);
    const detailedResults = await Promise.all(
      topMatches.map(async (result) => {
        try {
          const detailParams = new URLSearchParams({
            apikey: apiKey,
            i: result.imdbID,
          });
          const detailResponse = await fetch(
            `${OMDB_API_BASE_URL}?${detailParams}`
          );

          if (!detailResponse.ok) {
            return normalizeResult(result, null);
          }

          const detailPayload = await detailResponse.json();

          if (detailPayload.Response === "False") {
            return normalizeResult(result, null);
          }

          return normalizeResult(result, detailPayload);
        } catch {
          return normalizeResult(result, null);
        }
      })
    );

    res.json(detailedResults);
  } catch (error) {
    next(error);
  }
});

export default router;
