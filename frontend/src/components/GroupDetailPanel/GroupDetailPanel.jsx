import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import "./GroupDetailPanel.css";

const CATEGORY_OPTIONS = [
  { value: "All", label: "All" },
  { value: "Anime", label: "Anime" },
  { value: "Movie", label: "Movies" },
  { value: "TV Show", label: "TV Shows" },
];

const CATEGORY_STYLE_MAP = {
  anime: "group-detail__category-badge--anime",
  movie: "group-detail__category-badge--movie",
  "tv show": "group-detail__category-badge--tv",
};

const CATEGORY_EMOJI_MAP = {
  anime: "🎌",
  movie: "🎬",
  "tv show": "📺",
};

const PAGE_SIZE = 15;

function getCategoryClass(category) {
  const normalizedCategory = (category ?? "").toLowerCase();
  const modifierClass = CATEGORY_STYLE_MAP[normalizedCategory];

  return modifierClass
    ? `group-detail__category-badge ${modifierClass}`
    : "group-detail__category-badge";
}

function getPosterEmoji(category) {
  return CATEGORY_EMOJI_MAP[(category ?? "").toLowerCase()] ?? "🎞";
}

function hasVote(votes, userId, direction) {
  return (votes ?? []).some(
    (vote) => vote.userId === userId && vote.direction === direction
  );
}

function getFilteredRecommendations(group, activeCategory, searchValue) {
  const sorted = [...group.recommendations].sort((a, b) => {
    const netA = (a.votesUp ?? 0) - (a.votesDown ?? 0);
    const netB = (b.votesUp ?? 0) - (b.votesDown ?? 0);
    if (netB !== netA) return netB - netA;
    return (
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime()
    );
  });

  return sorted.filter((recommendation) => {
    const matchesCategory =
      activeCategory === "All" || recommendation.category === activeCategory;
    const matchesSearch =
      !searchValue ||
      recommendation.title.toLowerCase().includes(searchValue.toLowerCase());

    return matchesCategory && matchesSearch;
  });
}

export default function GroupDetailPanel({
  activeCategory,
  copied,
  currentUserId,
  group,
  isRecommendationEditMode,
  onCopyCode,
  onEditGroup,
  onOpenGroupSettings,
  onOpenAddRecommendation,
  onOpenMembers,
  onOpenRecommendation,
  onRemoveRecommendation,
  onSelectCategory,
  onVoteRecommendation,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSearchValue("");
    setCurrentPage(1);
  }, [group?._id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchValue]);

  if (!group) {
    return (
      <section className="group-detail">
        <div className="group-detail__empty">
          <div className="group-detail__empty-ring">📭</div>
          <p>Select a group, create one, or join with a code.</p>
        </div>
      </section>
    );
  }

  const isOwner = group.ownerId === currentUserId;
  const visibleRecommendations = getFilteredRecommendations(
    group,
    activeCategory,
    searchValue
  );

  const totalPages = Math.ceil(visibleRecommendations.length / PAGE_SIZE);
  const paginatedRecommendations = visibleRecommendations.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const topRecommendationId =
    visibleRecommendations.length > 0 &&
    (visibleRecommendations[0].votesUp ?? 0) -
      (visibleRecommendations[0].votesDown ?? 0) >
      0
      ? visibleRecommendations[0]._id
      : null;

  const isFiltered = Boolean(searchValue) || activeCategory !== "All";

  return (
    <section className="group-detail">
      <div className="group-detail__header">
        <div className="group-detail__header-main">
          <div className="group-detail__identity">
            <div className="group-detail__icon">{group.groupEmoji || "🎬"}</div>
            <div className="group-detail__title-block">
              <h1>{group.groupName}</h1>
              <p>{group.description}</p>
              <span className="group-detail__owner">
                Owner: {group.ownerName}
                {isOwner ? " (you)" : ""}
              </span>
            </div>
          </div>

          <div className="group-detail__actions">
            <button
              type="button"
              className="group-detail__button group-detail__button--subtle"
              onClick={onOpenGroupSettings}
            >
              Group settings
            </button>
            {isOwner ? (
              <button
                type="button"
                className="group-detail__button group-detail__button--ghost"
                onClick={onEditGroup}
              >
                {isRecommendationEditMode ? "Done" : "Edit recs"}
              </button>
            ) : null}
            <button
              type="button"
              className="group-detail__button group-detail__button--red"
              onClick={onOpenAddRecommendation}
            >
              + Add rec
            </button>
          </div>
        </div>
      </div>

      <div className="group-detail__filters">
        <div className="group-detail__filter-group">
          <span className="group-detail__filter-label">Categories</span>
          <div className="group-detail__filter-pills">
            {CATEGORY_OPTIONS.map((category) => (
              <button
                key={category.value}
                type="button"
                className={
                  activeCategory === category.value
                    ? "group-detail__filter-pill group-detail__filter-pill--active"
                    : "group-detail__filter-pill"
                }
                onClick={() => onSelectCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <label className="group-detail__search">
          <span className="group-detail__search-label">Search</span>
          <input
            type="search"
            value={searchValue}
            placeholder="Search this group"
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </label>

        {isFiltered ? (
          <span className="group-detail__result-count">
            {visibleRecommendations.length}{" "}
            {visibleRecommendations.length === 1 ? "result" : "results"}
          </span>
        ) : null}

        <div className="group-detail__filters-meta">
          <button
            type="button"
            className="group-detail__pill-button"
            onClick={onOpenMembers}
          >
            <span className="group-detail__pill-label">Members</span>
            <span className="group-detail__pill-value">
              {group.members.length}
            </span>
          </button>
          <div className="group-detail__pill-button group-detail__pill-button--static">
            <span className="group-detail__pill-label">Recs</span>
            <span className="group-detail__pill-value">
              {group.recommendations.length}
            </span>
          </div>
          <button
            type="button"
            className="group-detail__pill-button group-detail__pill-button--code"
            onClick={() => onCopyCode(group.joinCode)}
          >
            <span className="group-detail__pill-label">Code</span>
            <span className="group-detail__pill-value group-detail__pill-value--mono">
              {group.joinCode}
            </span>
            <span className="group-detail__pill-copy">
              {copied ? "Copied" : "Copy"}
            </span>
          </button>
        </div>
      </div>

      {visibleRecommendations.length === 0 ? (
        <div className="group-detail__empty">
          <div className="group-detail__empty-ring">📭</div>
          <p>
            {group.recommendations.length === 0
              ? "No recommendations yet. Add the first one and the cards will appear here."
              : "No recommendations match this filter yet."}
          </p>
        </div>
      ) : (
        <div className="group-detail__content">
          <div className="group-detail__grid">
            {paginatedRecommendations.map((recommendation, index) => (
              <article
                key={recommendation._id ?? `${recommendation.title}-${index}`}
                className={
                  recommendation._id === topRecommendationId
                    ? "group-detail__card group-detail__card--top"
                    : "group-detail__card"
                }
              >
                {isRecommendationEditMode && isOwner ? (
                  <button
                    type="button"
                    className="group-detail__delete-recommendation"
                    aria-label="Remove recommendation"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemoveRecommendation(recommendation._id);
                    }}
                  >
                    ×
                  </button>
                ) : null}
                <button
                  type="button"
                  className="group-detail__card-poster"
                  onClick={() => onOpenRecommendation(recommendation._id)}
                >
                  <span className={getCategoryClass(recommendation.category)}>
                    {recommendation.category ?? "Title"}
                  </span>
                  {recommendation._id === topRecommendationId ? (
                    <span className="group-detail__top-badge">Top Pick</span>
                  ) : null}
                  {recommendation.posterUrl ? (
                    <img
                      className="group-detail__card-image"
                      src={recommendation.posterUrl}
                      alt={`${recommendation.title} poster`}
                    />
                  ) : (
                    <div className="group-detail__card-emoji">
                      {getPosterEmoji(recommendation.category)}
                    </div>
                  )}
                </button>

                <div className="group-detail__card-body">
                  <div className="group-detail__card-title-row">
                    <h2>{recommendation.title}</h2>
                    <span className="group-detail__inline-rating">
                      ★ {recommendation.rating ?? 0}
                    </span>
                  </div>
                  <p className="group-detail__card-meta">
                    Recommended by {recommendation.addedBy ?? group.ownerName}
                  </p>
                  <p className="group-detail__card-platform">
                    {recommendation.platform ?? "Unknown"}
                  </p>
                  <div className="group-detail__card-actions">
                    <button
                      type="button"
                      aria-label="Vote up"
                      className={
                        hasVote(recommendation.votes, currentUserId, "up")
                          ? "group-detail__vote-button group-detail__vote-button--active-up"
                          : "group-detail__vote-button"
                      }
                      onClick={() =>
                        onVoteRecommendation(recommendation._id, "up")
                      }
                    >
                      ▲ {recommendation.votesUp ?? 0}
                    </button>
                    <button
                      type="button"
                      aria-label="Vote down"
                      className={
                        hasVote(recommendation.votes, currentUserId, "down")
                          ? "group-detail__vote-button group-detail__vote-button--active-down"
                          : "group-detail__vote-button"
                      }
                      onClick={() =>
                        onVoteRecommendation(recommendation._id, "down")
                      }
                    >
                      ▼ {recommendation.votesDown ?? 0}
                    </button>
                    <button
                      type="button"
                      aria-label="View comments"
                      className="group-detail__comments-button"
                      onClick={() => onOpenRecommendation(recommendation._id)}
                    >
                      💬 {(recommendation.comments ?? []).length}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="group-detail__pagination">
              <button
                type="button"
                className="group-detail__page-button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span className="group-detail__page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="group-detail__page-button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

GroupDetailPanel.propTypes = {
  activeCategory: PropTypes.oneOf(["All", "Anime", "Movie", "TV Show"])
    .isRequired,
  copied: PropTypes.bool.isRequired,
  currentUserId: PropTypes.string.isRequired,
  group: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    groupEmoji: PropTypes.string,
    groupName: PropTypes.string.isRequired,
    joinCode: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        displayName: PropTypes.string.isRequired,
        userId: PropTypes.string.isRequired,
        username: PropTypes.string,
      })
    ).isRequired,
    ownerId: PropTypes.string.isRequired,
    ownerName: PropTypes.string.isRequired,
    recommendations: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        addedBy: PropTypes.string,
        category: PropTypes.string,
        comments: PropTypes.arrayOf(
          PropTypes.shape({
            _id: PropTypes.string,
            text: PropTypes.string,
            userId: PropTypes.string,
          })
        ),
        note: PropTypes.string,
        platform: PropTypes.string,
        posterUrl: PropTypes.string,
        rating: PropTypes.number,
        title: PropTypes.string,
        votes: PropTypes.arrayOf(
          PropTypes.shape({
            direction: PropTypes.string,
            userId: PropTypes.string,
          })
        ),
        votesDown: PropTypes.number,
        votesUp: PropTypes.number,
      })
    ).isRequired,
  }),
  isRecommendationEditMode: PropTypes.bool.isRequired,
  onCopyCode: PropTypes.func.isRequired,
  onEditGroup: PropTypes.func.isRequired,
  onOpenGroupSettings: PropTypes.func.isRequired,
  onOpenAddRecommendation: PropTypes.func.isRequired,
  onOpenMembers: PropTypes.func.isRequired,
  onOpenRecommendation: PropTypes.func.isRequired,
  onRemoveRecommendation: PropTypes.func.isRequired,
  onSelectCategory: PropTypes.func.isRequired,
  onVoteRecommendation: PropTypes.func.isRequired,
};

GroupDetailPanel.defaultProps = {
  group: null,
};
