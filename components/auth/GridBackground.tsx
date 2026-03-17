import { Tok } from '@/types/auth';

export function GridBackground({ tk }: { tk: Tok }) {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: tk.gridOpacity }}>
        <defs>
          <pattern id="auth-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke={tk.text} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
      </svg>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw', maxWidth: 700, maxHeight: 700, borderRadius: '50%', background: `radial-gradient(circle,${tk.orb1} 0%,transparent 70%)`, filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-15%', width: '50vw', height: '50vw', maxWidth: 600, maxHeight: 600, borderRadius: '50%', background: `radial-gradient(circle,${tk.orb2} 0%,transparent 70%)`, filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', top: '40%', left: '40%', width: '30vw', height: '30vw', maxWidth: 400, borderRadius: '50%', background: `radial-gradient(circle,${tk.orb3} 0%,transparent 70%)`, filter: 'blur(60px)' }} />
    </div>
  );
}
