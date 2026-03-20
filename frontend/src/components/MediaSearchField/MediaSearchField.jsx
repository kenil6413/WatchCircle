import PropTypes from "prop-types";
import "./MediaSearchField.css";

export default function MediaSearchField({
  formData,
  mediaResults,
  mediaSearchStatus,
  onChange,
  onSelectMedia,
}) {
  return (
    <div className="media-search-field">
      <label className="media-search-field__field">
        <span>Title</span>
        <input
          required
          type="text"
          name="title"
          value={formData.title}
          placeholder="Start typing a movie, show, or anime"
          onChange={onChange}
        />
      </label>

      {formData.imdbRating ? (
        <p className="media-search-field__selected-meta">
          Selected title · IMDb {formData.imdbRating}
        </p>
      ) : null}

      {mediaSearchStatus ? (
        <p className="media-search-field__status">{mediaSearchStatus}</p>
      ) : null}

      {mediaResults.length > 0 ? (
        <div className="media-search-field__results">
          {mediaResults.map((result) => (
            <button
              key={result.imdbId}
              type="button"
              className="media-search-field__result"
              onClick={() => onSelectMedia(result)}
            >
              <div className="media-search-field__result-info">
                <strong>{result.title}</strong>
                <span>
                  {result.year} · IMDb {result.imdbRating || "N/A"}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

MediaSearchField.propTypes = {
  formData: PropTypes.shape({
    imdbRating: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  }).isRequired,
  mediaResults: PropTypes.arrayOf(
    PropTypes.shape({
      imdbId: PropTypes.string.isRequired,
      imdbRating: PropTypes.string,
      title: PropTypes.string.isRequired,
      year: PropTypes.string,
    })
  ).isRequired,
  mediaSearchStatus: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSelectMedia: PropTypes.func.isRequired,
};
