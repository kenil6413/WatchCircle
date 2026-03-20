import PropTypes from "prop-types";
import "./AuthForm.css";

export default function AuthForm({
  mode,
  formData,
  errorMessage,
  isSubmitting,
  onChange,
  onSubmit,
  onToggleMode,
}) {
  const isSignup = mode === "signup";

  return (
    <section className="auth-form-panel">
      <div className="auth-form-panel__mode-switch">
        <button
          type="button"
          className={
            !isSignup
              ? "auth-form-panel__mode-button auth-form-panel__mode-button--active"
              : "auth-form-panel__mode-button"
          }
          onClick={!isSignup ? undefined : onToggleMode}
        >
          Sign in
        </button>
        <button
          type="button"
          className={
            isSignup
              ? "auth-form-panel__mode-button auth-form-panel__mode-button--active"
              : "auth-form-panel__mode-button"
          }
          onClick={isSignup ? undefined : onToggleMode}
        >
          Sign up
        </button>
      </div>

      <p className="section-kicker">
        {isSignup ? "Create your account" : "Welcome back"}
      </p>
      <h1>{isSignup ? "Create your account" : "Sign in"}</h1>
      <p className="auth-form-panel__copy">
        {isSignup
          ? "Set up your profile and start building your watchlist."
          : "Pick up where you left off."}
      </p>

      <form className="form-grid" onSubmit={onSubmit}>
        {isSignup ? (
          <label className="field">
            <span>Display name</span>
            <input
              required
              type="text"
              name="displayName"
              value={formData.displayName ?? ""}
              onChange={onChange}
            />
          </label>
        ) : null}

        <label className="field">
          <span>Email</span>
          <input
            required
            type="email"
            name="email"
            value={formData.email ?? ""}
            onChange={onChange}
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            required
            minLength="6"
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
          />
        </label>

        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        <div className="form-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Please wait..."
              : isSignup
                ? "Create account"
                : "Log in"}
          </button>
        </div>

        <p className="auth-form-panel__footer">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <button
            type="button"
            className="auth-form-panel__link"
            onClick={onToggleMode}
          >
            {isSignup ? "Sign in instead" : "Create an account"}
          </button>
        </p>
      </form>
    </section>
  );
}

AuthForm.propTypes = {
  mode: PropTypes.oneOf(["login", "signup"]).isRequired,
  formData: PropTypes.shape({
    displayName: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string.isRequired,
  }).isRequired,
  errorMessage: PropTypes.string.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onToggleMode: PropTypes.func.isRequired,
};
