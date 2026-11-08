import type { ReactElement } from 'react';

// QR giả để hiển thị giao diện. Khi làm thật, thay bằng thư viện tạo QR (ví dụ qrcode.react).
const N = 21;
const FINDER_ORIGINS = [
  [0, 0],
  [N - 7, 0],
  [0, N - 7],
] as const;

function isDark(x: number, y: number): boolean {
  for (const [ox, oy] of FINDER_ORIGINS) {
    if (x >= ox - 1 && x <= ox + 7 && y >= oy - 1 && y <= oy + 7) {
      const lx = x - ox;
      const ly = y - oy;
      if (lx < 0 || ly < 0 || lx > 6 || ly > 6) return false; // viền trắng quanh mắt QR
      const border = lx === 0 || lx === 6 || ly === 0 || ly === 6;
      const center = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
      return border || center;
    }
  }
  return ((x * 92821 + y * 68917) ^ (x * y * 131)) % 5 < 2;
}

export function PlaceholderQr({ size = 96 }: { size?: number }) {
  const cells: ReactElement[] = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (isDark(x, y)) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`-1 -1 ${N + 2} ${N + 2}`}
      style={{ background: '#fff', borderRadius: 8, padding: 4, flexShrink: 0 }}
      role="img"
      aria-label="Mã QR demo"
    >
      <g fill="#111">{cells}</g>
    </svg>
  );
}
