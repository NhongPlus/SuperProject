# Gọi backend từ web

Tóm tắt cho người viết web, trạng thái ngày 24/11/2026. Hợp đồng đầy đủ (mọi endpoint, trường, mã lỗi) là `README.md` của repo backend `hieutran-12/Startup`. Hai file khác nhau thì README đúng.

## Địa chỉ

| | Production | Chạy trên máy |
| --- | --- | --- |
| Web | `https://ketduyen.me` (Amplify; `www` tự chuyển về đây) | `http://localhost:5173` |
| API | `https://api.ketduyen.me` | qua proxy `/api` của Vite (bên dưới) |
| Ảnh, nhạc | URL CloudFront có sẵn trong response | như production |

- Web và API cùng domain gốc `ketduyen.me`, nên cookie đăng nhập chạy được trên mọi trình duyệt, kể cả Safari.
- Backend chỉ cho phép CORS từ `https://ketduyen.me`.
  - Gọi thẳng API từ `localhost` sẽ bị chặn, nên khi chạy trên máy phải đi qua proxy.
  - Địa chỉ mặc định của Amplify (`main.d3rx5bxsrz5mdw.amplifyapp.com`) chỉ dùng để xem giao diện: nó khác domain, nên gọi API và đăng nhập ở đó không chạy.
- Swagger (`/docs`) tắt ở production. Muốn xem thì chạy backend trên máy (`http://localhost:8000/docs`), hoặc đọc README backend.
- Không tự ghép URL ảnh. Response trả sẵn `url`; thiệp tham chiếu ảnh bằng `media_id`.

## Biến môi trường và proxy

Vite gắn biến `VITE_*` vào code **lúc build**: đổi biến thì phải build lại.

- **Production:** `VITE_API_URL=https://api.ketduyen.me`, đặt trong Amplify console (App settings › Environment variables).
- **Trên máy:** tạo `my-fe-app/.env.development` với `VITE_API_URL=/api`, rồi thêm proxy vào `my-fe-app/vite.config.ts`:

```ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.ketduyen.me', // chạy backend trên máy thì đổi thành http://localhost:8000
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
        // Backend đặt cookie refresh_token với Path=/auth; qua proxy đường dẫn là /api/auth
        cookiePathRewrite: { '/auth': '/api/auth' },
      },
    },
  },
})
```

- Proxy làm trình duyệt tưởng API cùng địa chỉ với web (`localhost:5173`), nên không cần CORS và cookie vẫn lưu được.
- Cookie có cờ `Secure`. Chrome nhận cookie này trên `http://localhost`, nên chạy trên máy thì thử bằng Chrome.
- Proxy tới `api.ketduyen.me` nghĩa là ghi vào **database production**. Tài khoản thử nên dùng email dạng `e2e-<gì đó>@example.com` để dễ dọn.
- `my-fe-app/.env.example` hiện đang trống. Nên ghi `VITE_API_URL=` vào đó để người khác biết.

## Đăng nhập

- `POST /auth/register` gửi `{email, password, full_name}`, mật khẩu 8–128 ký tự.
- `POST /auth/login` gửi `{email, password}`.
- Cả hai trả `{access_token, token_type, expires_in, user: {id, email, full_name, created_at}}`, đồng thời đặt cookie httpOnly `refresh_token`. JS không đọc được cookie này, trình duyệt tự gửi.
- **Access token:**
  - Sống 15 phút.
  - Chỉ giữ trong bộ nhớ (biến, context). Không lưu vào localStorage.
  - Gửi kèm mọi request qua header `Authorization: Bearer <token>`.
- **Gặp 401, hoặc lúc mở hay tải lại trang:** gọi `POST /auth/refresh` (body rỗng). Kết quả trả về giống login.
  - Refresh token xoay vòng mỗi lần dùng, nên nhiều request cùng lúc thì chỉ gọi refresh **một lần** rồi dùng chung kết quả.
  - Refresh vẫn 401 nghĩa là đã đăng xuất.
- `POST /auth/logout` xoá phiên, trả 204. `GET /me` trả user hiện tại.
- Mọi `fetch` tới API đặt `credentials: 'include'`. Nếu không, cookie không được gửi đi và cũng không được lưu.

Ví dụ khung cho `http.ts` (tham khảo, người viết tự chỉnh):

```ts
const API = import.meta.env.VITE_API_URL;
let accessToken: string | null = null;
let refreshing: Promise<boolean> | null = null;

export function setAccessToken(token: string | null) { accessToken = token; }

function refresh(): Promise<boolean> {
  refreshing ??= fetch(`${API}/auth/refresh`, { method: 'POST', credentials: 'include' })
    .then(async (r) => {
      accessToken = r.ok ? (await r.json()).access_token : null;
      return r.ok;
    })
    .finally(() => { refreshing = null; });
  return refreshing;
}

export async function api(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const res = await fetch(`${API}${path}`, { ...init, headers, credentials: 'include' });
  if (res.status === 401 && retry && !path.startsWith('/auth/') && (await refresh())) {
    return api(path, init, false);
  }
  return res;
}
```

## Lỗi

Mọi lỗi có cùng một dạng:

```json
{"error": {"code": "validation_error", "message": "Dữ liệu không hợp lệ",
  "details": [{"field": "content.couple.groom.full_name", "code": "required", "message": "Không được để trống"}]}}
```

- Chọn câu thông báo theo `code`. Gắn lỗi vào đúng ô nhập theo `details[].field`.
- Mã HTTP:
  - 400: lỗi nghiệp vụ, ví dụ `not_ready_to_publish`, `invitation_limit`, `media_limit`.
  - 401: chưa đăng nhập.
  - 404: không có, hoặc không có quyền.
  - 409: trùng hoặc xung đột, ví dụ `email_taken`, `slug_taken`, `revision_conflict`.
  - 422: sai định dạng.
  - 428: thiếu `If-Match`.
- Backend không đoán ý: số phải là số JSON, ngày dạng `"YYYY-MM-DD"`, giờ dạng `"HH:MM"`. Gửi trường lạ → 422 `unknown_field`. Chuyển đổi dữ liệu là việc của web.

## Sửa thiệp: ETag và If-Match

- Response của một thiệp có header `ETag: "<revision>"`. Backend đã cho JS đọc header này dù khác domain.
- `PATCH /invitations/{id}` và mọi thao tác ghi sự kiện phải gửi `If-Match` đúng giá trị ETag, kể cả dấu ngoặc kép.
  - Thiếu `If-Match` → 428.
  - Lệch (người khác hoặc tab khác đã sửa) → 409. Tải lại thiệp rồi cho người dùng sửa tiếp.
- `PATCH` theo JSON Merge Patch:
  - Chỉ gửi trường cần đổi.
  - `null` là xoá giá trị.
  - Danh sách (`love_story`, `gifts`, `appearance.sections`) bị thay nguyên.

## Upload ảnh và nhạc (3 bước, file không đi qua backend)

```ts
const ticket = await (await api(`/invitations/${id}/media/upload-url`, {
  method: 'POST',
  body: JSON.stringify({ filename: file.name, content_type: file.type, size_bytes: file.size }),
})).json();
// PUT thẳng lên S3 bằng link tuyệt đối: không thêm VITE_API_URL, không gửi Authorization
await fetch(ticket.upload_url, { method: 'PUT', headers: ticket.headers, body: file });
await api(`/invitations/${id}/media/${ticket.media_id}/complete`, {
  method: 'POST',
  body: JSON.stringify(isImage ? { width, height } : {}),
});
```

- Link upload ký cả `Content-Type` và dung lượng: `size_bytes` phải đúng bằng `file.size`, nếu không S3 trả 403.
- Ảnh: jpeg, png, webp, avif, tối đa 15 MB. Âm thanh: `audio/mpeg`, `audio/mp3`, `audio/mp4`, `audio/x-m4a`, tối đa 10 MB, 1 file mỗi thiệp.
- Nên nén ảnh trước khi upload (WebP, cạnh dài khoảng 2000px).

## Trang thiệp public

- Gọi `GET /public/invitations/{slug}`. Thêm `?side=groom` cho link nhà trai, `?side=bride` cho link nhà gái. Không cần đăng nhập, chỉ trả thiệp đã đăng.
- Response có:
  - `template_key`, `content`, `events`: mỗi sự kiện có `display_name` và `lunar_date`.
  - `gallery` và `media_by_id`: tra URL ảnh theo ID.
- Component mẫu hiện nhận `SampleData` phẳng (`groom`, `bride`, `date`, `time`, `venue`, `address`). Khi nối API phải chuyển từ response này sang.

## Mẫu thiệp: slug của web và key của backend

Backend có đúng 4 mẫu của web (từ 24/11/2026). Key là slug của web đổi `-` thành `_`:

| Slug (URL web, `meta.slug`) | `template_key` gửi API |
| --- | --- |
| `dragon-phoenix-red` | `dragon_phoenix_red` |
| `royal-blue` | `royal_blue` |
| `cherry-blossom-pink` | `cherry_blossom_pink` |
| `minimalism-dark-red` | `minimalism_dark_red` |

- Đổi qua lại: `slug.replaceAll('-', '_')` và ngược lại. Gửi slug có `-` cho API → 404 hoặc 422.
- `GET /templates` trả tên, mô tả, nhóm, và `manifest` của từng mẫu.
  - Mỗi mẫu có đúng 1 bảng màu, 1 font, 1 nền, lấy từ màu và font đang có trong code component.
  - Khai đủ 9 phần: `cover`, `greeting`, `couple`, `love_story`, `events`, `countdown`, `gallery`, `gifts`, `guest_notes`.
- Thêm mẫu mới hoặc thêm lựa chọn màu, font cho mẫu thì báo người giữ backend sửa seed cùng lúc.

## Chỗ web và backend chưa khớp

| Việc | Hiện trạng |
| --- | --- |
| Route trang thiệp public | Chưa có. README backend gợi ý `/{slug}`, `/{slug}/nha-trai`, `/{slug}/nha-gai`. Trùng với các route của site thì cần thống nhất |
| Thẻ meta khi chia sẻ link | Web là SPA, nên Zalo và Facebook chỉ thấy thẻ meta chung của `index.html` |
| Đăng nhập Google, Facebook | Backend v1 chưa có |
| `.env.example` | Trống |
