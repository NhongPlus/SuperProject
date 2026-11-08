import { Navigate, Route, Routes } from 'react-router-dom';
import { SiteLayout } from './components/layout/SiteLayout';
import { TemplatesPage } from './pages/templates/TemplatesPage';
import { TemplatePreviewPage } from './pages/template-preview/TemplatePreviewPage';

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Navigate to="/mau-thiep" replace />} />
        <Route path="/mau-thiep" element={<TemplatesPage />} />
        <Route path="/mau-thiep/:slug" element={<TemplatePreviewPage />} />
        <Route path="*" element={<Navigate to="/mau-thiep" replace />} />
      </Route>
    </Routes>
  );
}
