import Navigation from './Navigation';
import AppRoutes from './AppRoutes';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
