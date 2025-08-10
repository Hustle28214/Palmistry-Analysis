import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Camera from './pages/Camera';
import Analysis from './pages/Analysis';
import Result from './pages/Result';
import History from './pages/History';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="pb-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/camera" element={<Camera />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/result/:id" element={<Result />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
        <Toaster position="top-center" richColors />
      </div>
    </Router>
  );
}

export default App;
