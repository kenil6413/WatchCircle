import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import StatCard from "../StatCard/StatCard.jsx";
import "./WatchlistPage.css";

const STATUS_OPTIONS = ["All", "Plan to Watch", "Watching", "Completed"];
const CATEGORY_OPTIONS = ["All", "Anime", "Movie", "TV Show"];
const SORT_OPTIONS = ["Newest added", "Oldest added", "Recently updated"];
const PAGE_SIZE = 15;

function getStatusClass(status) {
  if (status === "Watching") {
    return "watchlist-page__status watchlist-page__status--watching";
  }

  if (status === "Completed") {
    return "watchlist-page__status watchlist-page__status--completed";
  }

  return "watchlist-page__status watchlist-page__status--planned";
}

function getFallbackEmoji(category) {
  if (category === "Anime") {
    return "🎌";
  }

  if (category === "TV Show") {
    return "📺";
  }

  return "🎬";
}

export default function WatchlistPage({
  items,
  stats,
  isLoading,
  onAddItem,
  onDeleteItem,
  onEditItem,
  notification,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Newest added");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, categoryFilter, statusFilter, platformFilter, sortOption]);

  const platformOptions = useMemo(() => {
    return [
      "All",
      ...new Set(
        items.map((item) => item.platform).filter((platform) => platform)
      ),
    ];
  }, [items]);

  const filteredItems = useMemo(() => {
    const nextItems = items.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.title.toLowerCase().includes(searchValue.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;
      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;
      const matchesPlatform =
        platformFilter === "All" || item.platform === platformFilter;

      return (
        matchesSearch && matchesCategory && matchesStatus && matchesPlatform
      );
    });

    nextItems.sort((firstItem, secondItem) => {
      if (sortOption === "Oldest added") {
        return (
          new Date(firstItem.createdAt).getTime() -
          new Date(secondItem.createdAt).getTime()
        );
      }

      if (sortOption === "Recently updated") {
        return (
          new Date(secondItem.updatedAt).getTime() -
          new Date(firstItem.updatedAt).getTime()
        );
      }

      return (
        new Date(secondItem.createdAt).getTime() -
        new Date(firstItem.createdAt).getTime()
      );
    });

    return nextItems;
  }, [
    items,
    searchValue,
    categoryFilter,
    statusFilter,
    platformFilter,
    sortOption,
  ]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const isFiltered =
    Boolean(searchValue) ||
    categoryFilter !== "All" ||
    statusFilter !== "All" ||
    platformFilter !== "All";

  return (
    <section className="watchlist-page">
      <div className="watchlist-page__hero">
        <div>
          <p className="watchlist-page__eyebrow">Personal watchlist</p>
          <h1>Track everything in one place</h1>
          <p className="watchlist-page__copy">
            Search, filter, update status, and keep quick notes on what you are
            watching.
          </p>
        </div>
        <button
          type="button"
          className="watchlist-page__add-button"
          onClick={onAddItem}
        >
          + Add title
        </button>
      </div>

      <div className="watchlist-page__stats">
        <StatCard value={stats.totalTitles} label="Total titles" highlight />
        <StatCard value={stats.watchingCount} label="Watching" />
        <StatCard value={stats.completedCount} label="Completed" />
        <StatCard value={stats.averageRating || "—"} label="Avg rating" />
      </div>

      <div className="watchlist-page__breakdown">
        {(stats.categoryBreakdown ?? []).map((item) => (
          <div key={item.category} className="watchlist-page__breakdown-pill">
            <span>{item.category}</span>
            <strong>{item.count}</strong>
          </div>
        ))}
      </div>

      {notification?.message ? (
        <div
          className={`watchlist-page__notification watchlist-page__notification--${notification.type}`}
        >
          {notification.message}
        </div>
      ) : null}

      <div className="watchlist-page__toolbar">
        <label className="watchlist-page__toolbar-item">
          <span className="watchlist-page__toolbar-label">Search</span>
          <input
            type="search"
            value={searchValue}
            placeholder="Search your watchlist"
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </label>

        <label className="watchlist-page__toolbar-item">
          <span className="watchlist-page__toolbar-label">Category</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "Movie" ? "Movies" : option}
              </option>
            ))}
          </select>
        </label>

        <label className="watchlist-page__toolbar-item">
          <span className="watchlist-page__toolbar-label">Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="watchlist-page__toolbar-item">
          <span className="watchlist-page__toolbar-label">Platform</span>
          <select
            value={platformFilter}
            onChange={(event) => setPlatformFilter(event.target.value)}
          >
            {platformOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="watchlist-page__toolbar-item">
          <span className="watchlist-page__toolbar-label">Sort by</span>
          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!isLoading && isFiltered ? (
        <p className="watchlist-page__result-count">
          {filteredItems.length}{" "}
          {filteredItems.length === 1 ? "title" : "titles"} found
        </p>
      ) : null}

      {isLoading ? (
        <div className="watchlist-page__empty">
          <div className="watchlist-page__empty-ring">⌛</div>
          <p>Loading your watchlist.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="watchlist-page__empty">
          <div className="watchlist-page__empty-ring">🎞</div>
          <p>
            {items.length === 0
              ? "Your watchlist is empty. Add the first title."
              : "No titles match the current filters."}
          </p>
        </div>
      ) : (
        <>
          <div className="watchlist-page__grid">
            {paginatedItems.map((item) => (
              <article key={item._id} className="watchlist-page__card">
                <div className="watchlist-page__poster">
                  <span className={getStatusClass(item.status)}>
                    {item.status}
                  </span>
                  {item.rating ? (
                    <span className="watchlist-page__rating">
                      ★ {item.rating}
                    </span>
                  ) : null}
                  {item.posterUrl ? (
                    <img src={item.posterUrl} alt={`${item.title} poster`} />
                  ) : (
                    <div className="watchlist-page__poster-fallback">
                      {getFallbackEmoji(item.category)}
                    </div>
                  )}
                </div>

                <div className="watchlist-page__card-body">
                  <h2>{item.title}</h2>
                  <p className="watchlist-page__meta">
                    {item.platform} · {item.category}
                  </p>
                  <p className="watchlist-page__progress">
                    {item.episodeProgress
                      ? `Progress: ${item.episodeProgress}`
                      : "Progress not set"}
                  </p>
                  {item.reviewNote ? (
                    <p className="watchlist-page__note">{item.reviewNote}</p>
                  ) : null}
                  <div className="watchlist-page__card-actions">
                    <button type="button" onClick={() => onEditItem(item)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => onDeleteItem(item._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="watchlist-page__pagination">
              <button
                type="button"
                className="watchlist-page__page-button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span className="watchlist-page__page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="watchlist-page__page-button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

WatchlistPage.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      createdAt: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
      ]),
      episodeProgress: PropTypes.string,
      platform: PropTypes.string.isRequired,
      posterUrl: PropTypes.string,
      rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      reviewNote: PropTypes.string,
      status: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      updatedAt: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
      ]),
    })
  ).isRequired,
  notification: PropTypes.shape({
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["success", "error"]).isRequired,
  }),
  onAddItem: PropTypes.func.isRequired,
  onDeleteItem: PropTypes.func.isRequired,
  onEditItem: PropTypes.func.isRequired,
  stats: PropTypes.shape({
    averageRating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    categoryBreakdown: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
      })
    ),
    completedCount: PropTypes.number.isRequired,
    totalTitles: PropTypes.number.isRequired,
    watchingCount: PropTypes.number.isRequired,
  }).isRequired,
};

WatchlistPage.defaultProps = {
  notification: null,
};
