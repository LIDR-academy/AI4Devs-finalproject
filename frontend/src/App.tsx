import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import MainPage from './components/Main';
import { SessionProvider } from './context/SessionContext';
import { LanguageProvider } from './context/LanguageContext';
import { ChatProvider } from './context/ChatContext';

function App() {
  return (
    <Provider store={store}>
      <SessionProvider>
        <LanguageProvider>
          <ChatProvider>
            <div className="App">
              <MainPage />
            </div>
          </ChatProvider>
        </LanguageProvider>
      </SessionProvider>
    </Provider>
  );
}

export default App;