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
  const sortedRecommendations = [...group.recommendations].sort(
    (firstItem, secondItem) =>
      new Date(secondItem.createdAt ?? 0).getTime() -
      new Date(firstItem.createdAt ?? 0).getTime()
  );

  return sortedRecommendations.filter((recommendation) => {
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

  useEffect(() => {
    setSearchValue("");
  }, [group?._id]);

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
        <span className="group-detail__filter-label">Categories</span>
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

        <label className="group-detail__search">
          <input
            type="search"
            value={searchValue}
            placeholder="Search this group"
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </label>

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
            {visibleRecommendations.map((recommendation, index) => (
              <article
                key={recommendation._id ?? `${recommendation.title}-${index}`}
                className="group-detail__card"
              >
                <div
                  className="group-detail__card-poster"
                  onClick={() => onOpenRecommendation(recommendation._id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onOpenRecommendation(recommendation._id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {isRecommendationEditMode && isOwner ? (
                    <button
                      type="button"
                      className="group-detail__delete-recommendation"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemoveRecommendation(recommendation._id);
                      }}
                    >
                      ×
                    </button>
                  ) : null}
                  <span className={getCategoryClass(recommendation.category)}>
                    {recommendation.category ?? "Title"}
                  </span>
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
                </div>

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
