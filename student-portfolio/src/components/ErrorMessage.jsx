function ErrorMessage({ message, onRetry }) {
  return (
    <div className="state-box error-box">
      <h3>Unable to load repositories</h3>
      <p>{message}</p>
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

export default ErrorMessage;
