import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Claims from './components/Claims';
import InteractiveMap from './components/Map';
import Recommendations from './components/Recommendations';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 pl-20">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/map" element={<InteractiveMap />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;