import { profile } from "../data/portfolio";

function Footer() {
  return (
    <footer>
      <h3>Let's Connect</h3>

      <p>Email: {profile.email}</p>
      <p>
        <a href={profile.githubUrl} target="_blank" rel="noreferrer">
          GitHub Profile
        </a>
      </p>
    </footer>
  );
}

export default Footer;
