import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Header from './components/Header';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Header />
        {/* Add more components and routing here */}
      </div>
    </Provider>
  );
}

export default App;