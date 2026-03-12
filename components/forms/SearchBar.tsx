import { Search } from 'lucide-react';
import { InputHTMLAttributes, forwardRef } from 'react';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ placeholder = 'Buscar...', className = '', ...props }, ref) => {
    return (
      <div className={`relative ${className}`}>
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" />
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] shadow-[var(--surface-box)] focus:border-indigo-500"
          {...props}
        />
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
