import type { TemplateModule } from './types';
import dragonPhoenixRed from './catalog/dragon-phoenix-red';
import royalBlue from './catalog/royal-blue';
import cherryBlossomPink from './catalog/cherry-blossom-pink';

/**
 * Danh sách mọi mẫu. Thêm mẫu mới: tạo thư mục trong catalog/ rồi import và thêm vào đây.
 */
export const templates: TemplateModule[] = [dragonPhoenixRed, royalBlue, cherryBlossomPink];

export const getTemplate = (slug: string) => templates.find((t) => t.meta.slug === slug);
