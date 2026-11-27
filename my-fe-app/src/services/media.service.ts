import { request } from './http';

// Khớp với MediaResponse, UploadUrlRequest, UploadUrlResponse, CompleteUploadRequest trong đặc tả (tag media)
export type MediaMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/avif'
  | 'audio/mpeg'
  | 'audio/mp3'
  | 'audio/mp4'
  | 'audio/x-m4a';

export const ALLOWED_MIME: MediaMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
];

const IMAGE_MAX_BYTES = 15 * 1024 * 1024;
const AUDIO_MAX_BYTES = 10 * 1024 * 1024;

export type MediaDto = {
  id: string;
  kind: string;
  album_id: string | null;
  url: string;
  original_filename: string | null;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  status: string;
  position: number;
  created_at: string;
};

export type UploadUrlBody = {
  filename: string;
  content_type: MediaMimeType;
  size_bytes: number;
  album_id?: string | null;
};

export type UploadUrlDto = {
  media_id: string;
  upload_url: string;
  method?: string;
  headers: Record<string, string>;
  expires_in: number;
};

export const mediaService = {
  list: (invitationId: string, signal?: AbortSignal) =>
    request<MediaDto[]>(`/invitations/${invitationId}/media`, { signal }),

  createUploadUrl: (invitationId: string, body: UploadUrlBody, signal?: AbortSignal) =>
    request<UploadUrlDto>(`/invitations/${invitationId}/media/upload-url`, { method: 'POST', body, signal }),

  complete: (
    invitationId: string,
    mediaId: string,
    body: { width?: number | null; height?: number | null },
    signal?: AbortSignal,
  ) => request<MediaDto>(`/invitations/${invitationId}/media/${mediaId}/complete`, { method: 'POST', body, signal }),

  // Chuyển ảnh sang album khác. albumId null: đưa ra khỏi album.
  move: (invitationId: string, mediaId: string, albumId: string | null, signal?: AbortSignal) =>
    request<MediaDto>(`/invitations/${invitationId}/media/${mediaId}`, {
      method: 'PATCH',
      body: { album_id: albumId },
      signal,
    }),

  // Sắp xếp lại thứ tự ảnh của thiệp: gửi danh sách id theo thứ tự mới
  reorder: (invitationId: string, mediaIds: string[], signal?: AbortSignal) =>
    request<MediaDto[]>(`/invitations/${invitationId}/media/order`, {
      method: 'PUT',
      body: { media_ids: mediaIds },
      signal,
    }),

  // Xóa không cần If-Match
  remove: (invitationId: string, mediaId: string, signal?: AbortSignal) =>
    request<void>(`/invitations/${invitationId}/media/${mediaId}`, { method: 'DELETE', signal }),
};

// Kiểm tra định dạng và dung lượng trước khi upload. Trả về thông báo lỗi, hoặc null nếu hợp lệ.
export function validateFile(file: File): string | null {
  if (!ALLOWED_MIME.includes(file.type as MediaMimeType)) {
    return `Định dạng ${file.type || 'không rõ'} không được hỗ trợ`;
  }
  if (file.type.startsWith('image/') && file.size > IMAGE_MAX_BYTES) return 'Ảnh tối đa 15 MB';
  if (file.type.startsWith('audio/') && file.size > AUDIO_MAX_BYTES) return 'Nhạc tối đa 10 MB';
  return null;
}

// Đọc kích thước ảnh từ trình duyệt. Trả về null nếu không đọc được (ví dụ file không phải ảnh).
function readImageSize(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith('image/')) return Promise.resolve(null);

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

// Quy trình 3 bước: xin upload URL, PUT file lên S3, rồi gọi complete.
// Trả về media đã sẵn sàng để gắn vào thiệp.
export async function uploadMedia(invitationId: string, file: File, albumId?: string | null): Promise<MediaDto> {
  const problem = validateFile(file);
  if (problem) throw new Error(problem);

  const { data: target } = await mediaService.createUploadUrl(invitationId, {
    filename: file.name,
    content_type: file.type as MediaMimeType,
    size_bytes: file.size,
    ...(albumId ? { album_id: albumId } : {}),
  });

  // PUT thẳng lên S3: không gửi token, dùng đúng headers server trả về
  const put = await fetch(target.upload_url, {
    method: target.method ?? 'PUT',
    headers: target.headers,
    body: file,
  });
  if (!put.ok) throw new Error(`Tải file lên không thành công (${put.status})`);

  const size = await readImageSize(file);
  const { data } = await mediaService.complete(invitationId, target.media_id, size ?? {});
  return data;
}