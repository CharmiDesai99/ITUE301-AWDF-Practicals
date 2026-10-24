import ProjectCard from "./ProjectCard";
import { academicProjects } from "../data/portfolio";

function Projects({ projectList = academicProjects }) {
  return (
    <section className="projects-grid" aria-label="Academic projects">
      {projectList.map((project) => (
        <ProjectCard project={project} key={project.title} />
      ))}
    </section>
  );
}

export default Projects;
