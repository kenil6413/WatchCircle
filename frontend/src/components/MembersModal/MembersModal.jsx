import { useEffect } from "react";
import PropTypes from "prop-types";
import "./MembersModal.css";

function matchesSearch(member, query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [member.displayName, member.username]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalizedQuery));
}

export default function MembersModal({
  currentUserId,
  group,
  isOpen,
  onClose,
  onRemoveMember,
  onSearchChange,
  searchValue,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !group) {
    return null;
  }

  const isOwner = group.ownerId === currentUserId;
  const visibleMembers = group.members.filter((member) =>
    matchesSearch(member, searchValue)
  );

  return (
    <div
      className="members-modal__backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="members-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="members-modal__header">
          <div>
            <p className="members-modal__eyebrow">Members</p>
            <h2>{group.groupName}</h2>
          </div>
          <button
            type="button"
            className="members-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="members-modal__toolbar">
          <input
            type="text"
            value={searchValue}
            placeholder="Search by username"
            onChange={onSearchChange}
          />
          <p className="members-modal__owner">
            Owner: {group.ownerName}
            {isOwner ? " (you)" : ""}
          </p>
        </div>

        <div className="members-modal__list">
          {visibleMembers.map((member) => {
            const canRemove =
              isOwner &&
              member.userId !== group.ownerId &&
              member.userId !== currentUserId;

            return (
              <div key={member.userId} className="members-modal__row">
                <div className="members-modal__identity">
                  <span className="members-modal__avatar">
                    {member.displayName.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <p className="members-modal__name">{member.displayName}</p>
                    <p className="members-modal__username">
                      @{member.username || member.displayName.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="members-modal__actions">
                  {member.userId === group.ownerId ? (
                    <span className="members-modal__role">Owner</span>
                  ) : null}

                  {canRemove ? (
                    <button
                      type="button"
                      className="members-modal__remove"
                      onClick={() => onRemoveMember(member.userId)}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

MembersModal.propTypes = {
  currentUserId: PropTypes.string.isRequired,
  group: PropTypes.shape({
    groupName: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        displayName: PropTypes.string.isRequired,
        userId: PropTypes.string.isRequired,
        username: PropTypes.string,
      })
    ).isRequired,
    ownerId: PropTypes.string.isRequired,
    ownerName: PropTypes.string.isRequired,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRemoveMember: PropTypes.func.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  searchValue: PropTypes.string.isRequired,
};

MembersModal.defaultProps = {
  group: null,
};
