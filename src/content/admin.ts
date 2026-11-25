export const DEFAULT_ADMIN_INBOX_ADDRESS = 'hello@bretosolution.com';

export const adminShellCopy = {
  brandSuffix: 'Admin',
  navLabel: 'Admin',
  breadcrumbRoot: 'Admin',
  openMenuLabel: 'Open navigation menu',
  closeMenuLabel: 'Close navigation menu',
  drawerLabel: 'Admin navigation',
  collapseSidebarLabel: 'Collapse sidebar',
  expandSidebarLabel: 'Expand sidebar',
  logout: 'Log out',
  loggingOut: 'Logging out…',
  signedInAs: 'Signed in as',
  sections: {
    emails: 'Emails',
  },
  detailFallback: 'Email',
} as const;

export const adminEmailsCopy = {
  metaTitle: 'Emails',
  title: 'Bretosolution email conversation',
  subtitle: (address: string) =>
    `Emails you send from this panel, and replies that arrive at ${address}.`,
  sendMail: 'Send a mail',
  tabsLabel: 'Email folders',
  tabs: {
    sending: 'Sending',
    receiving: 'Receiving',
  },
  loading: {
    sending: 'Loading emails…',
    receiving: 'Loading replies…',
  },
  empty: {
    sending: {
      heading: 'No emails yet',
      body: 'Emails you send or save as drafts from this panel will appear here.',
    },
    receiving: {
      heading: 'No replies yet',
      body: (address: string) =>
        `When someone emails ${address}, it will appear here.`,
    },
  },
  noSubject: '(no subject)',
} as const;
