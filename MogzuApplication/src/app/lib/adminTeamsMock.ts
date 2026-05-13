export type TeamMemberKind = 'staff' | 'partner';

export type StaffRow = {
  id: string;
  kind: TeamMemberKind;
  name: string;
  avatarUrl?: string;
  role: string;
  email: string;
  permissions: string;
  createdOn: string;
};

export const TEAMS_TOTAL_COPY = '500 total users';

export const SEED_TEAM_ROWS: StaffRow[] = [
  {
    id: 's1',
    kind: 'staff',
    name: 'Kapil Dev',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop',
    role: 'Manager',
    email: 'kapil@mail.com',
    permissions: 'Limited',
    createdOn: 'Jun 21, 2024',
  },
  {
    id: 's2',
    kind: 'staff',
    name: 'Riya Nair',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
    role: 'Assistant',
    email: 'riya@mail.com',
    permissions: 'Limited',
    createdOn: 'Jul 02, 2024',
  },
  {
    id: 's3',
    kind: 'staff',
    name: 'Vikram Singh',
    role: 'Stock manager',
    email: 'vikram@mail.com',
    permissions: 'Full',
    createdOn: 'Aug 10, 2024',
  },
  {
    id: 's4',
    kind: 'staff',
    name: 'Anita Rao',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
    role: 'Sales',
    email: 'anita@mail.com',
    permissions: 'Limited',
    createdOn: 'Sep 05, 2024',
  },
  {
    id: 's5',
    kind: 'staff',
    name: 'Rohit Kapoor',
    role: 'Manager',
    email: 'rohit@mail.com',
    permissions: 'Full',
    createdOn: 'Oct 12, 2024',
  },
  {
    id: 'p1',
    kind: 'partner',
    name: 'Urban Events Ltd',
    role: 'Partner admin',
    email: 'ops@urbanevents.in',
    permissions: 'Limited',
    createdOn: 'May 15, 2024',
  },
  {
    id: 'p2',
    kind: 'partner',
    name: 'Fresh Catering Co.',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop',
    role: 'Partner manager',
    email: 'admin@freshcatering.com',
    permissions: 'Limited',
    createdOn: 'Jun 01, 2024',
  },
  {
    id: 'p3',
    kind: 'partner',
    name: 'Northwind Traders',
    role: 'Partner viewer',
    email: 'portal@northwind.in',
    permissions: 'Limited',
    createdOn: 'Jul 18, 2024',
  },
];

export type PermissionSection = {
  title: string;
  /** stable id -> label */
  items: { id: string; label: string }[];
};

export const PERMISSION_SECTIONS: PermissionSection[] = [
  {
    title: 'Product',
    items: [
      { id: 'p_add_new', label: 'Add New product' },
      { id: 'p_show_all', label: 'Show All Products' },
      { id: 'p_show_inhouse', label: 'Show In House Products' },
      { id: 'p_show_seller', label: 'Show Seller Products' },
      { id: 'p_edit', label: 'Product Edit' },
      { id: 'p_duplicate', label: 'Product Duplicate' },
      { id: 'p_delete', label: 'Product Delete' },
      { id: 'p_show_digital', label: 'Show Digital Products' },
      { id: 'p_add_digital', label: 'Add Digital Product' },
      { id: 'p_edit_digital', label: 'Edit Digital Product' },
      { id: 'p_delete_digital', label: 'Delete Digital Product' },
      { id: 'p_download_digital', label: 'Download Digital Product' },
      { id: 'p_bulk_import', label: 'Product Bulk Import' },
      { id: 'p_bulk_export', label: 'Product Bulk Export' },
    ],
  },
  {
    title: 'Product Review',
    items: [
      { id: 'pr_view', label: 'View Product Reviews' },
      { id: 'pr_publish', label: 'Publish Product Review' },
    ],
  },
  {
    title: 'Sale',
    items: [
      { id: 'sale_all', label: 'View All Orders' },
      { id: 'sale_inhouse', label: 'View Inhouse Orders' },
      { id: 'sale_seller', label: 'View Seller Orders' },
      { id: 'sale_pickup', label: 'View Pickup Point Orders' },
      { id: 'sale_details', label: 'View Order Details' },
      { id: 'sale_payment', label: 'Update Order Payment Status' },
      { id: 'sale_delivery', label: 'Update Order Delivery Status' },
      { id: 'sale_delete', label: 'Delete Order' },
    ],
  },
  {
    title: 'Customer',
    items: [
      { id: 'cust_all', label: 'View All Customers' },
      { id: 'cust_login_as', label: 'Login As Customer' },
      { id: 'cust_ban', label: 'Ban Customer' },
      { id: 'cust_delete', label: 'Delete Customer' },
      { id: 'cust_cls_view', label: 'View Classified Products' },
      { id: 'cust_cls_publish', label: 'Publish Classified Product' },
      { id: 'cust_cls_delete', label: 'Delete Classified Product' },
      { id: 'cust_pkg_view', label: 'View Classified Packages' },
      { id: 'cust_pkg_add', label: 'Add Classified Package' },
      { id: 'cust_pkg_edit', label: 'Edit Classified Package' },
      { id: 'cust_pkg_delete', label: 'Delete Classified Package' },
    ],
  },
];

export function buildDefaultPermissionState(): Record<string, boolean> {
  const m: Record<string, boolean> = {};
  PERMISSION_SECTIONS.forEach((sec) => {
    sec.items.forEach((it) => {
      m[it.id] = false;
    });
  });
  return m;
}
