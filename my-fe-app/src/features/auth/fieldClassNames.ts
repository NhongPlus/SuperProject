import styles from './auth.module.css';

// Ô nhập thường (email, họ tên)
export const textFieldClassNames = { label: styles.mtLabel, input: styles.mtInput };

// Ô mật khẩu: chừa chỗ cho nút hiện/ẩn mật khẩu
export const passwordFieldClassNames = { label: styles.mtLabel, input: `${styles.mtInput} ${styles.mtPassword}` };