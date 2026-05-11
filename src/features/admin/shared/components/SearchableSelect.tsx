import { useMemo, useState } from 'react';
import type { SearchOption } from '../types/admin.types';
import FieldShell from './FieldShell';
import { inputClassName, selectClassName } from '../utils';

type SearchableSelectProps = {
  label: string;
  value: string;
  options: SearchOption[];
  placeholder: string;
  emptyText: string;
  onChange: (value: string) => void;
};

export default function SearchableSelect({
  label,
  value,
  options,
  placeholder,
  emptyText,
  onChange,
}: SearchableSelectProps) {
  const [query, setQuery] = useState('');
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return options;
    }

    return options.filter((option) =>
      `${option.label} ${option.hint ?? ''}`.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  return (
    <FieldShell label={label}>
      <div className="space-y-3">
        <input
          className={inputClassName()}
          placeholder={placeholder}
          value={query || selectedOption?.label || ''}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            const exact = options.find((option) => option.label === nextQuery);
            if (!nextQuery.trim()) {
              onChange('');
            } else if (exact) {
              onChange(exact.value);
            }
          }}
        />
        <select
          className={selectClassName()}
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue);
            setQuery('');
          }}
        >
          <option value="">{emptyText}</option>
          {filteredOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.hint ? `${option.label} - ${option.hint}` : option.label}
            </option>
          ))}
        </select>
        <div className="rounded-none border border-[#23314d] bg-[#0f1727] px-3 py-2 text-xs text-slate-400">
          {value ? `Secili kayit: ${selectedOption?.label ?? value}` : emptyText}
        </div>
      </div>
    </FieldShell>
  );
}
