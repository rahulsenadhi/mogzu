/**
 * Static vendor orders shown in the vendor orders list (demo).
 * Kept in one module so the order details screen can resolve the same rows by `orderId`.
 */

export type VendorOrderListTab =
  | 'all'
  | 'order_request'
  | 'pending_orders'
  | 'confirmed_orders'
  | 'canceled_orders'
  | 'invoices'
  | 'completed';

export type VendorDemoOrderRow = {
  srNo: string;
  orderId: string;
  productService: string;
  customerName: string;
  dates: string;
  qty: number;
  price: string;
  status: 'Processing' | 'Completed' | 'Canceled' | 'Pending';
  paymentStatus: 'Pending' | 'Paid' | 'Cancel' | 'Waiting';
  type: VendorOrderListTab;
};

export const DEMO_VENDOR_STATIC_ORDERS: VendorDemoOrderRow[] = [
  {
    srNo: '0001',
    orderId: '001021',
    productService: 'Team meeting',
    customerName: 'Kapil Dev',
    dates:
      'Received: Jun 21, 2024 18:10:32\nAccepted: Jun 21, 2024 18:10:32\nCompleted: Jun 21, 2024 18:10:32',
    qty: 15,
    price: '₹ 1500',
    status: 'Processing',
    paymentStatus: 'Pending',
    type: 'order_request',
  },
  {
    srNo: '0001',
    orderId: '001022',
    productService: 'Team meeting',
    customerName: 'Kapil Dev',
    dates:
      'Received: Jun 21, 2024 18:10:32\nAccepted: Jun 21, 2024 18:10:32\nCompleted: Jun 21, 2024 18:10:32',
    qty: 15,
    price: '₹ 1500',
    status: 'Completed',
    paymentStatus: 'Paid',
    type: 'completed',
  },
  {
    srNo: '0001',
    orderId: '001023',
    productService: 'Team meeting',
    customerName: 'Kapil Dev',
    dates:
      'Received: Jun 21, 2024 18:10:32\nAccepted: Jun 21, 2024 18:10:32\nCompleted: Jun 21, 2024 18:10:32',
    qty: 15,
    price: '₹ 1500',
    status: 'Canceled',
    paymentStatus: 'Cancel',
    type: 'canceled_orders',
  },
  {
    srNo: '0001',
    orderId: '001024',
    productService: 'Team meeting',
    customerName: 'Kapil Dev',
    dates:
      'Received: Jun 21, 2024 18:10:32\nAccepted: Jun 21, 2024 18:10:32\nCompleted: Jun 21, 2024 18:10:32',
    qty: 15,
    price: '₹ 1500',
    status: 'Processing',
    paymentStatus: 'Pending',
    type: 'pending_orders',
  },
];

export function findDemoVendorStaticOrderByOrderId(orderId: string): VendorDemoOrderRow | undefined {
  return DEMO_VENDOR_STATIC_ORDERS.find((o) => o.orderId === orderId);
}
