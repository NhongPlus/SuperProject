import { HomePage } from '../pages/home/HomePage';
import { LoginRoute, RegisterRoute } from '../features/auth/AuthGuards';
import { CreateInvitationPage } from '../pages/create/CreateInvitationPage';
import { TemplatesPage } from '../pages/templates/TemplatesPage';
import { TemplatePreviewPage } from '../pages/templates/TemplatePreviewPage';
import { TemplateDemoPage } from '../pages/templates/TemplateDemoPage';
import { AccountPage } from '../pages/account/AccountPage';
import { InvitationsPage } from '../pages/invitations/InvitationsPage';
import { InvitationEditPage } from '../pages/invitations/InvitationEditPage';
import { PublicInvitationPage } from '../pages/public/PublicInvitationPage';
import { ROUTES } from '../config/site';
import type { AppRoute } from './types';

// Khai báo toàn bộ route ở đây. Thêm trang mới: thêm một dòng vào danh sách.
export const routes: AppRoute[] = [
  // ----- Không bọc layout -----
  { key: 'home', path: ROUTES.home, component: HomePage, layout: 'none' },
  { key: 'login', path: ROUTES.login, component: LoginRoute, layout: 'none' },
  { key: 'register', path: ROUTES.register, component: RegisterRoute, layout: 'none' },
  { key: 'templateDemo', path: `${ROUTES.templates}/:slug/demo`, component: TemplateDemoPage, layout: 'none' },
  { key: 'account', path: ROUTES.account, component: AccountPage, layout: 'public', auth: true },
  // ----- Bọc PublicLayout (header + footer) -----
  { key: 'templates', path: ROUTES.templates, component: TemplatesPage, layout: 'public' },
  { key: 'templateDetail', path: `${ROUTES.templates}/:key`, component: TemplatePreviewPage, layout: 'public' },
  { key: 'create', path: ROUTES.create, component: CreateInvitationPage, layout: 'public', auth: true },
  { key: 'invitations', path: ROUTES.invitations, component: InvitationsPage, layout: 'public', auth: true },
  { key: 'invitationEdit', path: `${ROUTES.invitations}/:id`, component: InvitationEditPage, layout: 'public', auth: true },
  // Trang khách: đặt cuối cùng để không che các đường dẫn khác
  { key: 'publicInvitation', path: '/:slug', component: PublicInvitationPage, layout: 'none' },
];