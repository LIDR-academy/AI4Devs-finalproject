
import MainPage from './components/Main';
import { SessionProvider } from './context/SessionContext';
import { LanguageProvider } from './context/LanguageContext';
import { ChatProvider } from './context/ChatContext';

function App() {
  return (
    <SessionProvider>
      <LanguageProvider>
        <ChatProvider>
          <div className="App">
            <MainPage />
          </div>
        </ChatProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}

export default App;