import { Link } from "react-router-dom";
import { profile } from "../data/portfolio";

function Header({ name, themeColor = "#5b7fff" }) {
  return (
    <header className="hero" style={{ '--theme-color': themeColor }}>

      <div className="hero-content">

        <span className="hello">Hello, I'm</span>

        <h1>{name}</h1>

        <h2>Computer Engineering Student</h2>

        <p>
          Computer Engineering student building sustainable e-commerce,
          restaurant booking, and business management web applications.
        </p>

        <div className="hero-stats" aria-label="Portfolio highlights">
          <div>
            <strong>3</strong>
            <span>Projects</span>
          </div>
          <div>
            <strong>14</strong>
            <span>Skills</span>
          </div>
          <div>
            <strong>Full-stack</strong>
            <span>Focus</span>
          </div>
        </div>

        <div className="buttons">
          <Link className="link-button" to="/projects">
            Explore
          </Link>
          <Link className="link-button outline" to="/contact">
            Contact
          </Link>
          <a className="link-button outline" href={profile.githubUrl} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>

      </div>

      <div className="hero-image">

        <div className="blob"></div>

      </div>

    </header>
  );
}

export default Header;
