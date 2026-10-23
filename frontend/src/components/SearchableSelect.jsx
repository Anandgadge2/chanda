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
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options to { value, label, subtext, count }
  const normalizedOptions = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          value: opt.value !== undefined ? opt.value : (opt.villageName || opt.name || ''),
          label: opt.label !== undefined ? opt.label : (opt.villageName || opt.name || String(opt.value || '')),
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
    return normalizedOptions.find(opt => String(opt.value) === String(value));
  }, [normalizedOptions, value]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return normalizedOptions;
    const term = searchTerm.toLowerCase().trim();
    return normalizedOptions.filter(opt => {
      const matchLabel = opt.label && opt.label.toLowerCase().includes(term);
      const matchVal = opt.value && String(opt.value).toLowerCase().includes(term);
      const matchSub = opt.subtext && opt.subtext.toLowerCase().includes(term);
      return matchLabel || matchVal || matchSub;
    });
  }, [normalizedOptions, searchTerm]);

  const [dropdownAlign, setDropdownAlign] = useState(align);

  // Auto-detect viewport boundary on open so dropdown never clips off screen
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (align === 'right' || rect.right + 140 > (typeof window !== 'undefined' ? window.innerWidth : 1000)) {
        setDropdownAlign('right');
      } else {
        setDropdownAlign('left');
      }
    }
  }, [isOpen, align]);

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
      // Auto-focus search input
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keydown (Escape to close, Enter to select top item)
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (e.key === 'Enter' && isOpen && filteredOptions.length > 0) {
      e.preventDefault();
      handleSelect(filteredOptions[0].value);
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

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel || placeholder}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-bold text-slate-800 transition focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen ? 'ring-2 ring-blue-500 bg-white border-blue-400' : ''
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          <span className="truncate text-left text-slate-900 font-bold">
            {displayText}
          </span>
          {showCount && selectedOption?.count !== undefined && (
            <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-full shrink-0 font-medium">
              {selectedOption.count}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute ${dropdownAlign === 'right' ? 'right-0' : 'left-0'} mt-1.5 w-full min-w-[220px] max-w-[340px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${dropdownClassName}`}
          style={{ maxHeight: '340px' }}
        >
          {/* Sticky Search Input Box */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/90 sticky top-0 z-10 backdrop-blur-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            {/* Results count hint */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 px-1 pt-1.5">
              <span>{filteredOptions.length} पर्याय उपलब्ध</span>
              {searchTerm && <span className="text-blue-600 font-medium">फिल्टर सक्रिय</span>}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-[240px] py-1 divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="py-6 px-3 text-center text-xs text-slate-400">
                <Search className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                <span>कोणताही पर्याय सापडला नाही</span>
                {searchTerm && (
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    "{searchTerm}"
                  </p>
                )}
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={`${opt.value}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition cursor-pointer hover:bg-blue-50/70 ${
                      isSelected
                        ? 'bg-blue-50 font-black text-blue-900'
                        : 'text-slate-700 font-medium'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{opt.label}</span>
                        {opt.count !== undefined && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold shrink-0 ${
                            isSelected ? 'bg-blue-200 text-blue-900' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {opt.count}
                          </span>
                        )}
                      </div>
                      {opt.subtext && (
                        <span className="text-[10px] text-slate-400 font-normal truncate">
                          {opt.subtext}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
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
