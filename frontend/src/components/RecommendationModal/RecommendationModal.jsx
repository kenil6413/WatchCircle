import { useEffect } from "react";
import PropTypes from "prop-types";
import MediaSearchField from "../MediaSearchField/MediaSearchField.jsx";
import "./RecommendationModal.css";

const categoryOptions = ["Anime", "Movie", "TV Show"];

export default function RecommendationModal({
  errorMessage,
  formData,
  isOpen,
  isSubmitting,
  mediaResults,
  mediaSearchStatus,
  onChange,
  onClose,
  onSelectMedia,
  onSubmit,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const modal = document.querySelector(".recommendation-modal");
    if (modal) {
      const first = modal.querySelector(
        "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])"
      );
      first?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const m = document.querySelector(".recommendation-modal");
        if (!m) return;
        const focusable = Array.from(
          m.querySelectorAll(
            "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])"
          )
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const isInside = m.contains(document.activeElement);
        if (!isInside || (!e.shiftKey && document.activeElement === last)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="recommendation-modal__backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="recommendation-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="recommendation-modal__header">
          <div>
            <p className="recommendation-modal__eyebrow">Add recommendation</p>
            <h2>Push something worth watching</h2>
          </div>
          <button
            type="button"
            className="recommendation-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form className="recommendation-modal__form" onSubmit={onSubmit}>
          <MediaSearchField
            formData={formData}
            mediaResults={mediaResults}
            mediaSearchStatus={mediaSearchStatus}
            onChange={onChange}
            onSelectMedia={onSelectMedia}
          />

          <div className="recommendation-modal__row">
            <label className="recommendation-modal__field">
              <span>Category</span>
              <select
                name="category"
                value={formData.category}
                onChange={onChange}
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="recommendation-modal__field">
              <span>Rating</span>
              <input
                required
                type="number"
                name="rating"
                min="1"
                max="10"
                step="0.1"
                value={formData.rating}
                placeholder="8.5"
                onChange={onChange}
              />
              {formData.imdbRating ? (
                <small className="recommendation-modal__hint">
                  IMDb: {formData.imdbRating}
                </small>
              ) : null}
            </label>
          </div>

          <label className="recommendation-modal__field">
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

          <label className="recommendation-modal__field">
            <span>Note</span>
            <textarea
              required
              name="note"
              rows="4"
              value={formData.note}
              placeholder="Why should the group watch this?"
              onChange={onChange}
            />
          </label>

          {errorMessage ? (
            <p className="recommendation-modal__error">{errorMessage}</p>
          ) : null}

          <div className="recommendation-modal__actions">
            <button
              type="button"
              className="recommendation-modal__button recommendation-modal__button--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="recommendation-modal__button recommendation-modal__button--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Add recommendation"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

RecommendationModal.propTypes = {
  errorMessage: PropTypes.string.isRequired,
  formData: PropTypes.shape({
    category: PropTypes.string.isRequired,
    imdbId: PropTypes.string.isRequired,
    imdbRating: PropTypes.string.isRequired,
    note: PropTypes.string.isRequired,
    platform: PropTypes.string.isRequired,
    posterUrl: PropTypes.string.isRequired,
    rating: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  mediaResults: PropTypes.arrayOf(
    PropTypes.shape({
      imdbId: PropTypes.string.isRequired,
      imdbRating: PropTypes.string,
      posterUrl: PropTypes.string,
      title: PropTypes.string.isRequired,
      year: PropTypes.string,
    })
  ).isRequired,
  mediaSearchStatus: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectMedia: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
