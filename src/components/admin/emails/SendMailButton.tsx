'use client';

import { Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { adminEmailsCopy } from '@/content/admin';

interface SendMailButtonProps {
  onClick: () => void;
  className?: string;
}

export function SendMailButton({ onClick, className }: SendMailButtonProps) {
  return (
    <Button variant="primary" onClick={onClick} className={className}>
      <Send className="h-[18px] w-[18px]" aria-hidden="true" />
      <span>{adminEmailsCopy.sendMail}</span>
    </Button>
  );
}
