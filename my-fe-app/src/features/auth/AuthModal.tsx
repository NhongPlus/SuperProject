import { Modal } from '@mantine/core';
import { useAuth } from './AuthContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import classes from './auth.module.css';

// Modal đăng nhập/đăng ký dùng chung. Mở từ bất kỳ đâu bằng useAuth().openAuth
export function AuthModal() {
    const { authMode, closeAuth, switchAuth } = useAuth();

    return (
        <Modal
            opened={authMode !== null}
            onClose={closeAuth}
            centered
            size={440}
            radius={28}
            padding={0}
            overlayProps={{ backgroundOpacity: 0.35 , blur: 9 }}
            transitionProps={{ duration: 100 }}
            classNames={{ content: classes.content }}
            styles={{
                // Không cuộn trong modal nên không có thanh cuộn
                inner: { overflowY: 'hidden' },
                content: { background: 'rgba(255, 250, 251, 0.97)', position: 'relative' },
                // Header không chiếm chỗ trong luồng: nút X nổi ở góc phải, form không bị đẩy xuống
                header: {
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    zIndex: 1,
                    background: 'transparent',
                    padding: '16px 16px 0',
                    minHeight: 0,
                },
            }}
        >
            {authMode === 'register' ? (
                <RegisterForm onSwitch={() => switchAuth('login')} />
            ) : (
                <LoginForm onSwitch={() => switchAuth('register')} />
            )}
        </Modal>
    );
}