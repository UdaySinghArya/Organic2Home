import { paths } from './paths.js';

export const ACCOUNT_LINKS = [
  {
    to: paths.orders,
    icon: 'shopping_basket',
    label: 'My orders',
    body: 'Live tracking & harvest slips',
    desktopLabel: 'My Orders',
    desktopBody: 'Track harvest to doorstep',
  },
  {
    to: paths.addresses,
    icon: 'cottage',
    label: 'Saved addresses',
    body: 'Morning doorstep drops',
    desktopLabel: 'Saved Addresses',
    desktopBody: 'Primary doorstep destination',
  },
  {
    to: paths.help,
    icon: 'support_agent',
    label: 'Help',
    body: 'Farm queries & order assistance',
    desktopLabel: 'Support & FAQ',
    desktopBody: 'Morning cutoff guidelines',
  },
];
