import type { InvitationDto } from '../../../services/invitation.service';

// Chuỗi rỗng thành null, để merge patch xóa đúng giá trị cũ
export const clean = (s: string | null | undefined): string | null => {
  const v = (s ?? '').trim();
  return v === '' ? null : v;
};

// Props chung của các mục nội dung. Mỗi mục lưu riêng bằng PATCH với If-Match.
export type SectionProps = {
  invitation: InvitationDto;
  etag: string | null;
  onChanged: () => Promise<unknown>;
};