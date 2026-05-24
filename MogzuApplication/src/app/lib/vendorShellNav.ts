import type { NavigateFunction } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Calendar,
  FileText,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  Package,
  Settings,
  Star,
  Users,
} from 'lucide-react';
import type { VendorNavVisibility } from '@/app/lib/vendorModuleSelection';

export type VendorShellNavId =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'communication'
  | 'users'
  | 'spacex'
  | 'event-activity'
  | 'events-services'
  | 'promotion'
  | 'notifications'
  | 'reports'
  | 'calendar'
  | 'reviews'
  | 'settings';

export type VendorShellNavItem = {
  id: VendorShellNavId;
  label: string;
  icon: LucideIcon;
  active: boolean;
};

export function buildVendorShellNav(
  vis: VendorNavVisibility,
  activeId: VendorShellNavId
): VendorShellNavItem[] {
  const mark = (id: VendorShellNavId) => id === activeId;
  const items: VendorShellNavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, active: mark('dashboard') },
  ];
  if (vis.showProducts) items.push({ id: 'products', label: 'Products', icon: Package, active: mark('products') });
  if (vis.showOrders) items.push({ id: 'orders', label: 'Order details', icon: Calendar, active: mark('orders') });
  if (vis.showCommunication)
    items.push({ id: 'communication', label: 'Communication', icon: MessageSquare, active: mark('communication') });
  if (vis.showUsers) items.push({ id: 'users', label: 'Manage User', icon: Users, active: mark('users') });
  if (vis.showSpacex) items.push({ id: 'spacex', label: 'Spaces (spacex)', icon: FileText, active: mark('spacex') });
  if (vis.showEventActivity)
    items.push({ id: 'event-activity', label: 'Events activity', icon: FileText, active: mark('event-activity') });
  if (vis.showEventsServices)
    items.push({ id: 'events-services', label: 'Events services', icon: FileText, active: mark('events-services') });
  if (vis.showPromotions)
    items.push({ id: 'promotion', label: 'Paid Promotion', icon: Megaphone, active: mark('promotion') });
  if (vis.showNotifications)
    items.push({ id: 'notifications', label: 'Notification', icon: Bell, active: mark('notifications') });
  if (vis.showReports) items.push({ id: 'reports', label: 'Report', icon: Star, active: mark('reports') });
  if (vis.showCalendar) items.push({ id: 'calendar', label: 'Calendar', icon: Calendar, active: mark('calendar') });
  if (vis.showReviews) items.push({ id: 'reviews', label: 'Reviews', icon: Star, active: mark('reviews') });
  if (vis.showSettings) items.push({ id: 'settings', label: 'Settings', icon: Settings, active: mark('settings') });
  return items;
}

export type VendorShellNavActionOpts = {
  routeSource: string;
  onNotice?: (message: string) => void;
};

export function applyVendorShellNavAction(
  navigate: NavigateFunction,
  id: VendorShellNavId,
  opts: VendorShellNavActionOpts
): void {
  const notice = opts.onNotice;
  switch (id) {
    case 'dashboard':
      navigate('/vendor/dashboard');
      return;
    case 'products':
      navigate('/vendor/products');
      return;
    case 'orders':
      navigate('/vendor/orders');
      return;
    case 'communication':
      navigate('/vendor/communication');
      return;
    case 'users':
      navigate('/vendor/users');
      return;
    case 'spacex':
      navigate('/vendor/spacex');
      return;
    case 'event-activity':
      navigate('/vendor/event-activity');
      return;
    case 'events-services':
      navigate('/vendor/events');
      return;
    case 'promotion':
      navigate('/vendor/promotions-live');
      return;
    case 'notifications':
      navigate('/vendor/communication', {
        state: { source: opts.routeSource, channel: 'notifications' },
      });
      return;
    case 'reports':
      notice?.('Vendor reports and exports will be available in a future release.');
      return;
    case 'calendar':
      navigate('/vendor/calendar');
      return;
    case 'reviews':
      navigate('/vendor/reviews');
      return;
    case 'settings':
      notice?.('Vendor account settings will be available in a future release.');
      return;
    default:
      return;
  }
}
