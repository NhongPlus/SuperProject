import { request } from './http';
import type { InvitationContentDto, RecipientSide } from './invitation.service';

// Khớp với PublicInvitationResponse và PublicEventResponse trong đặc tả (tag public)
export type PublicEventDto = {
  id: string;
  event_type: string;
  host_side: string;
  event_name: string | null;
  event_date: string | null;
  start_time: string | null;
  end_time: string | null;
  timezone: string;
  venue_name: string | null;
  address: string | null;
  maps_url: string | null;
  display_name: string;
};

export type PublicInvitationDto = {
  slug: string;
  template_key: string;
  side: RecipientSide | null;
  content_schema_version: number;
  content: InvitationContentDto;
  events: PublicEventDto[];
  published_at: string;
  updated_at: string;
};

export const publicService = {
  // Trang khách: không cần đăng nhập. side tùy chọn để xem bản của nhà trai hoặc nhà gái.
  get: (slug: string, side?: RecipientSide, signal?: AbortSignal) =>
    request<PublicInvitationDto>(
      `/public/invitations/${encodeURIComponent(slug)}${side ? `?side=${side}` : ''}`,
      { auth: false, signal },
    ),
};