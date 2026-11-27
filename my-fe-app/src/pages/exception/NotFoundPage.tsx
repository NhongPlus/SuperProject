import { Link } from 'react-router-dom';
import buttons from '../../styles/buttons.module.css';
import { ROUTES } from '../../config/site';
import { ErrorPage } from './ErrorPage';

// 404: đường dẫn không tồn tại, hoặc thiệp không có hoặc chưa được đăng
export function NotFoundPage() {
  return (
    <ErrorPage
      code="404"
      title="Không tìm thấy trang"
      description="Đường dẫn bạn mở có thể đã sai, hoặc thiệp này chưa được đăng. Bạn quay về trang chủ hoặc xem các mẫu thiệp nhé."
      actions={
        <>
          <Link to={ROUTES.home} className={`${buttons.btn} ${buttons.primary}`}>
            Về trang chủ
          </Link>
          <Link to={ROUTES.templates} className={buttons.linkU}>
            Xem mẫu thiệp
          </Link>
        </>
      }
    />
  );
}