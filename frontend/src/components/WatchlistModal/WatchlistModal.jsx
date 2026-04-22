import PropTypes from "prop-types";
import MediaSearchField from "../MediaSearchField/MediaSearchField.jsx";
import "./WatchlistModal.css";

const CATEGORY_OPTIONS = ["Anime", "Movie", "TV Show"];
const STATUS_OPTIONS = ["Plan to Watch", "Watching", "Completed"];

export default function WatchlistModal({
  errorMessage,
  formData,
  groups,
  isOpen,
  isShareSubmitting,
  isSubmitting,
  mediaResults,
  mediaSearchStatus,
  mode,
  onChange,
  onClose,
  onSelectMedia,
  onShareGroupChange,
  onShareToGroup,
  onSubmit,
  selectedGroupId,
  shareMessage,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="watchlist-modal__backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="watchlist-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="watchlist-modal__header">
          <div>
            <p className="watchlist-modal__eyebrow">Watchlist</p>
            <h2>{mode === "edit" ? "Update your entry" : "Add a title"}</h2>
          </div>
          <button
            type="button"
            className="watchlist-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <form className="watchlist-modal__form" onSubmit={onSubmit}>
          <MediaSearchField
            formData={formData}
            mediaResults={mediaResults}
            mediaSearchStatus={mediaSearchStatus}
            onChange={onChange}
            onSelectMedia={onSelectMedia}
          />

          <div className="watchlist-modal__row">
            <label className="watchlist-modal__field">
              <span>Category</span>
              <select
                name="category"
                value={formData.category}
                onChange={onChange}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="watchlist-modal__field">
              <span>Status</span>
              <select name="status" value={formData.status} onChange={onChange}>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="watchlist-modal__row">
            <label className="watchlist-modal__field">
              <span>Platform</span>
              <input
                required
                type="text"
                name="platform"
                value={formData.platform}
                placeholder="Netflix, Crunchyroll, Prime..."
                onChange={onChange}
              />
            </label>

            <label className="watchlist-modal__field">
              <span>Episode progress</span>
              <input
                type="text"
                name="episodeProgress"
                value={formData.episodeProgress}
                placeholder="e.g. 4/12"
                onChange={onChange}
              />
            </label>
          </div>

          <label className="watchlist-modal__field">
            <span>Rating</span>
            <input
              type="number"
              min="1"
              max="10"
              step="0.1"
              name="rating"
              value={formData.rating}
              placeholder="8.5"
              onChange={onChange}
            />
          </label>

          <label className="watchlist-modal__field">
            <span>Review note</span>
            <textarea
              name="reviewNote"
              rows="4"
              value={formData.reviewNote}
              placeholder="Keep a quick note for yourself"
              onChange={onChange}
            />
          </label>

          {mode === "edit" ? (
            <div className="watchlist-modal__share-box">
              <div className="watchlist-modal__share-head">
                <span>Share to a group</span>
                <p>Push this watchlist title into one of your groups.</p>
              </div>

              {groups.length === 0 ? (
                <p className="watchlist-modal__hint">
                  Create or join a group first.
                </p>
              ) : (
                <div className="watchlist-modal__share-actions">
                  <select value={selectedGroupId} onChange={onShareGroupChange}>
                    <option value="">Select a group</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.groupName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="watchlist-modal__button watchlist-modal__button--secondary"
                    disabled={isShareSubmitting}
                    onClick={onShareToGroup}
                  >
                    {isShareSubmitting ? "Sharing..." : "Share to group"}
                  </button>
                </div>
              )}

              {shareMessage ? (
                <p className="watchlist-modal__share-message">{shareMessage}</p>
              ) : null}
            </div>
          ) : null}

          {errorMessage ? (
            <p className="watchlist-modal__error">{errorMessage}</p>
          ) : null}

          <div className="watchlist-modal__actions">
            <button
              type="button"
              className="watchlist-modal__button watchlist-modal__button--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="watchlist-modal__button watchlist-modal__button--primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : mode === "edit"
                  ? "Save changes"
                  : "Add to watchlist"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

WatchlistModal.propTypes = {
  errorMessage: PropTypes.string.isRequired,
  formData: PropTypes.shape({
    category: PropTypes.string.isRequired,
    episodeProgress: PropTypes.string.isRequired,
    imdbId: PropTypes.string.isRequired,
    imdbRating: PropTypes.string.isRequired,
    platform: PropTypes.string.isRequired,
    posterUrl: PropTypes.string.isRequired,
    rating: PropTypes.string.isRequired,
    reviewNote: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      groupName: PropTypes.string.isRequired,
    })
  ).isRequired,
  isOpen: PropTypes.bool.isRequired,
  isShareSubmitting: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  mediaResults: PropTypes.arrayOf(
    PropTypes.shape({
      imdbId: PropTypes.string.isRequired,
      imdbRating: PropTypes.string,
      title: PropTypes.string.isRequired,
      year: PropTypes.string,
    })
  ).isRequired,
  mediaSearchStatus: PropTypes.string.isRequired,
  mode: PropTypes.oneOf(["create", "edit"]).isRequired,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectMedia: PropTypes.func.isRequired,
  onShareGroupChange: PropTypes.func.isRequired,
  onShareToGroup: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  selectedGroupId: PropTypes.string.isRequired,
  shareMessage: PropTypes.string.isRequired,
};
