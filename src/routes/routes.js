import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '../views/Home/HomePage';
import AboutMePage from '../views/Me/AboutMePage';
import ConsultaGptExcel from '../views/proyects/ConsultaGptExcel/ConsultaGptExcel'
import CreacionInformesGpt from '../views/proyects/CreacionInformesGpt/CreacionInformesGpt';
import AppApuestas from '../views/proyects/AppApuestas/AppApuestas';
import GoalkeeperPage from '../views/proyects/AppGoalkeeper/GoalkeeperPage';
import NotFoundPage from '../views/NotFoundPage/NotFoundPage';

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutMePage />} />
        <Route path="/consultaGptExcel" element={<ConsultaGptExcel />} />
        <Route path="/creacionInformesGpt" element={<CreacionInformesGpt />} />
        <Route path="/appApuestasFlutter" element={<AppApuestas />} />
        <Route path="/appGoalkeepersFlutter" element={<GoalkeeperPage />} />
        {/* Ruta para manejar 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
