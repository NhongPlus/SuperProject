import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Calendar } from '@mantine/dates';
import { IconMusic, IconMusicOff } from '@tabler/icons-react';
import 'dayjs/locale/vi';
// Carousel React Bits (cài bằng jsrepo, nằm ở src/component/Carousel.tsx)
import Carousel from '../../component/Carousel';

/* =====================================================================
 * MẪU: Minimalism Dark Red
 * - Toàn bộ nội dung nằm trong `weddingData` (sửa ở đây).
 * - Ảnh tĩnh nằm trong /public/images/... (xem danh sách bên dưới file).
 * - CSS nằm trong biến `css` cuối file, render bằng <style> để chỉ có 1 file.
 * ===================================================================== */

export interface WeddingData {
  groom: { full: string; short: string; parents: [string, string]; hometown: string };
  bride: { full: string; short: string; parents: [string, string]; hometown: string };
  saveTheDate: string;
  ceremony: { startIso: string; timeLabel: string; weekday: string; lunarDate: string; hostLine: string };
  reception: { arriveTime: string; startTime: string; weekday: string; venueName: string; venueAddress: string };
  schedule: { time: string; label: string; icon?: string }[];
  dressCode: { label: string; color: string; border?: boolean }[];
  photos: string[];
  heroPhoto: string;
  gifts: { role: string; bank: string; account: string; holder: string; qrSrc: string }[];
  guestbook: { name: string; message: string; time: string }[];
  footerLine: string;
}

export const weddingData: WeddingData = {
  groom: { full: 'Đặng Hoàng Long', short: 'Hoàng Long', parents: ['Ông Bà Đặng Văn Thắng', 'Bùi Thị Mai'], hometown: 'Quận 1, TP. Hồ Chí Minh' },
  bride: { full: 'Vũ Bảo Ngọc', short: 'Bảo Ngọc', parents: ['Ông Bà Vũ Đức Trung', 'Ngô Thị Hạnh'], hometown: 'Quận 3, TP. Hồ Chí Minh' },
  saveTheDate: 'Save The Date',
  ceremony: {
    startIso: '2026-01-03T09:00:00+07:00', // dùng cho lịch và link "Thêm vào lịch"
    timeLabel: '09:00',
    weekday: 'Thứ Bảy',
    lunarDate: '(Tức ngày 15 tháng 11 năm Ất Tỵ)',
    hostLine: 'Trân trọng báo tin\nLễ Thành Hôn của con chúng tôi',
  },
  reception: {
    arriveTime: '17:30',
    startTime: '18:00',
    weekday: 'Thứ Bảy',
    venueName: 'Trung Tâm Hội Nghị White Palace',
    venueAddress: '194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh',
  },
  schedule: [
    { time: '17:00', label: 'Đón khách' },
    { time: '18:00', label: 'Khai tiệc', icon: 'camera' },
    { time: '18:30', label: 'Nghi thức cưới', icon: 'cake' },
    { time: '19:00', label: 'Cắt bánh & nâng ly', icon: 'cook' },
    { time: '20:30', label: 'Kết thúc tiệc' },
  ],
  dressCode: [
    { label: 'Đỏ Đô', color: '#511419' },
    { label: 'Rượu Vang', color: '#8C3A3F' },
    { label: 'Vàng Đồng', color: '#C9A24A' },
    { label: 'Màu Be', color: '#ECE4D8', border: true },
  ],
  // Thay bằng ảnh thật của cặp đôi. Có thể thêm/bớt, carousel tự chia vòng.
  photos: [
    '/images/photos/hehe.jpg',
    '/images/photos/hehe.jpg',
    '/images/photos/hehe.jpg',
    '/images/photos/hehe.jpg',
    '/images/photos/hehe.jpg',
    '/images/photos/hehe.jpg',
    '/images/photos/hehe.jpg',
  ],
  heroPhoto: '/images/photos/hero.webp',
  gifts: [
    { role: 'Chú Rể', bank: 'Vietcombank', account: '1023456789', holder: 'DANG HOANG LONG', qrSrc: '/images/qr/groom.png' },
    { role: 'Cô Dâu', bank: 'Techcombank', account: '9988776655', holder: 'VU BAO NGOC', qrSrc: '/images/qr/bride.png' },
  ],
  guestbook: [
    { name: 'Duy Khang', message: 'Chúc mừng ngày vui của hai bạn, trăm năm hạnh phúc bền lâu!', time: 'Hôm nay' },
    { name: 'Lan Chi', message: 'Đẹp đôi quá! Chúc hai bạn sống bên nhau đầu bạc răng long.', time: 'Hôm nay' },
    { name: 'Tuấn Anh', message: 'Mừng hạnh phúc hai bạn! Chúc gia đình nhỏ luôn đầy ắp tiếng cười.', time: 'Hôm nay' },
  ],
  footerLine: 'Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!',
};

const ASSET = '/images/themes/minimalism-dark-red';
const MUSIC_SRC = '/audio/wedding-music.mp3'; // đặt file nhạc vào public/audio/

/* ---------- Tiện ích ---------- */

// Lấy ngày/tháng/năm trực tiếp từ chuỗi "YYYY-MM-DD" để không bị lệch múi giờ của máy người xem
function parseDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return { year: y, month: m - 1, day: d, pad: (n: number) => String(n).padStart(2, '0') };
}

function toGoogleDates(startIso: string, hours = 3): string {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + hours * 3600 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return `${fmt(start)}/${fmt(end)}`;
}

// Lịch dùng component Calendar của Mantine. Ngày cưới được thay bằng icon trái tim.
function MonthCalendar({ year, month, highlightDay }: { year: number; month: number; highlightDay: number }) {
  return (
    <div className="mdr-cal">
      <Calendar
        locale="vi"
        defaultDate={new Date(year, month, 1)}
        firstDayOfWeek={1}
        hideOutsideDates
        renderDay={(date: string) => {
          // Mantine v7 truyền ngày dạng chuỗi "YYYY-MM-DD"
          const [, m, d] = date.split('-').map(Number);
          const isWeddingDay = d === highlightDay && m - 1 === month;
          if (!isWeddingDay) return d;
          return (
            <span className="mdr-cal-heart" aria-label={`Ngày ${highlightDay}`}>
              <svg viewBox="0 0 24 22" aria-hidden="true">
                <path d="M12 21C12 21 1.5 13.5 1.5 7.5C1.5 4.46 3.96 2 7 2C8.76 2 10.35 2.81 11.4 4.09L12 4.8L12.6 4.09C13.65 2.81 15.24 2 17 2C20.04 2 22.5 4.46 22.5 7.5C22.5 13.5 12 21 12 21Z" />
              </svg>
              <span>{highlightDay}</span>
            </span>
          );
        }}
      />
    </div>
  );
}

/* ---------- Các khối giao diện ---------- */

function Header({ data }: { data: WeddingData }) {
  return (
    <header className="mdr-header">
      <p className="mdr-eyebrow">{data.saveTheDate}</p>

      <div className="mdr-envelope">
        <img className="mdr-env-bg" src={`${ASSET}/envelope-background.webp`} alt="" aria-hidden="true" />
        <div className="mdr-env-photo-wrap">
          <div className="mdr-env-photo">
            <img src={data.heroPhoto} alt={`${data.groom.short} & ${data.bride.short}`} />
          </div>
        </div>
        <img className="mdr-env-flower" src={`${ASSET}/flower2-decoration.webp`} alt="" aria-hidden="true" />
        <img className="mdr-env-cover" src={`${ASSET}/envelope-cover.webp`} alt="" aria-hidden="true" />
      </div>

      <div className="mdr-names">
        <p className="mdr-name-script">{data.groom.short}</p>
        <span className="mdr-amp-bg" aria-hidden="true">&amp;</span>
        <p className="mdr-name-script">{data.bride.short}</p>
      </div>
    </header>
  );
}

function CeremonyCard({ data }: { data: WeddingData }) {
  const d = parseDate(data.ceremony.startIso);
  return (
    <section className="mdr-block">
      <div className="mdr-block-inner">
        <h2 className="mdr-h2">Thông Tin Lễ Cưới</h2>

        <div className="mdr-parents">
          <div>
            <span className="mdr-label">Nhà Trai</span>
            <p>{data.groom.parents[0]}</p>
            <p>&amp; {data.groom.parents[1]}</p>
            <p className="mdr-small">{data.groom.hometown}</p>
          </div>
          <div className="mdr-parents-sep">
            <span className="mdr-label">Nhà Gái</span>
            <p>{data.bride.parents[0]}</p>
            <p>&amp; {data.bride.parents[1]}</p>
            <p className="mdr-small">{data.bride.hometown}</p>
          </div>
        </div>

        <p className="mdr-host">{data.ceremony.hostLine}</p>

        <div className="mdr-couple">
          <p className="mdr-couple-name">{data.groom.full}</p>
          <span className="mdr-label-gold">(Trưởng Nam)</span>
          <span className="mdr-amp-script">&amp;</span>
          <p className="mdr-couple-name">{data.bride.full}</p>
          <span className="mdr-label-gold">(Út Nữ)</span>
        </div>

        <div className="mdr-date-block">
          <p className="mdr-small-caps">Lễ Thành Hôn được cử hành tại tư gia</p>
          <div className="mdr-date-row">
            <span className="mdr-day">{d.pad(d.day)}</span>
            <span className="mdr-divider" />
            <div className="mdr-month">
              <span>Tháng {d.pad(d.month + 1)}</span>
              <span>Năm {d.year}</span>
            </div>
          </div>
          <p className="mdr-small-caps">
            Vào lúc {data.ceremony.timeLabel} · {data.ceremony.weekday}
          </p>
          <p className="mdr-lunar">{data.ceremony.lunarDate}</p>
        </div>
      </div>
    </section>
  );
}

function AlbumSection({ photos }: { photos: string[] }) {
  return (
    <section className="mdr-album">
      <h2 className="mdr-h2 dark">Album Ảnh</h2>
      <Carousel
        items={photos.map((src, i) => ({ image: src, alt: `Ảnh cưới ${i + 1}` }))}
        baseWidth={300}
        aspectRatio={2 / 3}
        effect="tilt"
        indicator="dots"
        arrows
        loop
        frame={false}
        theme="light"
        radius={16}
      />
    </section>
  );
}

function ReceptionCard({ data }: { data: WeddingData }) {
  const d = parseDate(data.ceremony.startIso);
  const addToCalendar = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Đám cưới ${data.groom.short} & ${data.bride.short}`,
  )}&dates=${toGoogleDates(data.ceremony.startIso)}&ctz=Asia/Ho_Chi_Minh&location=${encodeURIComponent(
    `${data.reception.venueName}, ${data.reception.venueAddress}`,
  )}`;

  return (
    <section className="mdr-block">
      <div className="mdr-block-inner">
        <h2 className="mdr-h2">Thông Tin Tiệc Cưới</h2>
        <p className="mdr-small-caps">Tiệc cưới sẽ diễn ra vào lúc</p>

        <div className="mdr-times">
          <div>
            <span className="mdr-label">Đón khách</span>
            <span className="mdr-time">{data.reception.arriveTime}</span>
          </div>
          <div className="mdr-date-row boxed">
            <span className="mdr-day">{d.pad(d.day)}</span>
            <span className="mdr-divider" />
            <div className="mdr-month">
              <span>Tháng {d.pad(d.month + 1)}</span>
              <span>{d.year}</span>
            </div>
          </div>
          <div>
            <span className="mdr-label">Khai tiệc</span>
            <span className="mdr-time">{data.reception.startTime}</span>
          </div>
        </div>
        <p className="mdr-lunar">{data.ceremony.lunarDate}</p>

        <MonthCalendar year={d.year} month={d.month} highlightDay={d.day} />

        <a className="mdr-link-btn" href={addToCalendar} target="_blank" rel="noopener noreferrer">
          Thêm vào lịch
        </a>
        <button
          type="button"
          className="mdr-solid-btn"
          onClick={() => document.getElementById('guestbook')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Xác nhận tham dự
        </button>
      </div>
    </section>
  );
}

function VenueMap({ data }: { data: WeddingData }) {
  const query = `${data.reception.venueName}, ${data.reception.venueAddress}`;
  return (
    <section className="mdr-venue">
      <p className="mdr-small-caps">Tiệc cưới sẽ tổ chức tại</p>
      <p className="mdr-venue-name">{data.reception.venueName}</p>
      <p className="mdr-venue-addr">{data.reception.venueAddress}</p>
      <iframe
        className="mdr-map"
        title="Bản đồ địa điểm tiệc cưới"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
      />
      <a
        className="mdr-route"
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Chỉ đường
      </a>
    </section>
  );
}

function DressCode({ items }: { items: WeddingData['dressCode'] }) {
  return (
    <section className="mdr-dress">
      <h2 className="mdr-h2 dark">Dress Code</h2>
      <p className="mdr-small-caps dark">Trang phục dự tiệc</p>
      <div className="mdr-swatches">
        {items.map((c) => (
          <div key={c.label} className="mdr-swatch-wrap">
            <span className={`mdr-swatch ${c.border ? 'bordered' : ''}`} style={{ background: c.color }} />
            <span className="mdr-swatch-label">{c.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScheduleCard({ items }: { items: WeddingData['schedule'] }) {
  const icons: Record<string, string> = { camera: 'camera.webp', cake: 'cake.webp', cook: 'cook.webp' };
  return (
    <section className="mdr-block">
      <div className="mdr-block-inner">
        <h2 className="mdr-h2">Lịch Trình Ngày Cưới</h2>
        <ol className="mdr-timeline">
          {items.map((it) => (
            <li key={it.time + it.label}>
              <span className="mdr-tl-time">
                {it.icon && <img src={`${ASSET}/${icons[it.icon]}`} alt="" aria-hidden="true" className="mdr-tl-icon" />}
                {it.time}
              </span>
              <span className="mdr-tl-dot" aria-hidden="true" />
              <span className="mdr-tl-label">{it.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Guestbook({ seed }: { seed: WeddingData['guestbook'] }) {
  const [entries, setEntries] = useState(seed);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const n = name.trim();
    const m = message.trim();
    if (!n || !m) return;
    const time = new Date().toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    // Chỉ lưu trên trang. Muốn lưu thật cần gọi API ở đây.
    setEntries((prev) => [{ name: n, message: m, time }, ...prev]);
    setName('');
    setMessage('');
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="guestbook" className="mdr-guestbook">
      <h2 className="mdr-h2 dark center">Sổ Lưu Bút</h2>
      <form className="mdr-gb-form" onSubmit={submit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên*" required maxLength={500} />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Nhập lời chúc*" required rows={4} maxLength={10000} />
        <button type="submit" className="mdr-solid-btn small">GỬI LỜI CHÚC</button>
        {sent && <p className="mdr-sent">Cảm ơn bạn đã gửi lời chúc!</p>}
      </form>
      <div className="mdr-gb-list">
        {entries.map((e, i) => (
          <div key={i} className="mdr-gb-item">
            <div className="mdr-gb-head">
              <span>{e.name}</span>
              <span>{e.time}</span>
            </div>
            <p>{e.message}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function GiftBox({ gifts }: { gifts: WeddingData['gifts'] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <section className="mdr-gift">
      <h2 className="mdr-h2 dark">Hộp Quà Mừng</h2>
      <button type="button" className="mdr-gift-btn" aria-label="Mở hộp mừng cưới" onClick={() => dialogRef.current?.showModal()}>
        <img className="mdr-gift-img" src="/images/envelope/minimalism_darkred.webp" alt="" />
        <span className="mdr-gift-hint">Nhấn để mở</span>
      </button>

      <dialog
        ref={dialogRef}
        className="mdr-dialog"
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div className="mdr-dialog-head">
          <h3>Hộp Quà Mừng</h3>
          <button type="button" className="mdr-dialog-close" aria-label="Đóng" onClick={() => dialogRef.current?.close()}>
            ✕
          </button>
        </div>
        <div className="mdr-dialog-body">
          {gifts.map((g) => (
            <div key={g.holder} className="mdr-qr-card">
              <h4>{g.role} - {g.holder}</h4>
              <img src={g.qrSrc} alt={`QR ${g.role}`} />
              <p>{g.bank}</p>
              <p className="mono">{g.account}</p>
              <p className="bold">{g.holder}</p>
            </div>
          ))}
        </div>
      </dialog>
    </section>
  );
}

/* ---------- Hiệu ứng & tiện ích ---------- */

// Tự cuộn chậm từ đầu trang xuống cuối. Người xem cuộn, chạm hoặc bấm phím thì dừng hẳn.
function useAutoScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const SPEED = 30; // px mỗi giây
    const START_DELAY = 1200; // ms, để người xem kịp nhìn ảnh bìa
    let raf = 0;
    let timer = 0;
    let pos = 0;
    let last = 0;

    const stop = () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('keydown', stop);
      window.removeEventListener('pointerdown', stop);
    };

    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      pos = Math.min(pos + SPEED * dt, max);
      window.scrollTo(0, pos);
      if (pos >= max) {
        stop();
        return;
      }
      raf = requestAnimationFrame(step);
    };

    timer = window.setTimeout(() => {
      pos = window.scrollY;
      last = performance.now();
      raf = requestAnimationFrame(step);
    }, START_DELAY);

    const passive = { passive: true };
    window.addEventListener('wheel', stop, passive);
    window.addEventListener('touchstart', stop, passive);
    window.addEventListener('keydown', stop);
    window.addEventListener('pointerdown', stop);

    return stop;
  }, [enabled]);
}

// Nút nhạc nổi góc dưới bên trái. Nhạc chỉ bật khi người xem bấm (trình duyệt chặn tự phát).
function MusicButton() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={MUSIC_SRC}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className="mdr-music"
        onClick={toggle}
        aria-label={playing ? 'Tắt nhạc' : 'Bật nhạc'}
        aria-pressed={playing}
      >
        {playing ? <IconMusic size={20} /> : <IconMusicOff size={20} />}
      </button>
    </>
  );
}

/* ---------- Trang chính ---------- */

export default function MinimalismDarkRedInvitation({
  data = weddingData,
  embedded = false,
}: {
  data?: WeddingData;
  /** true khi nhúng trong khung preview: không tự cuộn, không hiện nút nhạc */
  embedded?: boolean;
}) {
  useAutoScroll(!embedded);

  return (
    <div className="mdr-page">
      <style>{css}</style>
      <main className="mdr-root">
        <Header data={data} />
        <CeremonyCard data={data} />
        <AlbumSection photos={data.photos} />
        <ReceptionCard data={data} />
        <VenueMap data={data} />
        <DressCode items={data.dressCode} />
        <ScheduleCard items={data.schedule} />
        <Guestbook seed={data.guestbook} />
        <GiftBox gifts={data.gifts} />
        <footer className="mdr-footer">
          <p>{data.footerLine}</p>
        </footer>
      </main>
      {!embedded && <MusicButton />}
    </div>
  );
}

/* =====================================================================
 * CSS
 * ===================================================================== */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Viaoda+Libre&family=The+Nautigal&family=Ms+Madi&family=Uchen&display=swap');

:root {
  --ink: #511419;
  --cream: #FFF7EB;
  --paper: #ECE4D8;
  --gold: #C9A24A;
  --wine: #8C232B;
  --serif: "Times New Roman", "Baskerville", Georgia, serif;
  --script: "Viaoda Libre", "The Nautigal", cursive;
}
.mdr-page { background: #300508; min-height: 100vh; padding: 0; }
.mdr-root {
  position: relative; margin: 0 auto; max-width: 480px; background: var(--cream);
  color: var(--ink); font-family: var(--serif); overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,.4);
}
@media (min-width: 768px) { .mdr-root { max-width: 900px; } }
.mdr-root img { max-width: 100%; display: block; }
.mdr-root button { font: inherit; cursor: pointer; }

/* Header + phong bì */
.mdr-header { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 48px 36px 56px; overflow: hidden; }
.mdr-eyebrow { font-weight: 600; font-size: 15px; letter-spacing: .16em; text-transform: uppercase; color: #590310; margin: 0; }
.mdr-envelope { position: relative; width: 82%; max-width: 330px; aspect-ratio: 333/384; margin-top: 96px; }
@media (min-width: 768px) { .mdr-envelope { max-width: 420px; margin-top: 112px; } }
.mdr-env-bg, .mdr-env-cover { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
.mdr-env-bg { z-index: 1; }
.mdr-env-cover { z-index: 30; }
.mdr-env-photo-wrap { position: absolute; left: 33%; top: -2%; width: 64%; z-index: 20; animation: drFloat 6.5s ease-in-out .4s infinite; }
.mdr-env-photo { aspect-ratio: 221/309; transform: rotate(12deg); background: #fff; border: 7px solid #fff; box-shadow: 2px 2px 4px rgba(0,0,0,.25); }
.mdr-env-photo img { width: 100%; height: 100%; object-fit: cover; }
.mdr-env-flower { position: absolute; left: -2%; top: -12%; width: 42%; z-index: 25; transform: rotate(-17deg); filter: drop-shadow(3px 4px 3px rgba(0,0,0,.3)); animation: drFloat 5s ease-in-out infinite; pointer-events: none; }
.mdr-names { position: relative; margin-top: 56px; display: flex; flex-direction: column; align-items: center; gap: 22px; }
.mdr-name-script { margin: 0; font-family: var(--script); font-size: clamp(38px, 11vw, 58px); line-height: 1; color: var(--ink); }
.mdr-amp-bg { position: absolute; top: 37%; transform: translateY(-50%); font-family: var(--script); font-size: 120px; line-height: 1; color: rgba(81,20,25,.15); pointer-events: none; }

/* Khối card đỏ */
.mdr-block { position: relative; margin: 24px auto; width: 88%; max-width: 560px; }
.mdr-block-inner {
  position: relative; overflow: hidden; border-radius: 13px; padding: 36px 24px 40px; text-align: center;
  background: var(--ink); color: var(--paper); box-shadow: 4px 4px 10px rgba(0,0,0,.25);
  display: flex; flex-direction: column; align-items: center; gap: 24px;
}
.mdr-h2 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: .03em; text-transform: uppercase; color: var(--paper); }
.mdr-h2.dark { color: var(--ink); }
.mdr-h2.center { text-align: center; }
.mdr-label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: .1em; color: rgba(236,228,216,.7); }
.mdr-label-gold { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: var(--gold); font-weight: 600; }
.mdr-small { font-size: 12px; color: rgba(236,228,216,.75); margin: 4px 0 0; }
.mdr-small-caps { margin: 0; font-size: 13px; text-transform: uppercase; letter-spacing: .12em; color: rgba(236,228,216,.8); }
.mdr-small-caps.dark { color: rgba(81,20,25,.8); }
.mdr-lunar { margin: 0; font-size: 12px; font-style: italic; color: rgba(236,228,216,.7); }
.mdr-parents { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; border-bottom: 1px solid rgba(236,228,216,.2); padding-bottom: 24px; }
.mdr-parents > div { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.mdr-parents p { margin: 0; font-weight: 600; font-size: 15px; color: #FFF7EB; }
.mdr-parents-sep { border-left: 1px solid rgba(236,228,216,.2); padding-left: 12px; }
.mdr-host { margin: 0; white-space: pre-line; font-size: 16px; color: rgba(236,228,216,.9); font-style: italic; }
.mdr-couple { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.mdr-couple-name { margin: 0; font-size: 28px; font-weight: 700; color: #FFF7EB; }
.mdr-amp-script { font-family: var(--script); font-size: 32px; color: rgba(236,228,216,.8); }
.mdr-date-block { display: flex; flex-direction: column; align-items: center; gap: 12px; border-top: 1px solid rgba(236,228,216,.2); padding-top: 18px; width: 100%; }
.mdr-date-row { display: flex; align-items: center; justify-content: center; gap: 16px; color: #FFF7EB; }
.mdr-date-row.boxed { padding: 8px 16px; border-radius: 12px; border: 1px solid rgba(236,228,216,.2); background: rgba(255,247,235,.1); }
.mdr-day { font-size: 46px; line-height: 1; }
.mdr-divider { width: 1px; height: 46px; background: rgba(236,228,216,.45); }
.mdr-month { display: flex; flex-direction: column; text-align: left; font-size: 15px; text-transform: uppercase; letter-spacing: .08em; }

/* Album carousel */
.mdr-album { position: relative; padding: 40px 24px; display: flex; flex-direction: column; align-items: center; }
.mdr-carousel { position: relative; margin-top: 20px; width: 100%; max-width: 600px; }
.mdr-carousel-stage { position: relative; height: 340px; display: flex; align-items: center; justify-content: center; perspective: 1000px; touch-action: pan-y; }
@media (min-width: 768px) { .mdr-carousel-stage { height: 520px; } }
.mdr-card {
  position: absolute; height: 92%; aspect-ratio: 2/3; padding: 0; border: 0; border-radius: 16px; overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,.25); transition: transform 1.1s ease-in-out, opacity 1.1s ease-in-out;
  background: #fff;
}
.mdr-card img { width: 100%; height: 100%; object-fit: cover; }
.mdr-card.is-active { outline: 2px solid rgba(255,255,255,.3); }
.mdr-carousel-arrow {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 200; width: 32px; height: 32px;
  border-radius: 9999px; border: 0; background: rgba(236,228,216,.6); color: var(--ink); display: none; align-items: center; justify-content: center; font-size: 20px;
}
.mdr-carousel-arrow.left { left: 0; }
.mdr-carousel-arrow.right { right: 0; }
.mdr-carousel-arrow:hover { background: var(--paper); }
@media (min-width: 768px) { .mdr-carousel-arrow { display: flex; } }
.mdr-dots { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
.mdr-dot { width: 8px; height: 8px; border-radius: 9999px; border: 0; background: var(--ink); opacity: .25; padding: 0; }
.mdr-dot.is-active { width: 24px; opacity: .7; }

/* Tiệc + lịch */
.mdr-times { display: flex; align-items: center; justify-content: center; gap: 24px; flex-wrap: wrap; }
.mdr-times > div:not(.mdr-date-row) { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.mdr-time { font-size: 18px; font-weight: 600; color: #FFF7EB; }
.mdr-cal {
  width: fit-content;
  box-sizing: border-box;
  background: var(--paper);
  color: var(--ink);
  border-radius: 12px;
  padding: 12px;
  font-family: var(--serif);
}

.mdr-cal-heart { position: relative; width: 28px; height: 26px; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; }
.mdr-cal-heart svg { position: absolute; inset: 0; width: 100%; height: 100%; fill: var(--ink); }
.mdr-cal-heart span { position: relative; font-size: 12px; }
.mdr-link-btn {
  display: inline-flex; align-items: center; padding: 10px 20px; border-radius: 9999px; border: 1px solid rgba(236,228,216,.5);
  color: var(--paper); font-size: 12px; text-transform: uppercase; letter-spacing: .08em; text-decoration: none;
}
.mdr-solid-btn {
  display: inline-flex; align-items: center; justify-content: center; padding: 10px 24px; border-radius: 9999px; border: 0;
  background: var(--paper); color: var(--ink); font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: .08em;
  box-shadow: 0 8px 20px rgba(0,0,0,.2); transition: transform .2s;
}
.mdr-solid-btn:hover { transform: scale(1.03); }
.mdr-solid-btn.small { background: var(--ink); color: var(--paper); align-self: flex-end; }

/* Địa điểm */
.mdr-venue { position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; padding: 32px 24px; }
.mdr-venue-name { margin: 8px 0 0; font-size: 18px; font-weight: 600; }
.mdr-venue-addr { margin: 0; font-size: 14px; color: rgba(81,20,25,.8); max-width: 440px; }
.mdr-map { width: 100%; max-width: 560px; height: 280px; border: 0; border-radius: 15px; margin-top: 12px; }
@media (min-width: 768px) { .mdr-map { height: 380px; } }
.mdr-route { margin-top: 8px; padding: 8px 20px; border-radius: 9999px; color: rgba(81,20,25,.8); font-weight: 600; font-size: 14px; text-decoration: none; }

/* Dress code */
.mdr-dress { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px 24px; text-align: center; }
.mdr-swatches { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin-top: 16px; }
.mdr-swatch-wrap { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.mdr-swatch { width: 44px; height: 44px; border-radius: 9999px; box-shadow: 0 4px 10px rgba(0,0,0,.15); }
.mdr-swatch.bordered { border: 1.5px solid rgba(81,20,25,.2); }
.mdr-swatch-label { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; }

/* Lịch trình */
.mdr-timeline { list-style: none; margin: 0; padding: 0; width: 100%; max-width: 460px; display: grid; grid-template-columns: minmax(0,1fr) 16px minmax(0,1fr); align-items: center; gap: 32px 24px; position: relative; }
.mdr-timeline li { display: contents; }
.mdr-tl-time { position: relative; text-align: right; font-size: 17px; font-variant-numeric: tabular-nums; color: #FFF7EB; display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
.mdr-tl-icon { width: 40px; height: 40px; object-fit: contain; }
.mdr-tl-dot { width: 10px; height: 10px; border-radius: 9999px; background: var(--paper); justify-self: center; box-shadow: 0 0 0 2px rgba(236,228,216,.13); }
.mdr-tl-label { font-size: 15px; color: rgba(236,228,216,.85); }

/* Sổ lưu bút */
.mdr-guestbook { position: relative; padding: 80px 24px 40px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
.mdr-gb-form { width: 100%; max-width: 600px; display: flex; flex-direction: column; gap: 12px; }
.mdr-gb-form input, .mdr-gb-form textarea {
  width: 100%; box-sizing: border-box; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--ink);
  background: transparent; color: var(--ink); font: inherit; font-size: 14px;
}
.mdr-gb-form textarea { resize: none; }
.mdr-sent { margin: 0; font-size: 13px; color: #065f46; text-align: center; }
.mdr-gb-list { width: 100%; max-width: 600px; max-height: 500px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
.mdr-gb-item { border: 1px solid rgba(81,20,25,.33); background: rgba(255,255,255,.55); border-radius: 8px; padding: 14px 16px; font-size: 14px; }
.mdr-gb-head { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
.mdr-gb-head span:first-child { font-weight: 600; color: var(--ink); font-size: 14px; }
.mdr-gb-item p { margin: 0; line-height: 1.5; }

/* Hộp quà */
.mdr-gift { position: relative; padding: 40px 24px; display: flex; flex-direction: column; align-items: center; background: rgba(81,20,25,.05); border-top: 1px solid rgba(81,20,25,.1); }
.mdr-gift-btn { position: relative; width: 250px; height: 357px; border: 0; background: transparent; padding: 0; margin-top: 16px; }
.mdr-gift-img { position: absolute; inset: 0; margin: auto; width: 190px; height: 275px; object-fit: contain; transition: transform .6s ease; }
.mdr-gift-btn:hover .mdr-gift-img { transform: translateY(-6px) rotate(-2deg); }
.mdr-gift-hint { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); font-size: 12px; font-weight: 600; white-space: nowrap; }
.mdr-dialog { border: 0; border-radius: 16px; padding: 0; width: min(92vw, 560px); background: var(--cream); color: var(--ink); overflow: hidden; }
.mdr-dialog::backdrop { background: rgba(0,0,0,.7); }
.mdr-dialog-head { position: relative; background: var(--ink); color: #fff; text-align: center; padding: 20px 24px; }
.mdr-dialog-head h3 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: .03em; }
.mdr-dialog-close { position: absolute; right: 12px; top: 12px; width: 32px; height: 32px; border-radius: 9999px; border: 0; background: rgba(255,255,255,.15); color: #fff; }
.mdr-dialog-body { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; padding: 24px; }
.mdr-qr-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; width: 200px; font-size: 12px; }
.mdr-qr-card h4 { margin: 0 0 6px; font-size: 12px; font-weight: 500; }
.mdr-qr-card img { width: 160px; height: 160px; background: #fff; border-radius: 12px; padding: 8px; border: 2px solid rgba(81,20,25,.13); }
.mdr-qr-card p { margin: 0; }
.mdr-qr-card .mono { font-family: monospace; }
.mdr-qr-card .bold { font-weight: 700; }

/* Footer */
.mdr-footer { padding: 32px 24px 16px; text-align: center; font-size: 13px; color: var(--ink); }
.mdr-footer p { margin: 0; }
.mdr-site { margin-top: 16px; font-size: 12px; opacity: .5; }

/* Nút nhạc */
.mdr-music {
  position: fixed; left: 16px; bottom: 16px; z-index: 500; width: 44px; height: 44px; border-radius: 9999px; border: 0;
  display: flex; align-items: center; justify-content: center; background: var(--ink); color: var(--paper);
  box-shadow: 0 8px 20px rgba(0,0,0,.35);
}

@keyframes drFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@media (prefers-reduced-motion: reduce) {
  .mdr-env-photo-wrap, .mdr-env-flower { animation: none; }
  .mdr-card { transition: none; }
}
`;