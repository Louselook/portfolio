import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomePage from '../views/Home/HomePage';
import AboutMePage from '../views/Me/AboutMePage';
import ProjectsPage from '../views/proyects/ProjectsPage';
import ProjectDetail from '../views/proyects/ProjectDetail';
import NotFoundPage from '../views/NotFoundPage/NotFoundPage';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutMePage />} />
          <Route path="/proyectos" element={<ProjectsPage />} />
          <Route path="/proyectos/:slug" element={<ProjectDetail />} />
          <Route path="/consultaGptExcel" element={<Navigate to="/proyectos/consulta-gpt-excel" replace />} />
          <Route path="/creacionInformesGpt" element={<Navigate to="/proyectos/creacion-informes-gpt" replace />} />
          <Route path="/appApuestasFlutter" element={<Navigate to="/proyectos/app-apuestas" replace />} />
          <Route path="/appGoalkeepersFlutter" element={<Navigate to="/proyectos/app-goalkeepers" replace />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
