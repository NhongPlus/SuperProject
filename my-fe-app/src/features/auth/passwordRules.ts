// Quy tắc mật khẩu cho form đăng ký. Hiển thị từng quy tắc để người dùng biết mình thiếu gì.
export type PasswordRule = { label: string; ok: boolean };

export function checkPassword(password: string): PasswordRule[] {
  return [
    { label: 'Ít nhất 8 ký tự', ok: password.length >= 8 },
    { label: 'Có ít nhất một chữ cái viết hoa (A–Z)', ok: /[A-Z]/.test(password) },
    { label: 'Có ít nhất một chữ cái thường (a–z)', ok: /[a-z]/.test(password) },
  ];
}

export function isPasswordValid(password: string): boolean {
  return checkPassword(password).every((r) => r.ok);
}