import PropTypes from "prop-types";
import { useState } from "react";
import "./NavBar.css";

export default function NavBar({
  activeView,
  currentUserEmail,
  currentUserName,
  onChangePassword,
  onLogout,
  onNavigate,
  passwordChangeError,
  passwordChangeForm,
  passwordChangeSuccess,
  onPasswordChangeInput,
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);

  return (
    <header className="nav-bar">
      <button
        type="button"
        className="brand-button"
        onClick={() => onNavigate("watchlist")}
      >
        <span className="brand-button__watch">Watch</span>
        <span className="brand-button__circle">Circle</span>
      </button>

      <nav className="nav-bar__actions" aria-label="primary">
        <button
          type="button"
          className={
            activeView === "watchlist"
              ? "nav-pill nav-pill--active"
              : "nav-pill"
          }
          onClick={() => onNavigate("watchlist")}
        >
          Watchlist
        </button>
        <button
          type="button"
          className={
            activeView === "groups" ? "nav-pill nav-pill--active" : "nav-pill"
          }
          onClick={() => onNavigate("groups")}
        >
          Groups
        </button>
      </nav>
      <div className="profile-menu">
        <button
          type="button"
          className="profile-trigger"
          aria-label="Open profile menu"
          aria-expanded={isProfileMenuOpen}
          onClick={() => setIsProfileMenuOpen((currentState) => !currentState)}
        >
          <span className="profile-trigger__avatar" aria-hidden="true">
            {currentUserName.slice(0, 1).toUpperCase()}
          </span>
        </button>

        {isProfileMenuOpen ? (
          <div className="profile-dropdown">
            <p className="profile-dropdown__name">{currentUserName}</p>
            <p className="profile-dropdown__email">{currentUserEmail}</p>
            <button
              type="button"
              className="profile-dropdown__action"
              onClick={() =>
                setIsPasswordFormOpen((currentState) => !currentState)
              }
            >
              Change password
            </button>

            {isPasswordFormOpen ? (
              <form
                className="profile-dropdown__form"
                onSubmit={onChangePassword}
              >
                <input
                  required
                  type="password"
                  name="currentPassword"
                  value={passwordChangeForm.currentPassword}
                  placeholder="Current password"
                  onChange={onPasswordChangeInput}
                />
                <input
                  required
                  type="password"
                  name="newPassword"
                  value={passwordChangeForm.newPassword}
                  placeholder="New password"
                  onChange={onPasswordChangeInput}
                />
                {passwordChangeError ? (
                  <p className="profile-dropdown__error">
                    {passwordChangeError}
                  </p>
                ) : null}
                {passwordChangeSuccess ? (
                  <p className="profile-dropdown__success">
                    {passwordChangeSuccess}
                  </p>
                ) : null}
                <button type="submit" className="profile-dropdown__submit">
                  Update password
                </button>
              </form>
            ) : null}

            <button
              type="button"
              className="profile-dropdown__logout"
              onClick={onLogout}
            >
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

NavBar.propTypes = {
  activeView: PropTypes.oneOf(["groups", "watchlist"]).isRequired,
  currentUserEmail: PropTypes.string.isRequired,
  currentUserName: PropTypes.string.isRequired,
  onChangePassword: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onPasswordChangeInput: PropTypes.func.isRequired,
  passwordChangeError: PropTypes.string.isRequired,
  passwordChangeForm: PropTypes.shape({
    currentPassword: PropTypes.string.isRequired,
    newPassword: PropTypes.string.isRequired,
  }).isRequired,
  passwordChangeSuccess: PropTypes.string.isRequired,
};
