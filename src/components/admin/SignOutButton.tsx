'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export function SignOutButton() {
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() => {
        setPending(true);
        void signOut({ callbackUrl: '/admin/login' });
      }}
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}
