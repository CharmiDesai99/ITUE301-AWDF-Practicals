import { Link, NavLink } from "react-router-dom";

function NavBar({ isDarkMode, onToggleTheme }) {
  return (
    <nav className="navbar">
      <Link className="brand" to="/">
        Charmi Desai
      </Link>

      <div className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/tasks">Task Manager</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </div>

      <button className="theme-toggle" type="button" onClick={onToggleTheme}>
        {isDarkMode ? "Light" : "Dark"}
      </button>
    </nav>
  );
}

export default NavBar;
