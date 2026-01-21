import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <div className="app">
                <header>
                    <h1>SC Padel Club</h1>
                </header>
                <main>
                    <Routes>
                        <Route path="/" element={<div>Welcome to SC Padel Club</div>} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
