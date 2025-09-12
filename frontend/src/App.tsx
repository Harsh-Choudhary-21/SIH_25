import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Claims from './components/Claims';
import InteractiveMap from './components/Map';
import Recommendations from './components/Recommendations';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pl-20">
            <Navigation />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/claims" element={<Claims />} />
              <Route path="/map" element={<InteractiveMap />} />
              <Route path="/recommendations" element={<Recommendations />} />
            </Routes>
          </div>
        </Router>
      </motion.div>
    </ThemeProvider>
  );
}

export default App;