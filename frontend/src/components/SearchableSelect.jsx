'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { useTranslation } from './LanguageContext';

/**
 * Modern, accessible, searchable dropdown component for Chandrapur Spatial Intelligence Portal.
 * Clean, minimalistic styling with modern indigo accents, smooth keyboard navigation,
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
  clearValue = '',
  compact = false,
  showSubtext = false
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

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = normalizedOptions.filter((opt) => {
        const matchLabel = opt.label.toLowerCase().includes(q);
        const matchValue = String(opt.value).toLowerCase().includes(q);
        const matchSub = opt.subtext ? opt.subtext.toLowerCase().includes(q) : false;
        return matchLabel || matchValue || matchSub;
      });
    }

    // If custom inputs are allowed, add the current search string as an option if not present
    if (allowCustom && searchTerm.trim() && !result.some((o) => o.label.toLowerCase() === searchTerm.toLowerCase())) {
      result = [
        {
          value: searchTerm.trim(),
          label: `${isMarathi ? 'शोध/वापरा:' : 'Use:'} "${searchTerm.trim()}"`,
          subtext: isMarathi ? 'कस्टम शोध मूल्य' : 'Custom value',
          isCustom: true
        },
        ...result
      ];
    }

    return result;
  }, [normalizedOptions, searchTerm, allowCustom, isMarathi]);

  // Sync highlightedIndex on options change
  useEffect(() => {
    setHighlightedIndex((prev) => {
      if (filteredOptions.length === 0) return -1;
      return prev >= 0 && prev < filteredOptions.length ? prev : 0;
    });
  }, [filteredOptions]);

  // Smart Viewport Collision Detection for Dropdown Alignment (Avoids right screen overflow)
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const updateAlignment = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 280; // Estimated max width

      if (align === 'right') {
        if (rect.right - dropdownWidth < 8) {
          setDropdownAlign('left');
        } else {
          setDropdownAlign('right');
        }
      } else {
        if (rect.left + dropdownWidth > viewportWidth - 8) {
          setDropdownAlign('right');
        } else {
          setDropdownAlign('left');
        }
      }
    };

    updateAlignment();
    window.addEventListener('resize', updateAlignment, { passive: true });
    return () => window.removeEventListener('resize', updateAlignment);
  }, [isOpen, align]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus({ preventScroll: true });
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
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
      setHighlightedIndex((prev) => {
        const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
        itemRefs.current[next]?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      isKeyboardNavRef.current = true;
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
        itemRefs.current[next]?.scrollIntoView({ block: 'nearest' });
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex].value);
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
        className={`w-full ${
          compact ? 'min-h-[36px] h-[36px] px-3 py-1 rounded-xl text-xs' : 'min-h-[44px] h-11 px-3.5 py-2 rounded-xl text-sm'
        } flex items-center justify-between gap-2 border transition cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none shadow-2xs ${
          isFiltered
            ? 'bg-indigo-50 hover:bg-indigo-100/80 border-indigo-300 text-indigo-900 font-bold'
            : 'bg-white hover:bg-slate-50 hover:border-slate-300 border-slate-200 text-slate-800 font-semibold'
        } ${
          isOpen ? 'ring-2 ring-indigo-500/25 bg-white border-indigo-600 shadow-xs' : 'focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600'
        } ${buttonClassName}`}
      >
        <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
          {Icon && (
            <Icon
              className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0 ${
                isFiltered ? 'text-indigo-600' : 'text-slate-500'
              }`}
            />
          )}
          <span
            className={`truncate text-left flex-1 ${
              compact ? 'text-xs' : 'text-sm'
            } ${
              isFiltered ? 'text-indigo-950 font-bold' : 'text-slate-900 font-semibold'
            }`}
            title={displayText}
          >
            {displayText}
          </span>
          {showCount && selectedOption?.count !== undefined && (
            <span className={`${compact ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} text-indigo-800 bg-indigo-100 border border-indigo-200 rounded-full shrink-0 font-bold`}>
              {selectedOption.count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
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
              className={`${compact ? 'p-0.5' : 'p-1'} rounded-md hover:bg-indigo-100 text-indigo-600 hover:text-indigo-900 transition cursor-pointer`}
            >
              <X className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
            </span>
          )}
          <ChevronDown
            className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0 transition-transform duration-200 ${
              isOpen
                ? 'rotate-180 text-indigo-600'
                : isFiltered
                ? 'text-indigo-600'
                : 'text-slate-400'
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
          } mt-2 w-full min-w-[320px] sm:min-w-[420px] md:min-w-[480px] max-w-[min(600px,calc(100vw-1.5rem))] bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/15 z-[100] flex flex-col max-h-[360px] overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${dropdownClassName}`}
        >
          {/* Fixed Search Header */}
          <div className="p-3 border-b border-slate-100 bg-slate-50 shrink-0">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={effectiveSearchPlaceholder}
                className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-600 transition shadow-2xs tracking-normal"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    searchInputRef.current?.focus({ preventScroll: true });
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-md transition cursor-pointer"
                  title={isMarathi ? 'शोध साफ करा' : 'Clear search'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sub-header with Results Count & Search State */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-2 font-medium select-none">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
                <span>{isMarathi ? 'उपलब्ध पर्याय' : 'Available options'}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-xs">
                  {filteredOptions.length}
                </span>
              </div>
              {searchTerm && (
                <span className="text-xs text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-bold">
                  {isMarathi ? 'शोध परिणाम' : 'Matches'}
                </span>
              )}
            </div>
          </div>

          {/* Scrollable Options List */}
          <div
            ref={optionsListRef}
            role="listbox"
            tabIndex={-1}
            onMouseMove={() => {
              isKeyboardNavRef.current = false;
            }}
            className="relative flex-1 overflow-y-auto overscroll-contain min-h-0 p-2 space-y-1 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.300)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-8 px-4 text-center select-none">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-slate-800">{isMarathi ? 'कोणताही पर्याय सापडला नाही' : 'No options found'}</p>
                {searchTerm && (
                  <p className="text-xs text-slate-500 mt-1 truncate max-w-[220px] mx-auto font-mono">
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
                    className={`w-full min-h-[42px] px-3.5 py-2.5 text-left flex items-center justify-between text-sm rounded-xl transition cursor-pointer select-none tracking-normal ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-950 font-bold border border-indigo-300 shadow-2xs'
                        : isHighlighted
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : opt.isCustom
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-dashed border-emerald-300 font-bold'
                        : 'text-slate-800 hover:bg-slate-50 font-medium hover:text-slate-950'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2 flex-1">
                      <div className="flex items-start gap-2">
                        {opt.isCustom ? (
                          <span className="inline-flex items-start gap-1.5 text-emerald-900">
                            <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">+</span>
                            <span className="text-sm font-semibold text-slate-900 leading-snug whitespace-normal break-words">{opt.label}</span>
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-slate-900 leading-snug whitespace-normal break-words">{opt.label}</span>
                        )}
                        {opt.count !== undefined && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {opt.count}
                          </span>
                        )}
                      </div>
                      {showSubtext && opt.subtext && (
                        <span className={`text-xs truncate mt-0.5 ${opt.isCustom ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                          {opt.subtext}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2 stroke-[2.5]" />
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
