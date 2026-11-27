import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ServerErrorPage } from './ServerErrorPage';

type Props = { children: ReactNode };
type State = { hasError: boolean };

// Bắt lỗi render không lường trước, hiện trang 500 thay vì màn hình trắng
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('Lỗi không mong muốn:', error, info.componentStack);
  }

  render() {
    return this.state.hasError ? <ServerErrorPage /> : this.props.children;
  }
}