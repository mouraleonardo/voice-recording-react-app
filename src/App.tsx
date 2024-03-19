// src/App.tsx
import Head from "./components/layout/Head";
import Main from "./components/layout/Main";
import Footer from "./components/layout/Footer";
import AudioControl from "./components/AudioControl";

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head />
        <Main>
            <AudioControl />
        </Main>
      <Footer />
    </div>
  );
};

export default App;
