import PropTypes from "prop-types";
import "./StatCard.css";

export default function StatCard({ value, label, highlight }) {
  return (
    <article className="stat-card">
      <strong
        className={
          highlight
            ? "stat-card__value stat-card__value--highlight"
            : "stat-card__value"
        }
      >
        {value}
      </strong>
      <span className="stat-card__label">{label}</span>
    </article>
  );
}

StatCard.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  highlight: PropTypes.bool,
};

StatCard.defaultProps = {
  highlight: false,
};
