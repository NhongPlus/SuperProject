import type { TemplateModule, TemplateProps } from '../../types';

const NAVY = '#0B1A33';
const GOLD = '#E8C872';

// Mẫu này dùng khung vòm (arch) bao quanh nội dung, không giống cấu trúc của mẫu khác.
function RoyalBlue({ data }: TemplateProps) {
  return (
    <div style={{ background: NAVY, color: GOLD, fontFamily: 'Georgia, serif', textAlign: 'center', padding: '40px 20px 56px' }}>
      <div
        style={{
          margin: '0 auto',
          padding: '48px 24px 40px',
          maxWidth: 300,
          border: `2px solid ${GOLD}`,
          borderRadius: '160px 160px 16px 16px',
        }}
      >
        <div style={{ fontSize: 12, letterSpacing: 5 }}>THE WEDDING OF</div>
        <div style={{ fontSize: 30, fontStyle: 'italic', margin: '24px 0 8px' }}>{data.groom}</div>
        <div style={{ fontSize: 18 }}>&amp;</div>
        <div style={{ fontSize: 30, fontStyle: 'italic', margin: '8px 0 24px' }}>{data.bride}</div>
        <div style={{ fontSize: 14 }}>{data.date}</div>
      </div>

      <div style={{ marginTop: 32, color: '#f5f5f5', fontSize: 14, lineHeight: 1.7 }}>
        <div>
          Lễ cưới lúc {data.time}
        </div>
        <div>{data.venue}</div>
        <div style={{ opacity: 0.7, fontSize: 12 }}>{data.address}</div>
      </div>
    </div>
  );
}

const template: TemplateModule = {
  meta: {
    slug: 'royal-blue',
    name: 'Royal Blue',
    style: 'Sang trọng',
    badges: ['new'],
    addedAt: '2026-10-20',
    description: 'Nền xanh navy sang trọng với khung vòm và chi tiết vàng.',
    tags: ['Sang trọng', 'Xanh'],
    features: [
      'Tùy chỉnh nội dung',
      'Google Maps',
      'Album ảnh',
      'Xác nhận tham dự',
      'Sổ lưu bút',
      'QR mừng cưới',
    ],
    preview: { from: '#1B2A4A', to: '#0B1A33', accent: '#E8C872' },
  },
  Component: RoyalBlue,
};

export default template;
