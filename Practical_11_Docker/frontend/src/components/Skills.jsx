function Skills({ skillList }) {
  return (
    <section className="skills-section">

      <h2>Skills</h2>

      <div className="skills-grid">

        {skillList.map((skill) => (
          <div key={skill} className="skill-card">
            {skill}
          </div>
        ))}

      </div>

    </section>
  );
}

export default Skills;