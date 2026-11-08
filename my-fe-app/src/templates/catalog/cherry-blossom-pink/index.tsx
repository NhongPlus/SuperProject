import type { TemplateModule, TemplateProps } from '../../types';

const ROSE = '#880E4F';
const PINK_BG = '#FDF0F4';

// Mẫu này dùng bố cục bo tròn mềm, hoa trang trí và chữ căn giữa theo kiểu lãng mạn.
function CherryBlossomPink({ data }: TemplateProps) {
  return (
    <div style={{ background: PINK_BG, color: ROSE, fontFamily: 'Georgia, serif', textAlign: 'center', padding: '44px 24px 52px' }}>
      <div style={{ fontSize: 28, letterSpacing: 6, color: '#F48FB1' }}>✿ ✿ ✿</div>

      <div style={{ marginTop: 24, fontSize: 12, letterSpacing: 3 }}>SAVE THE DATE</div>
      <div style={{ marginTop: 16, fontSize: 34, fontStyle: 'italic' }}>{data.groom}</div>
      <div style={{ fontSize: 16, color: '#F48FB1' }}>♥</div>
      <div style={{ fontSize: 34, fontStyle: 'italic' }}>{data.bride}</div>

      <div
        style={{
          marginTop: 36,
          padding: '20px 16px',
          borderRadius: 24,
          background: '#fff',
          boxShadow: '0 6px 18px rgba(136,14,79,0.12)',
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 600 }}>{data.date}</div>
        <div style={{ fontSize: 14, marginTop: 6 }}>{data.time}</div>
        <div style={{ fontSize: 14, marginTop: 10 }}>{data.venue}</div>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>{data.address}</div>
      </div>
    </div>
  );
}

const template: TemplateModule = {
  meta: {
    slug: 'cherry-blossom-pink',
    name: 'Cherry Blossom Pink',
    style: 'Lãng mạn',
    badges: ['hot'],
    addedAt: '2026-05-01',
    description: 'Lãng mạn với hoa anh đào hồng và bố cục bo tròn mềm mại.',
    tags: ['Lãng mạn', 'Hồng'],
    features: [
      'Tùy chỉnh nội dung',
      'Google Maps',
      'Album ảnh',
      'Xác nhận tham dự',
      'Sổ lưu bút',
      'QR mừng cưới',
    ],
    preview: { from: '#FCE4EC', to: '#F48FB1', accent: '#880E4F' },
  },
  Component: CherryBlossomPink,
};

export default template;
