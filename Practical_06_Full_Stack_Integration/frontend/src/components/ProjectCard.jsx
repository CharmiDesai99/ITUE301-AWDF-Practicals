function ProjectCard({ project }) {
  const technologies = project.technologies.split(", ");

  return (
    <article className="project-card">
      <h2>{project.title}</h2>

      <div className="tech-list" aria-label={`${project.title} technologies`}>
        {technologies.map((technology) => (
          <span key={technology}>{technology}</span>
        ))}
      </div>

      <ul>
        {project.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </article>
  );
}

export default ProjectCard;
