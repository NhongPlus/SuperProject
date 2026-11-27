import type { ReactNode } from 'react';
import styles from './ErrorPage.module.css';

type Props = {
  code: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

// Khung chung cho các trang lỗi: mã lỗi, tiêu đề, mô tả và nút hành động
export function ErrorPage({ code, title, description, actions }: Props) {
  return (
    <section className={styles.wrap}>
      <div className={styles.card}>
        <p className={styles.code}>{code}</p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.desc}>{description}</p>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </section>
  );
}