import type {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ReactNode,
} from 'react';
import { AppLink } from './AppLink';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'small';

interface BaseProps {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}

type ButtonAsLinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
    href: string;
  };

type ButtonAsButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

export type ButtonProps = ButtonAsLinkProps | ButtonAsButtonProps;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'min-h-[52px] px-6 rounded-[10px] border-[1.5px] border-[var(--btn)] bg-[var(--btn)] text-[var(--btnfg)] text-[16px] font-semibold hover:opacity-90',
  secondary:
    'min-h-[52px] px-6 rounded-[10px] border-[1.5px] border-[var(--ink)] bg-transparent text-[var(--ink)] text-[16px] font-semibold hover:bg-[var(--btn2)]',
  small:
    'min-h-[44px] px-4 rounded-[10px] border border-[var(--line)] bg-[var(--btn2)] text-[var(--ink)] text-[15px] font-semibold hover:opacity-90',
};

const baseStyles =
  'inline-flex items-center justify-center gap-2 font-[family-name:var(--font-sans)] leading-snug transition-colors cursor-pointer select-none focus-visible:outline-[3px] focus-visible:outline-[var(--accent)] focus-visible:outline-offset-[2px] disabled:opacity-50 disabled:pointer-events-none';

export function Button(props: ButtonProps) {
  const { variant = 'primary', className, children } = props;
  const combinedClassName = cn(baseStyles, variantStyles[variant], className);

  if (typeof props.href === 'string') {
    const {
      variant: _variant,
      className: _className,
      children: _children,
      href,
      ...linkRest
    } = props;
    return (
      <AppLink href={href} className={combinedClassName} {...linkRest}>
        {children}
      </AppLink>
    );
  }

  const {
    variant: _variant,
    className: _className,
    children: _children,
    type = 'button',
    ...buttonRest
  } = props;

  return (
    <button type={type} className={combinedClassName} {...buttonRest}>
      {children}
    </button>
  );
}
