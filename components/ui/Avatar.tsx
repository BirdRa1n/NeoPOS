import { COLORS } from '@/lib/constants';

const PALETTE = [COLORS.accent, COLORS.purple, COLORS.pink, COLORS.success, COLORS.warning, COLORS.info, COLORS.danger, COLORS.teal];

function getAvatarColor(name: string) {
  return PALETTE[name.charCodeAt(0) % PALETTE.length];
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const color = getAvatarColor(name);
  const initials = getInitials(name);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  return (
    <div
      className={`rounded-2xl flex items-center justify-center text-white font-bold ${sizes[size]} ${className}`}
      style={{ background: `linear-gradient(135deg,${color},${color}99)` }}
    >
      {initials}
    </div>
  );
}
