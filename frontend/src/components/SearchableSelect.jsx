'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

/**
 * Modern, accessible, searchable dropdown component for Chandrapur Land Records Portal.
 * Supports Marathi & English real-time filtering, keyboard navigation, and custom icons.
 */
export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'निवडा...',
  searchPlaceholder = 'शोधा (Search)...',
  icon: Icon,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  disabled = false,
  ariaLabel,
  showCount = true,
  align = 'left' // 'left' | 'right'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsListRef = useRef(null);
  const itemRefs = useRef([]);

  // Normalize options to { value, label, subtext, count }
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          value: opt.value !== undefined ? opt.value : (opt.villageName || opt.name || ''),
          label: opt.label !== undefined ? opt.label : (opt.villageName || opt.name || String(opt.value ?? '')),
          subtext: opt.subtext || opt.nameEn || '',
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
    if (value === undefined || value === null) return undefined;
    return normalizedOptions.find((opt) => String(opt.value) === String(value));
  }, [normalizedOptions, value]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return normalizedOptions;
    const term = searchTerm.toLowerCase().trim();
    return normalizedOptions.filter((opt) => {
      const matchLabel = opt.label && String(opt.label).toLowerCase().includes(term);
      const matchVal = opt.value !== undefined && String(opt.value).toLowerCase().includes(term);
      const matchSub = opt.subtext && String(opt.subtext).toLowerCase().includes(term);
      return matchLabel || matchVal || matchSub;
    });
  }, [normalizedOptions, searchTerm]);

  const [dropdownAlign, setDropdownAlign] = useState(align);

  // Auto-detect viewport boundary on open so dropdown never clips off screen
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
      if (align === 'right' || rect.left + 270 > viewportWidth) {
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
      setHighlightedIndex(selIdx >= 0 ? selIdx : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, searchTerm, filteredOptions, value]);

  // Keep highlighted item in view without scrolling the main window or dropdown header
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      const itemEl = itemRefs.current[highlightedIndex];
      const listEl = optionsListRef.current;
      if (itemEl && listEl) {
        const itemTop = itemEl.offsetTop;
        const itemBottom = itemTop + itemEl.offsetHeight;
        const listTop = listEl.scrollTop;
        const listBottom = listTop + listEl.clientHeight;

        if (itemTop < listTop) {
          listEl.scrollTop = itemTop;
        } else if (itemBottom > listBottom) {
          listEl.scrollTop = itemBottom - listEl.clientHeight;
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
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
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
    : (placeholder || 'सर्व (All)');

  const isFiltered = value !== undefined && value !== null && value !== '' && value !== 'all';

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full ${className} ${isOpen ? 'z-50' : ''}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel || placeholder}
        aria-expanded={isOpen}
        className={`w-full h-9 flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs ${
          isFiltered
            ? 'bg-blue-50/80 border-blue-300 text-blue-950 font-bold'
            : 'bg-slate-50/80 hover:bg-white border-slate-200 text-slate-800 font-semibold'
        } ${
          isOpen ? 'ring-2 ring-blue-500/20 bg-white border-blue-500 shadow-xs' : ''
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {Icon && (
            <Icon
              className={`w-3.5 h-3.5 shrink-0 ${
                isFiltered ? 'text-blue-600' : 'text-slate-400'
              }`}
            />
          )}
          <span
            className={`truncate text-left ${
              isFiltered ? 'text-blue-950 font-bold' : 'text-slate-900 font-semibold'
            }`}
          >
            {displayText}
          </span>
          {showCount && selectedOption?.count !== undefined && (
            <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-full shrink-0 font-bold">
              {selectedOption.count}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            isOpen
              ? 'rotate-180 text-blue-600'
              : isFiltered
              ? 'text-blue-600'
              : 'text-slate-400'
          }`}
        />
      </button>

      {/* Floating Dropdown Popover (flex-col, fixed header, scrollable body) */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute ${
            dropdownAlign === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 w-full min-w-[240px] sm:min-w-[270px] max-w-[340px] bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/15 z-50 flex flex-col max-h-[380px] overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${dropdownClassName}`}
        >
          {/* Fixed Search Header - Flex shrink-0 so it stays rigidly at top */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/95 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8.5 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    searchInputRef.current?.focus({ preventScroll: true });
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-md transition cursor-pointer"
                  title="शोध साफ करा"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Results count & status hint */}
            <div className="flex justify-between items-center text-[10.5px] text-slate-400 px-1 pt-2 font-medium select-none">
              <span>{filteredOptions.length} पर्याय उपलब्ध</span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 border border-blue-200/60 px-1.5 py-0.5 rounded-md font-semibold">
                  फिल्टर सक्रिय
                </span>
              )}
            </div>
          </div>

          {/* Options List (Only this element scrolls, with isolated overscroll) */}
          <div
            ref={optionsListRef}
            className="flex-1 overflow-y-auto overscroll-contain min-h-0 p-1.5 space-y-0.5 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.300)_transparent]"
          >
            {filteredOptions.length === 0 ? (
              <div className="py-7 px-3 text-center select-none">
                <div className="w-9 h-9 mx-auto mb-2 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-slate-700">कोणताही पर्याय सापडला नाही</p>
                {searchTerm && (
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px] mx-auto font-mono">
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
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs rounded-xl transition cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200/60 shadow-2xs'
                        : isHighlighted
                        ? 'bg-slate-100/90 text-slate-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{opt.label}</span>
                        {opt.count !== undefined && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                              isSelected
                                ? 'bg-blue-200 text-blue-950'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {opt.count}
                          </span>
                        )}
                      </div>
                      {opt.subtext && (
                        <span className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                          {opt.subtext}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1.5" />
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
