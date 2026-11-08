import type { ComponentType } from 'react';

export type TemplateBadge = 'hot' | 'new';

/** Thông tin hiển thị ở gallery và trong modal. Không chứa cấu trúc giao diện. */
export interface TemplateMeta {
  slug: string;
  name: string;
  style: string;
  badges?: TemplateBadge[];
  addedAt: string; // ISO date
  description: string;
  tags: string[];
  features: string[];
  /** Màu dùng cho thumbnail tạm, sẽ thay bằng ảnh thật sau */
  preview: { from: string; to: string; accent: string };
}

/** Dữ liệu mẫu mà mọi template đều nhận. */
export interface SampleData {
  groom: string;
  bride: string;
  date: string;
  time: string;
  venue: string;
  address: string;
}

export interface TemplateProps {
  data: SampleData;
}

/** Mỗi template export một object kiểu này. Component bên trong do template tự quyết định. */
export interface TemplateModule {
  meta: TemplateMeta;
  Component: ComponentType<TemplateProps>;
}
