import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { RequireAuth } from '../features/auth/AuthGuards';
import { NotFoundPage } from '../pages/exception/NotFoundPage';
import { routes } from './routes.config';
import type { AppRoute } from './types';

function renderRoute({ key, path, component: Page, auth }: AppRoute) {
  const element = auth ? (
    <RequireAuth>
      <Page />
    </RequireAuth>
  ) : (
    <Page />
  );
  return <Route key={key} path={path} element={element} />;
}

// Đọc danh sách routes và dựng cây Route: nhóm có layout và nhóm không có layout
export function AppRouter() {
  const plain = routes.filter((r) => r.layout === 'none');
  const withPublicLayout = routes.filter((r) => r.layout === 'public');

  return (
    <Routes>
      {plain.map(renderRoute)}

      <Route element={<PublicLayout />}>
        {withPublicLayout.map(renderRoute)}
        {/* Mọi đường dẫn không khớp đều hiện trang 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}