interface MainProps {
  children: React.ReactNode;
}

const Main: React.FC<MainProps> = ({ children }) => (
  <main className="flex-grow flex justify-center items-center">
    {children}
  </main>
);

export default Main;
