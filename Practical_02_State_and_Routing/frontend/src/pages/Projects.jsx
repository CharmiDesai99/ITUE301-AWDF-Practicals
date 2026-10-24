import { useEffect, useMemo, useState } from "react";
import ErrorMessage from "../components/ErrorMessage";
import ProjectsList from "../components/Projects";
import RepoList from "../components/RepoList";
import Spinner from "../components/Spinner";
import { academicProjects, profile } from "../data/portfolio";

function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRepos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.github.com/users/${profile.githubUsername}/repos`
      );

      if (!response.ok) {
        throw new Error("GitHub API request failed. Please try again.");
      }

      const data = await response.json();
      setRepos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const filteredRepos = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return repos;
    }

    return repos.filter((repo) => repo.name.toLowerCase().includes(query));
  }, [repos, searchTerm]);

  return (
    <main className="container page">
      <section className="page-heading">
        <span className="hello">Portfolio Work</span>
        <h1>Projects</h1>
        <p>
          Full-stack and web development projects focused on e-commerce,
          booking systems, product management, and responsive user interfaces.
        </p>
      </section>

      <ProjectsList projectList={academicProjects} />

      <section className="github-section">
        <div className="section-header">
          <div>
            <span className="hello">API Integration</span>
            <h2>GitHub Repositories</h2>
          </div>
          <a href={profile.githubUrl} target="_blank" rel="noreferrer">
            Open GitHub
          </a>
        </div>

        <input
          className="search-input"
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search repositories..."
        />

        {loading && <Spinner />}
        {error && <ErrorMessage message={error} onRetry={fetchRepos} />}
        {!loading && !error && <RepoList repos={filteredRepos} />}
      </section>
    </main>
  );
}

export default Projects;
