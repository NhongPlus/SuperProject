import { Link } from 'react-router-dom';
import buttons from '../../styles/buttons.module.css';
import { ROUTES } from '../../config/site';
import { ErrorPage } from './ErrorPage';

// 500: lỗi ngoài dự kiến trong ứng dụng hoặc máy chủ
export function ServerErrorPage() {
  return (
    <ErrorPage
      code="500"
      title="Đã có lỗi xảy ra"
      description="Trang gặp sự cố ngoài dự kiến. Bạn thử tải lại trang; nếu vẫn lỗi, hãy quay lại sau ít phút."
      actions={
        <>
          <button type="button" className={`${buttons.btn} ${buttons.primary}`} onClick={() => window.location.reload()}>
            Tải lại trang
          </button>
          <Link to={ROUTES.home} className={buttons.linkU}>
            Về trang chủ
          </Link>
        </>
      }
    />
  );
}