import PropTypes from "prop-types";
import "./RecommendationSpotlight.css";

function formatTimestamp(value) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleString();
}

export default function RecommendationSpotlight({
  commentError,
  commentValue,
  currentUserId,
  groupName,
  isOpen,
  isSubmittingComment,
  isSubmittingWatchlist,
  onAddToWatchlist,
  onChangeComment,
  onClose,
  onSubmitComment,
  recommendation,
  watchlistMessage,
}) {
  if (!isOpen || !recommendation) {
    return null;
  }

  const activeVote = (recommendation.votes ?? []).find(
    (vote) => vote.userId === currentUserId
  );

  return (
    <div
      className="recommendation-spotlight__backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="recommendation-spotlight"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="recommendation-spotlight__header">
          <div>
            <p className="recommendation-spotlight__eyebrow">{groupName}</p>
            <h2>{recommendation.title}</h2>
            <p className="recommendation-spotlight__meta">
              Recommended by {recommendation.addedBy} ·{" "}
              {recommendation.platform}
            </p>
          </div>
          <button
            type="button"
            className="recommendation-spotlight__close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="recommendation-spotlight__body">
          <div className="recommendation-spotlight__summary">
            <span className="recommendation-spotlight__badge">
              {recommendation.category}
            </span>
            <span className="recommendation-spotlight__rating">
              ★ {recommendation.rating}
            </span>
            {recommendation.imdbRating ? (
              <span className="recommendation-spotlight__imdb">
                IMDb {recommendation.imdbRating}
              </span>
            ) : null}
            <span
              className={
                activeVote?.direction === "up"
                  ? "recommendation-spotlight__vote-chip recommendation-spotlight__vote-chip--up"
                  : "recommendation-spotlight__vote-chip"
              }
            >
              ▲ {recommendation.votesUp ?? 0}
            </span>
            <span
              className={
                activeVote?.direction === "down"
                  ? "recommendation-spotlight__vote-chip recommendation-spotlight__vote-chip--down"
                  : "recommendation-spotlight__vote-chip"
              }
            >
              ▼ {recommendation.votesDown ?? 0}
            </span>
          </div>

          <div className="recommendation-spotlight__watchlist-row">
            <button
              type="button"
              className="recommendation-spotlight__button recommendation-spotlight__button--watchlist"
              disabled={isSubmittingWatchlist}
              onClick={onAddToWatchlist}
            >
              {isSubmittingWatchlist ? "Adding..." : "Add to watchlist"}
            </button>
            <span className="recommendation-spotlight__watchlist-copy">
              It will be saved as Plan to Watch.
            </span>
          </div>

          {watchlistMessage ? (
            <p className="recommendation-spotlight__watchlist-message">
              {watchlistMessage}
            </p>
          ) : null}

          <section className="recommendation-spotlight__section">
            <h3>Note</h3>
            <p className="recommendation-spotlight__note">
              {recommendation.note}
            </p>
          </section>

          <section className="recommendation-spotlight__section">
            <h3>Comments</h3>
            <div className="recommendation-spotlight__comments">
              {(recommendation.comments ?? []).length === 0 ? (
                <p className="recommendation-spotlight__empty">
                  No comments yet. Start the discussion.
                </p>
              ) : (
                recommendation.comments.map((comment) => (
                  <article
                    key={
                      comment._id ?? `${comment.userId}-${comment.createdAt}`
                    }
                    className="recommendation-spotlight__comment"
                  >
                    <div className="recommendation-spotlight__comment-head">
                      <strong>{comment.displayName}</strong>
                      <span>{formatTimestamp(comment.createdAt)}</span>
                    </div>
                    <p>{comment.text}</p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        <form
          className="recommendation-spotlight__composer"
          onSubmit={onSubmitComment}
        >
          <textarea
            name="comment"
            rows="3"
            value={commentValue}
            placeholder="Add a comment..."
            onChange={onChangeComment}
          />
          {commentError ? (
            <p className="recommendation-spotlight__error">{commentError}</p>
          ) : null}
          <div className="recommendation-spotlight__composer-actions">
            <button
              type="button"
              className="recommendation-spotlight__button recommendation-spotlight__button--secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="submit"
              className="recommendation-spotlight__button recommendation-spotlight__button--primary"
              disabled={isSubmittingComment}
            >
              {isSubmittingComment ? "Posting..." : "Post comment"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

RecommendationSpotlight.propTypes = {
  commentError: PropTypes.string.isRequired,
  commentValue: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
  groupName: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  isSubmittingComment: PropTypes.bool.isRequired,
  isSubmittingWatchlist: PropTypes.bool.isRequired,
  onAddToWatchlist: PropTypes.func.isRequired,
  onChangeComment: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmitComment: PropTypes.func.isRequired,
  recommendation: PropTypes.shape({
    addedBy: PropTypes.string,
    category: PropTypes.string,
    comments: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string,
        createdAt: PropTypes.string,
        displayName: PropTypes.string,
        text: PropTypes.string,
        userId: PropTypes.string,
      })
    ),
    imdbRating: PropTypes.string,
    note: PropTypes.string,
    platform: PropTypes.string,
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
  }),
  watchlistMessage: PropTypes.string.isRequired,
};

RecommendationSpotlight.defaultProps = {
  recommendation: null,
};
