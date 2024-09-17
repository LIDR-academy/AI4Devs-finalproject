import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import MainPage from './components/Main';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <MainPage />
      </div>
    </Provider>
  );
}

export default App;