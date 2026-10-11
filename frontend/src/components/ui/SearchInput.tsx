import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  delay?: number;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value: initialValue = '',
  onChange,
  placeholder = 'Search...',
  delay = 300,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  useEffect(() => {
    onChange(debouncedTerm);
  }, [debouncedTerm, onChange]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-100 focus:border-navy-700 transition-colors"
      />
      {searchTerm && (
        <button
          onClick={() => {
            setSearchTerm('');
            onChange('');
          }}
          className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
