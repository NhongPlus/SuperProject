import { Navigate, Route, Routes } from 'react-router-dom';
import { SiteLayout } from './components/layout/SiteLayout';
import { TemplatesPage } from './pages/templates/TemplatesPage';
import { TemplatePreviewPage } from './pages/template-preview/TemplatePreviewPage';
import { TemplateDemoPage } from './pages/template-demo/TemplateDemoPage';

export default function App() {
  return (
    <Routes>
      {/* Demo toàn trang: nằm ngoài SiteLayout để không có header/padding của site */}
      <Route path="/mau-thiep/:slug/demo" element={<TemplateDemoPage />} />

      <Route element={<SiteLayout />}>
        <Route path="/" element={<Navigate to="/mau-thiep" replace />} />
        <Route path="/mau-thiep" element={<TemplatesPage />} />
        <Route path="/mau-thiep/:slug" element={<TemplatePreviewPage />} />
        <Route path="*" element={<Navigate to="/mau-thiep" replace />} />
      </Route>
    </Routes>
  );
}