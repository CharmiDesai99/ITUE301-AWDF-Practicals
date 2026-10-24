import { useState } from "react";
import { profile } from "../data/portfolio";

function Contact() {
  const [message, setMessage] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  return (
    <main className="container page">
      <section className="page-heading">
        <span className="hello">Let's Connect</span>
        <h1>Contact</h1>
        <p>
          Send a quick message about internships, projects, collaboration, or
          portfolio feedback.
        </p>
      </section>

      <section className="contact-panel">
        <div className="contact-info">
          <h2>Contact Details</h2>
          <p>Email: {profile.email}</p>
          <p>Role: Computer Engineering Student</p>
          <p>Interests: React, Django, PHP, databases, and full-stack apps.</p>
          <p>
            GitHub:{" "}
            <a href={profile.githubUrl} target="_blank" rel="noreferrer">
              {profile.githubUsername}
            </a>
          </p>
        </div>

        <form className="contact-form">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type your message here..."
            rows="6"
          />
          <p className="character-count">{message.length} characters</p>

          <button
            className="outline help-button"
            type="button"
            onClick={() => setShowHelp(!showHelp)}
          >
            {showHelp ? "Hide Help" : "Show Help"}
          </button>

          {showHelp && (
            <p className="help-text">
              This is a controlled input. The text area value is stored in
              React state and updates the preview below in real time.
            </p>
          )}

          <div className="live-preview">
            <h3>Live Preview</h3>
            <p>{message || "Your typed message will appear here."}</p>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Contact;
