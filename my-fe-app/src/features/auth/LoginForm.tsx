import { useState } from 'react';
import type { FormEvent } from 'react';
import { PasswordInput, TextInput } from '@mantine/core';
import { useAuth } from './AuthContext';
import { useCallApi } from '../../hooks/useCallApi';
import { getErrorMessage } from '../../services/http';
import type { LoginBody } from '../../services/auth.service';
import buttons from '../../styles/buttons.module.css';
import styles from './auth.module.css';
import { passwordFieldClassNames, textFieldClassNames } from './fieldClassNames';


type Props = { onSwitch: () => void };

export function LoginForm({ onSwitch }: Props) {
  const { login } = useAuth();
  const submit = useCallApi((_signal, body: LoginBody) => login(body));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // login() tự đóng modal khi thành công
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit.run({ email, password });
  };

  return (
    <div className={styles.body}>
      <h2 className={styles.title}>Đăng nhập</h2>
      <p className={styles.subtitle}>Chào mừng bạn quay lại.</p>

      <form className={styles.form} onSubmit={onSubmit}>
        <TextInput
          classNames={textFieldClassNames}
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <PasswordInput
          classNames={passwordFieldClassNames}
          label="Mật khẩu"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
        {getErrorMessage(submit.error) && <p className={styles.error}>{getErrorMessage(submit.error)}</p>}
        <button type="submit" className={`${buttons.btn} ${buttons.primary} ${styles.submit}`} disabled={submit.loading}>
          {submit.loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <p className={styles.switch}>
        Chưa có tài khoản?{' '}
        <button type="button" className={styles.linkBtn} onClick={onSwitch}>Đăng ký</button>
      </p>
    </div>
  );
}