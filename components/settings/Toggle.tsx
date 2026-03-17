interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="relative rounded-full transition-all shrink-0 flex items-center"
      style={{ width: 40, height: 22, background: value ? '#6366F1' : 'rgba(107,114,128,0.3)' }}
    >
      <div
        className="absolute w-4 h-4 rounded-full bg-white shadow transition-all"
        style={{ left: value ? 22 : 4 }}
      />
    </button>
  );
}
