import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '../views/Home/HomePage';
import AboutMePage from '../views/Me/AboutMePage';
import NotFoundPage from '../views/NotFoundPage/NotFoundPage';

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutMePage />} />
        {/* Ruta para manejar 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
