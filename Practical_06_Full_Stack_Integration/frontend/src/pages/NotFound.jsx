import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="container page not-found">
      <span className="hello">404</span>
      <h1>Page Not Found</h1>
      <p>The page you are looking for does not exist in this portfolio.</p>
      <Link className="link-button" to="/">
        Back to Home
      </Link>
    </main>
  );
}

export default NotFound;
