export type SentNotificationRow = {
  id: string;
  title: string;
  meta: string;
  time: string;
  initials: string;
};

export const INITIAL_SENT_NOTIFICATIONS: SentNotificationRow[] = [
  {
    id: '1',
    title: 'Printed Round Neck Cotton Blend Black T-Shirt',
    meta: 'Added by Kapil Dev store managers',
    time: '16 Jul, 2024 18:10',
    initials: 'KD',
  },
  {
    id: '2',
    title: 'NESCO IT Park',
    meta: 'To Kapil Dev store managers',
    time: '15 Jul, 2024 14:22',
    initials: 'KP',
  },
  {
    id: '3',
    title: 'Q3 wellness stipend reminder',
    meta: 'Added by Ops team · All clients',
    time: '12 Jul, 2024 09:00',
    initials: 'OP',
  },
  {
    id: '4',
    title: 'Vendor payout schedule update',
    meta: 'To all vendors',
    time: '10 Jul, 2024 11:45',
    initials: 'VB',
  },
];
