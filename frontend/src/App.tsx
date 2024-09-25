import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import MainPage from './components/Main';
import { SessionProvider } from './context/SessionContext';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <Provider store={store}>
      <SessionProvider>
        <LanguageProvider>
          <div className="App">
            <MainPage />
          </div>
        </LanguageProvider>
      </SessionProvider>
    </Provider>
  );
}

export default App;