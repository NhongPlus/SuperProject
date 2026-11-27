import { Link } from 'react-router-dom';
import buttons from '../../styles/buttons.module.css';
import { ROUTES } from '../../config/site';
import { ErrorPage } from './ErrorPage';

// 403: thiệp tồn tại nhưng thuộc tài khoản khác
export function ForbiddenPage() {
  return (
    <ErrorPage
      code="403"
      title="Bạn không có quyền xem trang này"
      description="Thiệp này thuộc về một tài khoản khác. Nếu bạn nghĩ đây là nhầm lẫn, hãy đăng nhập lại bằng đúng tài khoản."
      actions={
        <>
          <Link to={ROUTES.invitations} className={`${buttons.btn} ${buttons.primary}`}>
            Thiệp của tôi
          </Link>
          <Link to={ROUTES.home} className={buttons.linkU}>
            Về trang chủ
          </Link>
        </>
      }
    />
  );
}