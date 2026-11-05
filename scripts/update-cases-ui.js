const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/cases/page.jsx', 'utf8');

const filterStart = code.indexOf('{/* Modern Filter & Search Command Toolbar */}');
const filterEnd = code.indexOf('{/* Enhanced Table Card (Modern Executive Grid) */}');

if (filterStart === -1 || filterEnd === -1) {
  console.error('Cases filter boundaries not found!');
  process.exit(1);
}

const newFilter = `{/* Modern Filter & Search Command Toolbar */}
      <div className="relative z-20 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs space-y-3">
        {/* Live Search Input & Mobile Filter Toggle Button */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyFilters();
                }
              }}
              placeholder={
                isMarathi
                  ? 'केस क्र., गट क्र., गाव किंवा कब्जेदार शोधा...'
                  : 'Search Case No, Gat No, Village or Occupant...'
              }
              className="w-full h-11 pl-10 pr-9 text-sm bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition shadow-2xs"
            />
            {draftSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
                title={isMarathi ? 'शोध साफ करा' : 'Clear search'}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMobileFilters((p) => !p)}
            className={clsx(
              'md:hidden h-11 px-3.5 rounded-xl border text-sm font-bold transition-all flex items-center gap-2 shrink-0 active:scale-95 shadow-2xs cursor-pointer',
              showMobileFilters || activeFiltersCount > 0
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            )}
          >
            <Filter className="w-4 h-4" />
            <span>{isMarathi ? 'फिल्टर्स' : 'Filters'}</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-indigo-700 text-xs font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={clsx('w-4 h-4 transition-transform duration-200', showMobileFilters && 'rotate-180')} />
          </button>
        </div>

        {/* Filter Dropdowns Suite: Collapsible on mobile, clean row/grid on desktop */}
        <div
          className={clsx(
            'gap-2.5 sm:gap-3',
            showMobileFilters
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto_auto] pt-2.5 border-t border-slate-100 md:border-t-0 md:pt-0 items-end'
              : 'hidden md:grid md:grid-cols-[repeat(5,minmax(0,1fr))_auto_auto] items-end'
          )}
        >
          {/* Taluka Dropdown */}
          <div className="space-y-1.5 min-w-0">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>{isMarathi ? 'तालुका निवडा' : 'Select Taluka'}</span>
            </label>
            <SearchableSelect
              options={talukaSelectOptions}
              value={draftTaluka}
              onChange={(val) => handleTalukaChange(val)}
              placeholder={isMarathi ? 'सर्व तालुके' : 'All Talukas'}
              searchPlaceholder={isMarathi ? 'तालुका शोधा...' : 'Search taluka...'}
              showCount={false}
            />
          </div>

          {/* Village Dropdown */}
          <div className="space-y-1.5 min-w-0">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <LandPlot className="w-3.5 h-3.5 text-blue-600" />
              <span>{isMarathi ? 'गाव निवडा' : 'Select Village'}</span>
            </label>
            <SearchableSelect
              options={villageSelectOptions}
              value={draftVillage}
              onChange={(val) => setDraftVillage(val)}
              placeholder={isMarathi ? 'सर्व गावे' : 'All Villages'}
              searchPlaceholder={isMarathi ? 'गाव शोधा...' : 'Search village...'}
              disabled={loadingVillages}
              showCount={false}
            />
          </div>

          {/* Violation Type Dropdown */}
          <div className="space-y-1.5 min-w-0">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{isMarathi ? 'उल्लंघन प्रकार' : 'Violation Type'}</span>
            </label>
            <SearchableSelect
              options={violationSelectOptions}
              value={draftViolationType}
              onChange={(val) => setDraftViolationType(val)}
              placeholder={isMarathi ? 'सर्व उल्लंघन' : 'All Violations'}
              searchPlaceholder={isMarathi ? 'उल्लंघन शोधा...' : 'Search violation...'}
              showCount={false}
            />
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1.5 min-w-0">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isMarathi ? 'सद्यस्थिती' : 'Status'}</span>
            </label>
            <SearchableSelect
              options={statusSelectOptions}
              value={draftStatus}
              onChange={(val) => setDraftStatus(val)}
              placeholder={isMarathi ? 'सर्व स्थिती' : 'All Statuses'}
              searchPlaceholder={isMarathi ? 'स्थिती शोधा...' : 'Search status...'}
              showCount={false}
            />
          </div>

          {/* Shasan Jama Dropdown */}
          <div className="space-y-1.5 min-w-0">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isMarathi ? 'शासन जमा' : 'Govt Repossessed'}</span>
            </label>
            <SearchableSelect
              options={shasanJamaSelectOptions}
              value={draftIsRepossessedToGovt}
              onChange={(val) => setDraftIsRepossessedToGovt(val)}
              placeholder={isMarathi ? 'सर्व जमा स्थिती' : 'All Repossessed'}
              searchPlaceholder={isMarathi ? 'शोधा...' : 'Search...'}
              showCount={false}
            />
          </div>

          {/* Apply Button ("लागू करा" / "Apply") */}
          <button
            type="button"
            onClick={handleApplyFilters}
            disabled={loading}
            className={clsx(
              'h-11 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 shadow-xs cursor-pointer select-none w-full sm:w-auto',
              isFilterPending
                ? 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-400/60 ring-offset-1 shadow-blue-700/20'
                : 'bg-[#242b6b] hover:bg-[#1a2053] text-white'
            )}
            title={isMarathi ? 'निवडलेले फिल्टर्स लागू करा (Enter)' : 'Apply Selected Filters (Enter)'}
          >
            <Filter className="w-4 h-4 shrink-0" />
            <span>{isMarathi ? 'लागू करा' : 'Apply'}</span>
            {isFilterPending && (
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse shrink-0" />
            )}
          </button>

          {/* Reset Filters Button ("रीसेट" / "Reset") */}
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={loading}
            className="h-11 px-4 text-slate-800 hover:text-rose-700 bg-slate-100 hover:bg-rose-50 rounded-xl border border-slate-300 hover:border-rose-300 transition-all active:scale-95 shrink-0 cursor-pointer flex items-center justify-center gap-2 text-sm font-bold w-full sm:w-auto shadow-2xs"
            title={isMarathi ? 'सर्व फिल्टर्स रीसेट करा' : 'Reset all filters'}
            aria-label={isMarathi ? 'सर्व फिल्टर्स रीसेट करा' : 'Reset all filters'}
          >
            <RotateCcw className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{isMarathi ? 'रीसेट' : 'Reset'}</span>
          </button>
        </div>
      </div>
      `;

code = code.slice(0, filterStart) + newFilter + code.slice(filterEnd);
fs.writeFileSync('frontend/src/app/cases/page.jsx', code, 'utf8');
console.log('Cases filter updated successfully!');

