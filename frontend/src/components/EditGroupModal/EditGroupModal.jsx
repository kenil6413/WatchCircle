import { useEffect } from "react";
import PropTypes from "prop-types";
import "./EditGroupModal.css";

const emojiOptions = ["🎬", "🏠", "🎌", "📺", "👻", "⭐", "🔥", "🍿"];

export default function EditGroupModal({
  canDelete,
  canLeave,
  dangerErrorMessage,
  eyebrow,
  errorMessage,
  formData,
  isOpen,
  isSubmitting,
  onDelete,
  onChange,
  onClose,
  onLeave,
  onSubmit,
  submitLabel,
  title,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const modal = document.querySelector(".edit-group-modal");
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
        const m = document.querySelector(".edit-group-modal");
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
      className="edit-group-modal__backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="edit-group-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="edit-group-modal__header">
          <div>
            <p className="edit-group-modal__eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button
            type="button"
            className="edit-group-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form className="edit-group-modal__form" onSubmit={onSubmit}>
          <label className="edit-group-modal__field">
            <span>Group name</span>
            <input
              required
              type="text"
              name="groupName"
              value={formData.groupName}
              onChange={onChange}
            />
          </label>

          <label className="edit-group-modal__field">
            <span>Description</span>
            <textarea
              required
              name="description"
              rows="4"
              value={formData.description}
              onChange={onChange}
            />
          </label>

          <div className="edit-group-modal__field">
            <span>Emoji</span>
            <div className="edit-group-modal__emoji-grid">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={
                    formData.groupEmoji === emoji
                      ? "edit-group-modal__emoji edit-group-modal__emoji--active"
                      : "edit-group-modal__emoji"
                  }
                  onClick={() =>
                    onChange({
                      target: {
                        name: "groupEmoji",
                        value: emoji,
                      },
                    })
                  }
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {errorMessage ? (
            <p className="edit-group-modal__error">{errorMessage}</p>
          ) : null}

          {canDelete || canLeave ? (
            <div className="edit-group-modal__danger">
              <div className="edit-group-modal__danger-header">
                <p className="edit-group-modal__danger-title">Group access</p>
                <p className="edit-group-modal__danger-copy">
                  Manage your membership here. Destructive actions stay separate
                  from the main save controls.
                </p>
              </div>
              <div className="edit-group-modal__danger-actions">
                {canLeave ? (
                  <button
                    type="button"
                    className="edit-group-modal__button edit-group-modal__button--danger-secondary"
                    onClick={onLeave}
                  >
                    Leave group
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    className="edit-group-modal__button edit-group-modal__button--danger"
                    onClick={onDelete}
                  >
                    Delete group
                  </button>
                ) : null}
              </div>
              {dangerErrorMessage ? (
                <p className="edit-group-modal__error">{dangerErrorMessage}</p>
              ) : null}
            </div>
          ) : null}

          <div className="edit-group-modal__actions">
            <button
              type="button"
              className="edit-group-modal__button edit-group-modal__button--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="edit-group-modal__button edit-group-modal__button--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

EditGroupModal.propTypes = {
  canDelete: PropTypes.bool,
  canLeave: PropTypes.bool,
  dangerErrorMessage: PropTypes.string,
  eyebrow: PropTypes.string,
  errorMessage: PropTypes.string.isRequired,
  formData: PropTypes.shape({
    description: PropTypes.string.isRequired,
    groupEmoji: PropTypes.string.isRequired,
    groupName: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onDelete: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onLeave: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string,
  title: PropTypes.string,
};

EditGroupModal.defaultProps = {
  canDelete: false,
  canLeave: false,
  dangerErrorMessage: "",
  eyebrow: "Edit group",
  onDelete: undefined,
  onLeave: undefined,
  submitLabel: "Save changes",
  title: "Update your group",
};
