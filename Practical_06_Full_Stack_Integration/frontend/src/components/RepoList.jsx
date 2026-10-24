function RepoList({ repos }) {
  if (repos.length === 0) {
    return <p className="empty-state">No repositories match your search.</p>;
  }

  return (
    <div className="repo-grid">
      {repos.map((repo) => (
        <article className="repo-card" key={repo.id}>
          <div>
            <span className="repo-language">{repo.language || "Repository"}</span>
            <h3>{repo.name}</h3>
            <p>{repo.description || "No description added yet."}</p>
          </div>

          <div className="repo-footer">
            <span>{repo.stargazers_count} stars</span>
            <a href={repo.html_url} target="_blank" rel="noreferrer">
              View Repo
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

export default RepoList;
