import type { DefaultSession } from 'next-auth';

export type AdminRole = 'admin';

declare module 'next-auth' {
  interface Session {
    user?: DefaultSession['user'] & {
      role?: AdminRole;
    };
  }

  interface User {
    role?: AdminRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: AdminRole;
  }
}
