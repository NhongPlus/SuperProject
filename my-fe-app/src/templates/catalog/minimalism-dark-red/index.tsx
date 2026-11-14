import type { TemplateModule } from '../../types';
import MinimalismDarkRedInvitation from '../../../pages/minimalism-dark-red/MinimalismDarkRedInvitation';

// Mẫu này có trang riêng toàn màn hình trong src/pages/minimalism-dark-red/.
// Modal chỉ hiển thị thông tin, còn nội dung thiệp nằm trong trang đó.
const template: TemplateModule = {
  meta: {
    slug: 'minimalism-dark-red',
    name: 'Minimalism Đỏ Đậm',
    style: 'Tối giản',
    badges: ['new'],
    addedAt: '2026-11-09',
    description: 'Tối giản sang trọng với nền kem, tông đỏ đô, hoa mẫu đơn và dấu triện mạ vàng.',
    tags: ['Tối giản', 'Đỏ Đậm'],
    features: [
      'Tùy chỉnh nội dung',
      'Google Maps',
      'Album ảnh',
      'Xác nhận tham dự',
      'Sổ lưu bút',
      'QR mừng cưới',
    ],
    preview: { from: '#F5E9DA', to: '#511419', accent: '#C9A24A' },
  },
  // Thumbnail/preview trong modal: dùng chung trang demo để tránh viết hai lần
  Component: () => <MinimalismDarkRedInvitation />,
  DemoPage: MinimalismDarkRedInvitation,
};

export default template;
