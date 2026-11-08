import type { TemplateModule, TemplateProps } from '../../types';

const RED = '#8B0000';
const GOLD = '#D4AF37';
const CREAM = '#FFF8E7';

// Mẫu này có cấu trúc riêng: vòng tròn chữ Hỷ ở giữa, nền kem, viền vàng.
function DragonPhoenixRed({ data }: TemplateProps) {
  return (
    <div style={{ background: CREAM, color: RED, fontFamily: 'Georgia, serif', textAlign: 'center', padding: '40px 24px 48px' }}>
      <div style={{ fontSize: 11, letterSpacing: 4 }}>WELCOME TO OUR WEDDING</div>

      <div
        style={{
          margin: '28px auto',
          width: 180,
          height: 180,
          borderRadius: '50%',
          border: `2px solid ${GOLD}`,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 64,
        }}
      >
        囍
      </div>

      <div style={{ fontSize: 13 }}>Trưởng nam</div>
      <div style={{ fontSize: 26, fontWeight: 700 }}>{data.groom}</div>
      <div style={{ fontSize: 14, margin: '10px 0', color: GOLD }}>&amp;</div>
      <div style={{ fontSize: 13 }}> Út nữ</div>
      <div style={{ fontSize: 26, fontWeight: 700 }}>{data.bride}</div>

      <div style={{ marginTop: 32, borderTop: `1px solid ${GOLD}`, paddingTop: 20 }}>
        <div style={{ fontSize: 18 }}>
          {data.time} · {data.date}
        </div>
        <div style={{ marginTop: 8, fontSize: 14 }}>{data.venue}</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>{data.address}</div>
      </div>
    </div>
  );
}

const template: TemplateModule = {
  meta: {
    slug: 'dragon-phoenix-red',
    name: 'Dragon Phoenix Red',
    style: 'Truyền thống',
    badges: ['hot'],
    addedAt: '2026-06-15',
    description: 'Truyền thống với hoa văn rồng phượng, nền kem và viền vàng.',
    tags: ['Truyền thống', 'Đỏ'],
    features: [
      'Tùy chỉnh nội dung',
      'Google Maps',
      'Ghi tên khách mời',
      'Xác nhận tham dự',
      'Ảnh không giới hạn',
      'Nhận lời chúc',
    ],
    preview: { from: '#F5E9DA', to: '#8B0000', accent: '#D4AF37' },
  },
  Component: DragonPhoenixRed,
};

export default template;
