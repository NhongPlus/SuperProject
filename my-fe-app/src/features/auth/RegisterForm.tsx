import { useState } from 'react';
import type { FormEvent } from 'react';
import { PasswordInput, TextInput } from '@mantine/core';
import { useAuth } from './AuthContext';
import { useCallApi } from '../../hooks/useCallApi';
import { getErrorMessage } from '../../services/http';
import type { RegisterBody } from '../../services/auth.service';
import { checkPassword, isPasswordValid } from './passwordRules';
import buttons from '../../styles/buttons.module.css';
import styles from './auth.module.css';
import { passwordFieldClassNames, textFieldClassNames } from './fieldClassNames';


type Props = { onSwitch: () => void };

export function RegisterForm({ onSwitch }: Props) {
  const { register } = useAuth();
  const submit = useCallApi((_signal, body: RegisterBody) => register(body));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const rules = checkPassword(password);
  const passwordOk = isPasswordValid(password);
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = passwordOk && !mismatch && confirm.length > 0 && !submit.loading;

  // register() tự đóng modal khi thành công
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    void submit.run({ full_name: name.trim(), email, password });
  };

  return (
    <div className={styles.body}>
      <h2 className={styles.title}>Đăng ký</h2>

      <form className={styles.form} onSubmit={onSubmit}>
        <TextInput
          classNames={textFieldClassNames}
          label="Họ và tên"
          required
          autoComplete="name"
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
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
          maxLength={128}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
        />
        {password.length > 0 && (
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }} aria-label="Yêu cầu mật khẩu">
            {rules.map((r) => (
              <li key={r.label} style={{ color: r.ok ? 'var(--mantine-color-green-7, #2b8a3e)' : 'var(--cd-rose)' }}>
                {r.ok ? '✓' : '✕'} {r.label}
              </li>
            ))}
          </ul>
        )}

        <PasswordInput
          classNames={passwordFieldClassNames}
          label="Nhập lại mật khẩu"
          required
          maxLength={128}
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.currentTarget.value)}
        />
        {mismatch && <p className={styles.error}>Mật khẩu nhập lại chưa khớp.</p>}
        {getErrorMessage(submit.error) && <p className={styles.error}>{getErrorMessage(submit.error)}</p>}

        <button type="submit" className={`${buttons.btn} ${buttons.primary} ${styles.submit}`} disabled={!canSubmit}>
          {submit.loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
      </form>

      <p className={styles.switch}>
        Đã có tài khoản?{' '}
        <button type="button" className={styles.linkBtn} onClick={onSwitch}>Đăng nhập</button>
      </p>
    </div>
  );
}