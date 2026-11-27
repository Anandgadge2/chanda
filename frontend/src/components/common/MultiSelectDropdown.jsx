'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

/**
 * Industry-standard searchable multi-select combobox dropdown.
 * Supports flat or grouped-hint options ({ value, label, subLabel }),
 * Select All / Clear All, live search filtering, and compact selected chips.
 */
export default function MultiSelectDropdown({
  label,
  required = false,
  options = [], // Array of { value: string, label: string, subLabel?: string }
  selectedValues = [],
  onChange,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  emptyText = 'No matching options found.',
  selectAllText = 'Select All',
  clearText = 'Clear',
  selectedLabelText = 'selected',
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  showChips = true,
  maxVisibleChips = 6,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label?.toLowerCase().includes(q) ||
        opt.subLabel?.toLowerCase().includes(q) ||
        opt.value?.toLowerCase().includes(q)
    );
  }, [options, query]);

  const labelByValue = useMemo(() => {
    const map = new Map();
    for (const opt of options) {
      map.set(opt.value, opt.label);
    }
    return map;
  }, [options]);

  const toggleOption = (val) => {
    if (disabled) return;
    const exists = selectedValues.includes(val);
    const next = exists
      ? selectedValues.filter((item) => item !== val)
      : [...selectedValues, val];
    onChange(next);
  };

  const handleSelectAllFiltered = () => {
    if (disabled) return;
    const filteredVals = filteredOptions.map((o) => o.value);
    const next = Array.from(new Set([...selectedValues, ...filteredVals]));
    onChange(next);
  };

  const handleClearAll = (e) => {
    if (e) e.stopPropagation();
    if (disabled) return;
    onChange([]);
  };

  const triggerText = useMemo(() => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length <= 2) {
      return selectedValues.map((v) => labelByValue.get(v) || v).join(', ');
    }
    const first = labelByValue.get(selectedValues[0]) || selectedValues[0];
    return `${first} + ${selectedValues.length - 1} ${selectedLabelText}`;
  }, [selectedValues, labelByValue, placeholder, selectedLabelText]);

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label className="block text-[11px] font-bold text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {selectedValues.length > 0 && (
            <span className="text-[10px] font-bold text-indigo-700">
              {selectedValues.length} {selectedLabelText}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          aria-expanded={open}
          className={`w-full text-left text-xs px-3 py-2 rounded-xl border bg-white flex items-center justify-between gap-2 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
            open
              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
              : 'border-slate-200 hover:border-indigo-300'
          }`}
        >
          <span className={`truncate font-semibold ${selectedValues.length === 0 ? 'text-slate-400 font-normal' : 'text-slate-800'}`}>
            {loading && options.length === 0 ? loadingText : triggerText}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {selectedValues.length > 0 && !disabled && (
              <span
                role="button"
                tabIndex={-1}
                onClick={handleClearAll}
                className="p-0.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                aria-label="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180 text-indigo-600' : ''}`}
            />
          </div>
        </button>

        {open && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-100">
            {/* Search Bar */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/70 space-y-1.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold px-0.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    disabled={filteredOptions.length === 0}
                    className="text-indigo-700 hover:underline disabled:opacity-40 cursor-pointer"
                  >
                    {selectAllText} ({filteredOptions.length})
                  </button>
                  {selectedValues.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-rose-600 hover:underline cursor-pointer"
                    >
                      {clearText}
                    </button>
                  )}
                </div>
                <span className="text-slate-500">
                  {selectedValues.length} {selectedLabelText}
                </span>
              </div>
            </div>

            {/* Option List */}
            <div className="max-h-52 overflow-y-auto divide-y divide-slate-50 p-1">
              {loading && options.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">{loadingText}</div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">{emptyText}</div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  return (
                    <button
                      key={`${opt.value}-${opt.subLabel || ''}`}
                      type="button"
                      onClick={() => toggleOption(opt.value)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-950 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {opt.subLabel && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">
                          {opt.subLabel}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Compact Selected Chips */}
      {showChips && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {selectedValues.slice(0, maxVisibleChips).map((val) => (
            <span
              key={val}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200/80 text-[10px] font-bold"
            >
              <span className="truncate max-w-[140px]">{labelByValue.get(val) || val}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => toggleOption(val)}
                  className="hover:text-rose-600 cursor-pointer"
                  aria-label={`Remove ${val}`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </span>
          ))}
          {selectedValues.length > maxVisibleChips && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
              +{selectedValues.length - maxVisibleChips}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
