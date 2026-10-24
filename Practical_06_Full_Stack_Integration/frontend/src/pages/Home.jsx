import About from "../components/About";
import Header from "../components/Header";
import Skills from "../components/Skills";
import { profile } from "../data/portfolio";

function Home({ skills }) {
  return (
    <>
      <Header name={profile.name} themeColor="#5b7fff" />

      <main className="container">
        <About />
        <Skills skillList={skills} />
      </main>
    </>
  );
}

export default Home;
