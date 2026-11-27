import type { SampleData } from '../../designs/types';
import type { PublicInvitationDto } from '../../services/public.service';

// yyyy-mm-dd -> dd.mm.yyyy (định dạng ngày của mẫu thiệp)
const toDotDate = (iso: string | null): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};

// Tên hiển thị ưu tiên display_name, không có thì dùng họ tên
const personName = (p?: { display_name?: string | null; full_name?: string | null } | null): string =>
  p?.display_name || p?.full_name || '';

// Chuyển dữ liệu thiệp từ backend sang dạng mẫu thiệp cần.
// Mẫu hiện chỉ có một khối ngày giờ và địa điểm, nên lấy sự kiện đầu tiên.
export function toSampleData(inv: PublicInvitationDto): SampleData {
  const first = inv.events[0];

  return {
    groom: personName(inv.content.couple?.groom),
    bride: personName(inv.content.couple?.bride),
    date: toDotDate(first?.event_date ?? null),
    time: first?.start_time ?? '',
    venue: first?.venue_name ?? '',
    address: first?.address ?? '',
  };
}