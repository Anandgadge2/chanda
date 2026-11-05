const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/reports/page.jsx', 'utf8');

// 1. Upgrade Prapatra 1-5 selector and Booklet selector header text
code = code.replace(
  /शासकीय प्रपत्र निवडा:/g,
  'शासकीय प्रपत्र निवडा:'
);

// 2. Upgrade the filter suite in reports/page.jsx
const filterContainerStart = code.indexOf('<div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">');
const bannerToken = 'FILTER PENDING CONFIRMATION ALERT BANNER';
const bannerIdx = code.indexOf(bannerToken);
let filterContainerEnd = -1;
if (bannerIdx !== -1) {
  filterContainerEnd = code.lastIndexOf('{/*', bannerIdx);
}

if (filterContainerStart !== -1 && filterContainerEnd !== -1) {
  const newFilterSuite = `<div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
          {/* Mobile Filter Toggle Button (Hidden on Desktop) */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setShowMobileFilters(p => !p)}
              className={clsx(
                'h-11 px-3.5 rounded-xl border text-sm font-bold transition-all flex items-center gap-2 active:scale-95 shadow-2xs cursor-pointer',
                showMobileFilters || hasActiveFilters
                  ? 'bg-indigo-600 text-white shadow-xs border-indigo-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              )}
            >
              <Filter className="w-4 h-4" />
              <span>{isMarathi ? 'फिल्टर्स' : 'Filters'}</span>
              {hasActiveFilters && (
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              )}
              <ChevronDown className={clsx('w-4 h-4 transition-transform duration-200', showMobileFilters && 'rotate-180')} />
            </button>
          </div>

          <div
            className={clsx(
              'gap-2.5 sm:gap-3 items-end',
              showMobileFilters
                ? ((isGoshwaraView || activeTab === 'prapatra5')
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl pt-1'
                    : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.25fr)_auto] pt-1')
                : ((isGoshwaraView || activeTab === 'prapatra5')
                    ? 'hidden md:grid md:grid-cols-3 max-w-4xl'
                    : 'hidden md:grid md:grid-cols-3 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.25fr)_auto]')
            )}
          >
            {/* 1. Taluka Dropdown */}
            <div className="space-y-1.5 min-w-0">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isMarathi ? 'तालुका निवडा' : 'Select Taluka'}</span>
              </label>
              <SearchableSelect
                options={talukaSelectOptions}
                value={draftTaluka}
                onChange={val => {
                  setDraftTaluka(val || 'all');
                  setDraftVillage('all');
                }}
                clearValue="all"
                placeholder={isMarathi ? 'सर्व तालुके' : 'All Talukas'}
                searchPlaceholder={isMarathi ? 'तालुका शोधा...' : 'Search taluka...'}
                icon={Building2}
                showCount={false}
              />
            </div>

            {/* 2. Village Dropdown */}
            <div className="space-y-1.5 min-w-0">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <LandPlot className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isMarathi ? \`गाव \${uniqueVillageCount > 0 ? \`(\${uniqueVillageCount})\` : ''}\` : \`Village \${uniqueVillageCount > 0 ? \`(\${uniqueVillageCount})\` : ''}\`}</span>
              </label>
              <SearchableSelect
                options={villageSelectOptions}
                value={draftVillage}
                onChange={val => {
                  setDraftVillage(val || 'all');
                }}
                clearValue="all"
                disabled={!isDraftTalukaSelected}
                placeholder={
                  !isDraftTalukaSelected
                    ? (isMarathi ? 'प्रथम तालुका निवडा' : 'Select Taluka first')
                    : (isMarathi ? 'सर्व गावे' : 'All Villages')
                }
                searchPlaceholder={isMarathi ? 'गाव शोधा...' : 'Search village...'}
                icon={LandPlot}
                showCount={true}
              />
            </div>

            {/* 3. Tenure Class Filter */}
            {!isGoshwaraView && activeTab !== 'prapatra5' && (
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isMarathi ? 'धारणा प्रकार' : 'Tenure Type'}</span>
                </label>
                <SearchableSelect
                  options={tenureSelectOptions}
                  value={draftTenure}
                  onChange={val => setDraftTenure(val || 'all')}
                  clearValue="all"
                  placeholder={isMarathi ? 'सर्व धारणा प्रकार' : 'All Tenure Types'}
                  searchPlaceholder={isMarathi ? 'धारणा प्रकार शोधा...' : 'Search tenure...'}
                  icon={Scale}
                  showCount={false}
                />
              </div>
            )}

            {/* 4. Violation / Audit Finding Filter */}
            {!isGoshwaraView && activeTab !== 'prapatra5' && (
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>{isMarathi ? 'तपासणी निष्कर्ष' : 'Audit Finding'}</span>
                </label>
                <SearchableSelect
                  options={violationSelectOptions}
                  value={draftViolation}
                  onChange={val => setDraftViolation(val || 'all')}
                  clearValue="all"
                  placeholder={isMarathi ? 'सर्व तपासणी निष्कर्ष' : 'All Audit Findings'}
                  searchPlaceholder={isMarathi ? 'तपासणी निष्कर्ष शोधा...' : 'Search findings...'}
                  icon={AlertTriangle}
                  showCount={false}
                />
              </div>
            )}

            {/* 5. Search Box */}
            {!isGoshwaraView && activeTab !== 'prapatra5' && (
              <div className="space-y-1.5 min-w-0">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isMarathi ? 'शोध' : 'Search'}</span>
                </label>
                <div className="flex items-center gap-2 bg-slate-50/90 hover:bg-white focus-within:bg-white border border-slate-200 rounded-xl px-3 h-11 focus-within:ring-2 focus-within:ring-indigo-500/25 focus-within:border-indigo-600 transition-all shadow-2xs">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder={isMarathi ? 'गट क्र. / स.नं. / खातेदार...' : 'Gat No. / Survey No. / Khatedar...'}
                    value={draftSearch}
                    onChange={e => setDraftSearch(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyFilters();
                      }
                    }}
                    className="bg-transparent text-sm text-slate-900 outline-none w-full placeholder:text-slate-400 font-medium"
                  />
                  {draftSearch && (
                    <button
                      type="button"
                      onClick={() => setDraftSearch('')}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-md"
                      title={isMarathi ? 'शोध मजकूर साफ करा' : 'Clear search text'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 6. Action Controls: Apply & Reset Buttons */}
            <div className="space-y-1.5 shrink-0">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>{isMarathi ? 'फिल्टर कृती' : 'Action'}</span>
              </label>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className={clsx(
                    'h-11 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 shadow-xs cursor-pointer select-none whitespace-nowrap',
                    loading
                      ? 'bg-blue-800 text-white cursor-wait opacity-90 shadow-inner'
                      : isFilterPending
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white ring-2 ring-blue-500/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  )}
                  title={loading ? (isMarathi ? 'डेटा लागू होत आहे...' : 'Applying filters...') : (isMarathi ? 'फिल्टर्स लागू करा (Enter)' : 'Apply Filters (Enter)')}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-blue-200" />
                      <span className="whitespace-nowrap">{isMarathi ? 'लागू करा' : 'Apply'}</span>
                    </>
                  ) : (
                    <>
                      <Filter className="w-4 h-4 shrink-0" />
                      <span className="whitespace-nowrap">{isMarathi ? 'लागू करा' : 'Apply'}</span>
                      {isFilterPending && (
                        <span className="relative flex h-2 w-2 shrink-0 ml-0.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                      )}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  disabled={loading}
                  className="h-11 px-3.5 bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-700 border border-slate-300 hover:border-rose-300 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-2xs cursor-pointer shrink-0 flex items-center justify-center gap-1.5 whitespace-nowrap"
                  title={isMarathi ? 'सर्व फिल्टर्स रीसेट करा' : 'Reset all filters'}
                >
                  <RotateCcw className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="whitespace-nowrap">{isMarathi ? 'रीसेट' : 'Reset'}</span>
                </button>

                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="h-11 w-11 text-slate-700 hover:text-blue-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all active:scale-95 shadow-2xs cursor-pointer shrink-0 flex items-center justify-center"
                  title={isMarathi ? 'डेटा रिफ्रेश करा' : 'Refresh data'}
                  aria-label={isMarathi ? 'डेटा रिफ्रेश करा' : 'Refresh data'}
                >
                  <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        `;

  code = code.slice(0, filterContainerStart) + newFilterSuite + code.slice(filterContainerEnd);
  console.log('Reports filter suite updated successfully!');
} else {
  console.error('Reports filter boundaries not found! Starts:', filterContainerStart, 'Ends:', filterContainerEnd);
}

fs.writeFileSync('frontend/src/app/reports/page.jsx', code, 'utf8');
