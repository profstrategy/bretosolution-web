'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { adminShellCopy } from '@/content/admin';
import { ADMIN_LOGIN_PATH_CLIENT } from '@/components/admin/paths';

export function LogoutButton() {
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await signOut({ callbackUrl: ADMIN_LOGIN_PATH_CLIENT });
    } catch {
      setPending(false);
    }
  }

  return (
    <Button
      variant="small"
      onClick={handleLogout}
      disabled={pending}
      aria-busy={pending}
      className="shrink-0 px-3 sm:px-4"
    >
      <LogOut className="h-[16px] w-[16px]" aria-hidden="true" />
      <span>{pending ? adminShellCopy.loggingOut : adminShellCopy.logout}</span>
    </Button>
  );
}
