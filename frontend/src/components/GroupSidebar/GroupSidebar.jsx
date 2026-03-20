import PropTypes from "prop-types";
import "./GroupSidebar.css";

export default function GroupSidebar({
  groups,
  groupError,
  groupSuccess,
  joinGroupForm,
  onJoinGroup,
  onJoinGroupChange,
  onOpenCreateGroup,
  onSelectGroup,
  selectedGroupId,
}) {
  return (
    <aside className="group-sidebar">
      <div className="group-sidebar__top">
        <button
          type="button"
          className="group-sidebar__new-button"
          onClick={onOpenCreateGroup}
        >
          + Create new group
        </button>

        <form className="group-sidebar__join-row" onSubmit={onJoinGroup}>
          <input
            required
            type="text"
            name="joinCode"
            maxLength="6"
            value={joinGroupForm.joinCode}
            placeholder="Join with code"
            onChange={onJoinGroupChange}
          />
          <button type="submit">Join</button>
        </form>

        {groupError ? (
          <p className="group-sidebar__error">{groupError}</p>
        ) : null}
        {groupSuccess ? (
          <p className="group-sidebar__success">{groupSuccess}</p>
        ) : null}
      </div>

      <div className="group-sidebar__list">
        <p className="group-sidebar__label">Your groups</p>

        {groups.length === 0 ? (
          <div className="group-sidebar__empty">
            Create your first group or join one using a code.
          </div>
        ) : (
          groups.map((group) => (
            <button
              key={group._id}
              type="button"
              className={
                group._id === selectedGroupId
                  ? "group-sidebar__row group-sidebar__row--active"
                  : "group-sidebar__row"
              }
              onClick={() => onSelectGroup(group._id)}
            >
              <div className="group-sidebar__icon">
                {group.groupEmoji || "🎬"}
              </div>
              <div className="group-sidebar__info">
                <span className="group-sidebar__name">{group.groupName}</span>
                <span className="group-sidebar__meta">
                  {group.members.length} members ·{" "}
                  {group.recommendations.length} recs
                </span>
              </div>
              <span className="group-sidebar__badge">
                {group.recommendations.length}
              </span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

GroupSidebar.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      groupEmoji: PropTypes.string,
      groupName: PropTypes.string.isRequired,
      members: PropTypes.arrayOf(PropTypes.object).isRequired,
      recommendations: PropTypes.arrayOf(PropTypes.object).isRequired,
    })
  ).isRequired,
  groupError: PropTypes.string.isRequired,
  groupSuccess: PropTypes.string.isRequired,
  joinGroupForm: PropTypes.shape({
    joinCode: PropTypes.string.isRequired,
  }).isRequired,
  onJoinGroup: PropTypes.func.isRequired,
  onJoinGroupChange: PropTypes.func.isRequired,
  onOpenCreateGroup: PropTypes.func.isRequired,
  onSelectGroup: PropTypes.func.isRequired,
  selectedGroupId: PropTypes.string,
};

GroupSidebar.defaultProps = {
  selectedGroupId: "",
};
