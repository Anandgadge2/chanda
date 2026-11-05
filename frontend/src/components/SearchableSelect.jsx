'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { useTranslation } from './LanguageContext';

/**
 * Modern, accessible, searchable dropdown component for Chandrapur Land Records Portal.
 * Clean, minimalistic styling with royal navy accents, smooth keyboard navigation,
 * accurate viewport boundary alignment, and zero-jitter scroll handling.
 */
export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  icon: Icon,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  disabled = false,
  ariaLabel,
  showCount = true,
  align = 'left',
  allowCustom = false,
  clearValue = ''
}) {
  const { isMarathi } = useTranslation();
  const effectivePlaceholder = placeholder || (isMarathi ? 'निवडा...' : 'Select...');
  const effectiveSearchPlaceholder = searchPlaceholder || (isMarathi ? 'शोधा...' : 'Search...');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownAlign, setDropdownAlign] = useState(align);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsListRef = useRef(null);
  const itemRefs = useRef([]);
  const isKeyboardNavRef = useRef(false);

  // Normalize options to { value, label, subtext, count }
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          value: opt.value !== undefined ? opt.value : (opt.villageName || opt.name || ''),
          label: opt.label !== undefined ? opt.label : (opt.villageName || opt.name || String(opt.value ?? '')),
          subtext: opt.subtext || '',
          count: opt.count !== undefined ? opt.count : (opt.total712Count !== undefined ? opt.total712Count : undefined)
        };
      }
      return {
        value: opt,
        label: String(opt),
        subtext: '',
        count: undefined
      };
    });
  }, [options]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    if (value === undefined || value === null || value === '' || value === 'all') return undefined;
    const found = normalizedOptions.find((opt) => String(opt.value) === String(value));
    if (found) return found;
    if (allowCustom && value) {
      return {
        value,
        label: String(value),
        subtext: ''
      };
    }
    return undefined;
  }, [normalizedOptions, value, allowCustom]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    let result = normalizedOptions;
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      result = normalizedOptions.filter((opt) => {
        const matchLabel = opt.label && String(opt.label).toLowerCase().includes(term);
        const matchVal = opt.value !== undefined && String(opt.value).toLowerCase().includes(term);
        const matchSub = opt.subtext && String(opt.subtext).toLowerCase().includes(term);
        return matchLabel || matchVal || matchSub;
      });
    }

    if (allowCustom && term) {
      const exactMatch = normalizedOptions.some(
        (opt) =>
          (opt.label && String(opt.label).toLowerCase() === term) ||
          (opt.value !== undefined && String(opt.value).toLowerCase() === term)
      );
      if (!exactMatch) {
        result = [
          {
            value: searchTerm.trim(),
            label: searchTerm.trim(),
            subtext: isMarathi ? '+ हे नवीन गाव प्रविष्ट करा' : '+ Use custom entered name',
            isCustom: true
          },
          ...result
        ];
      }
    }

    return result;
  }, [normalizedOptions, searchTerm, allowCustom, isMarathi]);

  // Auto-detect viewport boundary on open so dropdown never clips off screen
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
      if (align === 'right' || rect.left + 260 > viewportWidth) {
        setDropdownAlign('right');
      } else {
        setDropdownAlign('left');
      }
    }
  }, [isOpen, align]);

  // Initialize or reset highlighted index when opening or filtering
  useEffect(() => {
    if (isOpen) {
      const selIdx = filteredOptions.findIndex(
        (opt) => value !== undefined && value !== null && String(opt.value) === String(value)
      );
      const targetIdx = selIdx >= 0 ? selIdx : 0;
      setHighlightedIndex(targetIdx);

      // On open, ensure scroll position starts at top cleanly unless selecting an item further down
      if (optionsListRef.current) {
        if (targetIdx <= 1) {
          optionsListRef.current.scrollTop = 0;
        } else {
          setTimeout(() => {
            const itemEl = itemRefs.current[selIdx];
            const listEl = optionsListRef.current;
            if (itemEl && listEl) {
              const itemRect = itemEl.getBoundingClientRect();
              const listRect = listEl.getBoundingClientRect();
              if (itemRect.top < listRect.top || itemRect.bottom > listRect.bottom) {
                listEl.scrollTop = itemEl.offsetTop;
              }
            }
          }, 30);
        }
      }
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, searchTerm, filteredOptions, value]);

  // Keep highlighted item in view ONLY when keyboard navigation is active
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && itemRefs.current[highlightedIndex] && isKeyboardNavRef.current) {
      const itemEl = itemRefs.current[highlightedIndex];
      const listEl = optionsListRef.current;
      if (itemEl && listEl) {
        const itemRect = itemEl.getBoundingClientRect();
        const listRect = listEl.getBoundingClientRect();
        if (itemRect.top < listRect.top) {
          listEl.scrollTop -= (listRect.top - itemRect.top + 4);
        } else if (itemRect.bottom > listRect.bottom) {
          listEl.scrollTop += (itemRect.bottom - listRect.bottom + 4);
        }
      }
    }
  }, [highlightedIndex, isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input with preventScroll to stop any parent layout jumping
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus({ preventScroll: true });
        }
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchTerm('');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      isKeyboardNavRef.current = true;
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      isKeyboardNavRef.current = true;
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex].value);
      } else if (allowCustom && searchTerm.trim()) {
        handleSelect(searchTerm.trim());
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleSelect = (val) => {
    if (onChange) {
      onChange(val);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const displayText = selectedOption
    ? selectedOption.label
    : (effectivePlaceholder || (isMarathi ? 'सर्व' : 'All'));

  const isFiltered = value !== undefined && value !== null && value !== '' && value !== 'all';

  // Determine intelligent clear value based on provided clearValue or options convention
  const effectiveClearValue = useMemo(() => {
    if (clearValue !== undefined && clearValue !== '') return clearValue;
    if (normalizedOptions.some((o) => o.value === 'all')) return 'all';
    if (normalizedOptions.some((o) => o.value === '')) return '';
    return normalizedOptions[0]?.value ?? '';
  }, [clearValue, normalizedOptions]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full ${className} ${isOpen ? 'z-[60]' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel || placeholder}
        aria-expanded={isOpen}
        title={displayText}
        className={`w-full h-11 min-h-[44px] flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl border text-[15px] leading-[1.5] transition cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none shadow-2xs ${
          isFiltered
            ? 'bg-blue-50/90 hover:bg-blue-100/70 border-blue-300/80 text-blue-950 font-bold'
            : 'bg-slate-50/90 hover:bg-white hover:border-slate-300 border-slate-200 text-[#0F172A] font-medium'
        } ${
          isOpen ? 'ring-2 ring-[#242b6b]/15 bg-white border-[#242b6b] shadow-xs' : 'focus:ring-2 focus:ring-[#242b6b]/15 focus:border-[#242b6b]'
        } ${buttonClassName}`}
      >
        <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
          {Icon && (
            <Icon
              className={`w-4 h-4 shrink-0 ${
                isFiltered ? 'text-[#242b6b]' : 'text-[#64748B]'
              }`}
            />
          )}
          <span
            className={`truncate text-left flex-1 text-[15px] leading-[1.5] ${
              isFiltered ? 'text-[#0F172A] font-bold' : (!value || value === 'all' ? 'text-[#64748B] font-medium' : 'text-[#0F172A] font-medium')
            }`}
            title={displayText}
          >
            {displayText}
          </span>
          {showCount && selectedOption?.count !== undefined && (
            <span className="text-[13px] text-[#242b6b] bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full shrink-0 font-bold leading-[1.5]">
              {selectedOption.count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isFiltered && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(effectiveClearValue);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  handleSelect(effectiveClearValue);
                }
              }}
              title={isMarathi ? 'हा फिल्टर साफ करा' : 'Clear this filter'}
              aria-label={isMarathi ? 'हा फिल्टर साफ करा' : 'Clear this filter'}
              className="p-1 rounded-md hover:bg-blue-200/60 text-[#242b6b] hover:text-blue-950 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
              isOpen
                ? 'rotate-180 text-[#242b6b]'
                : isFiltered
                ? 'text-[#242b6b]'
                : 'text-[#64748B]'
            }`}
          />
        </div>
      </button>

      {/* Floating Dropdown Popover */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute ${
            dropdownAlign === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 w-full min-w-[260px] sm:min-w-[290px] max-w-[calc(100vw-2rem)] sm:max-w-[360px] bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/12 z-[100] flex flex-col max-h-[360px] overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${dropdownClassName}`}
        >
          {/* Fixed Search Header */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={effectiveSearchPlaceholder}
                className="w-full pl-9 pr-8 py-2 text-[14.5px] leading-[1.5] bg-white border border-slate-200/90 rounded-xl text-[#0F172A] font-medium placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#242b6b]/15 focus:border-[#242b6b] transition shadow-2xs tracking-normal"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    searchInputRef.current?.focus({ preventScroll: true });
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-md transition cursor-pointer"
                  title={isMarathi ? 'शोध साफ करा' : 'Clear search'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sub-header with Results Count & Search State */}
            <div className="flex items-center justify-between text-[13.5px] text-[#475569] px-1 pt-2 font-medium select-none">
              <div className="flex items-center gap-1.5 text-[#475569] font-medium text-[13.5px]">
                <span>{isMarathi ? 'उपलब्ध पर्याय' : 'Available options'}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200/70 text-[#0F172A] font-bold text-[13px]">
                  {filteredOptions.length}
                </span>
              </div>
              {searchTerm && (
                <span className="text-[13px] text-[#242b6b] bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md font-bold">
                  {isMarathi ? 'शोध सक्रिय' : 'Filtered'}
                </span>
              )}
            </div>
          </div>

          {/* Options List */}
          <div
            ref={optionsListRef}
            tabIndex={-1}
            onMouseMove={() => {
              isKeyboardNavRef.current = false;
            }}
            className="relative flex-1 overflow-y-auto overscroll-contain min-h-0 p-1.5 space-y-0.5 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.300)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-7 px-3 text-center select-none">
                <div className="w-9 h-9 mx-auto mb-2 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <p className="text-[14px] font-semibold text-slate-700 leading-[1.5]">{isMarathi ? 'कोणताही पर्याय सापडला नाही' : 'No options found'}</p>
                {searchTerm && (
                  <p className="text-[13px] text-[#475569] mt-0.5 truncate max-w-[200px] mx-auto font-mono">
                    "{searchTerm}"
                  </p>
                )}
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected =
                  value !== undefined && value !== null && String(opt.value) === String(value);
                const isHighlighted = idx === highlightedIndex;

                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    ref={(el) => (itemRefs.current[idx] = el)}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => {
                      isKeyboardNavRef.current = false;
                      setHighlightedIndex(idx);
                    }}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between text-[14.5px] leading-[1.5] rounded-xl transition cursor-pointer select-none tracking-normal ${
                      isSelected
                        ? 'bg-[#242b6b]/10 text-[#242b6b] font-bold border border-[#242b6b]/20 shadow-2xs'
                        : isHighlighted
                        ? 'bg-slate-100/90 text-slate-900 font-semibold'
                        : opt.isCustom
                        ? 'bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-950 border border-dashed border-emerald-300/80 font-bold'
                        : 'text-slate-800 hover:bg-slate-50/90 font-medium hover:text-slate-950'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 truncate">
                        {opt.isCustom ? (
                          <span className="inline-flex items-center gap-1.5 truncate text-emerald-900">
                            <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-[12px] font-black shrink-0">+</span>
                            <span className="truncate">{opt.label}</span>
                          </span>
                        ) : (
                          <span className="truncate">{opt.label}</span>
                        )}
                        {opt.count !== undefined && (
                          <span
                            className={`text-[12.5px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                              isSelected
                                ? 'bg-[#242b6b] text-white'
                                : 'bg-slate-100 text-slate-700 border border-slate-200/60'
                            }`}
                          >
                            {opt.count}
                          </span>
                        )}
                      </div>
                      {opt.subtext && (
                        <span className={`text-[10px] font-normal truncate mt-0.5 ${opt.isCustom ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                          {opt.subtext}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#242b6b] shrink-0 ml-1.5 stroke-[2.5]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
