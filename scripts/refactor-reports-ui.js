const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/reports/page.jsx', 'utf8');

// 1. Remove the useless banner from the screenshot
const uselessBannerStart = code.indexOf('{/* Official Government Table Title Header Banner */}');
const uselessBannerEnd = code.indexOf('{/* Horizontal Scroll Table or Empty State */}');

if (uselessBannerStart !== -1 && uselessBannerEnd !== -1) {
  code = code.slice(0, uselessBannerStart) + code.slice(uselessBannerEnd);
  console.log('1. Useless banner from screenshot removed successfully!');
} else {
  console.error('1. Could not find useless banner boundaries!', uselessBannerStart, uselessBannerEnd);
}

// 2. Modernize the Prapatra 1-5 official title banner (remove border-b-4 border-amber-500 and amber pill)
code = code.replace(
  '<div className="bg-slate-900 text-white p-4 sm:p-5 border-b-4 border-amber-500">',
  '<div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-indigo-500/40">'
);
code = code.replace(
  '<div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">\n                      <Building2 className="w-3.5 h-3.5 text-amber-400" />\n                      <span>{isMarathi ? \'महाराष्ट्र शासन महसूल विभाग\' : \'Govt of Maharashtra Revenue Dept\'}</span>\n                    </div>',
  '<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">\n                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />\n                      <span>{isMarathi ? \'महसूल विभाग — चंद्रपूर जिल्हा\' : \'Revenue Department — Chandrapur District\'}</span>\n                    </div>'
);

// 3. Modernize the Category Detailed Table Header (Line 3935)
const catHeaderStart = code.indexOf('<div className="p-3.5 sm:p-4 bg-gradient-to-r from-indigo-50 via-blue-50/50 to-white border-b border-indigo-200/80 flex flex-col items-center text-center">');
if (catHeaderStart !== -1) {
  const catHeaderEnd = code.indexOf('{!loading && paginatedParcels.length === 0 ? (', catHeaderStart);
  if (catHeaderEnd !== -1) {
    const newCatHeader = `<div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 shadow-2xs font-bold">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        {isMarathi
                          ? \`\${currentCategory.nameMr} — सविस्तर ७/१२ अभिलेख व खातेदार यादी\`
                          : \`\${currentCategory.nameEn} — Detailed 7/12 Land Records\`}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isMarathi ? 'खातेदार यादी व कायदेशीर पडताळणी' : 'Khatedar Registry & Statutory Compliance'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
                      {isMarathi ? \`कार्यक्षेत्र: \${formatScopeText(activeScope, true)}\` : \`Scope: \${formatScopeText(activeScope, false)}\`}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900">
                      {selectedKpiFilter !== 'all' ? \`\${kpiFilteredParcels.length} / \${parcels.length}\` : (serverRollup?.districtTotal?.total712Count ?? parcels.length)} {isMarathi ? 'अभिलेख' : 'Records'}
                    </span>
                  </div>
                </div>

                `;
    code = code.slice(0, catHeaderStart) + newCatHeader + code.slice(catHeaderEnd);
    console.log('3. Category Detailed Table Header modernized successfully!');
  }
}

// 4. Upgrade top tabs with modern active state
const tabsStart = code.indexOf('{/* =========================================================\n            TOP SEGMENTED TABS (PURE MARATHI, HORIZONTALLY SCROLLABLE ON MOBILE)\n        ========================================================= */}');
const tabsEnd = code.indexOf('{/* =========================================================\n            OFFICIAL 5 PRAPATRAS DROPDOWN SELECTOR (SEARCHABLE)');

if (tabsStart !== -1 && tabsEnd !== -1) {
  const newTabs = `{/* =========================================================
            TOP SEGMENTED TABS (HIGH CONTRAST, MODERN MINIMALISTIC)
        ========================================================= */}
        <div className="flex items-center overflow-x-auto no-scrollbar bg-slate-100 p-1.5 rounded-2xl gap-1.5 touch-scroll border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('categories');
              setActiveView('categorySummary');
            }}
            className={\`px-4 py-2.5 text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 \${
              activeTab === 'categories'
                ? 'bg-white text-indigo-950 font-bold shadow-xs border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-white/60 border border-transparent'
            }\`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>{isMarathi ? '१ ते १८ विषयनिहाय बुकलेट्स' : '1 to 18 Subject Booklets'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('prapatra5');
              setActiveView('prapatraSummary');
              setDraftSearch('');
              setAppliedFilters(prev => ({ ...prev, search: '' }));
            }}
            className={\`px-4 py-2.5 text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 \${
              activeTab === 'prapatra5'
                ? 'bg-white text-emerald-950 font-bold shadow-xs border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-white/60 border border-transparent'
            }\`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>{isMarathi ? 'शासकीय प्रपत्र क्र. १ ते ५' : 'Official Prapatras 1 to 5'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('checklist');
              setActiveView('timeline');
            }}
            className={\`px-4 py-2.5 text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 \${
              activeTab === 'checklist'
                ? 'bg-white text-blue-950 font-bold shadow-xs border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-white/60 border border-transparent'
            }\`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>{isMarathi ? '१ ते ४६ मुद्द्यांची तपासणी सूची' : '1 to 46 Checkpoint Audit Matrix'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('renumbering');
            }}
            className={\`px-4 py-2.5 text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 \${
              activeTab === 'renumbering'
                ? 'bg-white text-purple-950 font-bold shadow-xs border border-slate-200/90'
                : 'text-slate-600 hover:text-slate-900 font-semibold hover:bg-white/60 border border-transparent'
            }\`}
          >
            <TableProperties className="w-4 h-4 text-purple-600" />
            <span>{isMarathi ? 'रिनंबरिंग पर्चा (नोंदवही)' : 'Renumbering Parcha (Register)'}</span>
          </button>
        </div>

        `;

  code = code.slice(0, tabsStart) + newTabs + code.slice(tabsEnd);
  console.log('4. Top segmented tabs upgraded successfully!');
}

// 5. Intelligent Unified Filter Toolbar (Combine Category/Prapatra Selector and Filter Suite into ONE seamless card)
const filterSuiteStart = code.indexOf('{/* =========================================================\n            OFFICIAL 5 PRAPATRAS DROPDOWN SELECTOR (SEARCHABLE)');
const filterSuiteEnd = code.indexOf('{/* =========================================================\n            FILTER PENDING CONFIRMATION ALERT BANNER');

if (filterSuiteStart !== -1 && filterSuiteEnd !== -1) {
  const unifiedFilterCard = `{/* =========================================================
            INTELLIGENT UNIFIED COMMAND TOOLBAR & FILTERS
        ========================================================= */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
          {/* Row 1: Contextual Category or Prapatra Selector (Shown when applicable) */}
          {activeTab === 'categories' && (
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 min-w-0">
                <label className="text-sm font-bold text-slate-800 shrink-0 flex items-center gap-1.5 whitespace-nowrap">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>{isMarathi ? 'प्रपत्र / विषय पुस्तिका निवडा:' : 'Select Booklet / Subject:'}</span>
                </label>
                <div className="flex-1 min-w-0 w-full max-w-2xl">
                  <SearchableSelect
                    options={categorySelectOptions}
                    value={selectedCatId}
                    onChange={val => setSelectedCatId(Number(val))}
                    placeholder={isMarathi ? 'प्रपत्र निवडा...' : 'Select booklet...'}
                    searchPlaceholder={isMarathi ? 'प्रपत्र क्र. किंवा नाव शोधा...' : 'Search booklet no. or subject...'}
                    icon={Compass}
                    showCount={false}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-0 shrink-0 self-start xl:self-center">
                <span className="text-xs font-bold bg-blue-100 text-blue-950 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap">
                  {isMarathi ? \`प्रपत्र क्र. \${currentCategory.id}\` : \`Booklet \${currentCategory.id}\`}
                </span>
                <span
                  className="text-xs text-slate-600 font-medium max-w-xs md:max-w-md hidden sm:inline truncate"
                  title={isMarathi ? currentCategory.descMr : currentCategory.descEn}
                >
                  {isMarathi ? currentCategory.descMr : currentCategory.descEn}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'prapatra5' && (
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 min-w-0">
                <label className="text-sm font-bold text-slate-800 shrink-0 flex items-center gap-1.5 whitespace-nowrap">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>{isMarathi ? 'शासकीय प्रपत्र निवडा:' : 'Select Official Prapatra:'}</span>
                </label>
                <div className="flex-1 min-w-0 w-full max-w-2xl">
                  <SearchableSelect
                    options={prapatra5SelectOptions}
                    value={selectedPrapatraId}
                    onChange={val => setSelectedPrapatraId(Number(val))}
                    placeholder={isMarathi ? 'प्रपत्र निवडा...' : 'Select Prapatra...'}
                    searchPlaceholder={isMarathi ? 'प्रपत्र क्र. १ ते ५ शोधा...' : 'Search Prapatra 1 to 5...'}
                    icon={FileText}
                    showCount={false}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-0 shrink-0 self-start xl:self-center">
                <span className="text-xs font-bold bg-emerald-100 text-emerald-950 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap">
                  {isMarathi ? \`प्रपत्र क्र. \${selectedPrapatraId}\` : \`Prapatra \${selectedPrapatraId}\`}
                </span>
                <span
                  className="text-xs text-slate-600 font-medium max-w-xs md:max-w-md hidden sm:inline truncate"
                  title={isMarathi ? currentPrapatra5.descMr : currentPrapatra5.descEn}
                >
                  {isMarathi ? currentPrapatra5.descMr : currentPrapatra5.descEn}
                </span>
              </div>
            </div>
          )}

          {/* Row 2: Location & Criteria Filters */}
          <div>
            {/* Mobile Filter Toggle Button (Hidden on Desktop) */}
            <div className="md:hidden mb-2">
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
                  ? ((isGoshwaraView || activeTab === 'prapatra5' || activeTab === 'renumbering')
                      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl'
                      : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.25fr)_auto]')
                  : ((isGoshwaraView || activeTab === 'prapatra5' || activeTab === 'renumbering')
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
              {!isGoshwaraView && activeTab !== 'prapatra5' && activeTab !== 'renumbering' && (
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
              {!isGoshwaraView && activeTab !== 'prapatra5' && activeTab !== 'renumbering' && (
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
              {!isGoshwaraView && activeTab !== 'prapatra5' && activeTab !== 'renumbering' && (
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
                    disabled={loading || (activeTab === 'renumbering' && (!isDraftTalukaSelected || !isDraftVillageSelected))}
                    className={clsx(
                      'h-11 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 shadow-xs cursor-pointer select-none whitespace-nowrap',
                      loading
                        ? 'bg-blue-800 text-white cursor-wait opacity-90 shadow-inner'
                        : (activeTab === 'renumbering' && (!isDraftTalukaSelected || !isDraftVillageSelected))
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                        : isFilterPending
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white ring-2 ring-indigo-400/60 ring-offset-1'
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
        </div>

        `;

  code = code.slice(0, filterSuiteStart) + unifiedFilterCard + code.slice(filterSuiteEnd);
  console.log('5. Intelligent unified command toolbar created successfully!');
} else {
  console.error('5. Could not find filterSuite boundaries!', filterSuiteStart, filterSuiteEnd);
}

fs.writeFileSync('frontend/src/app/reports/page.jsx', code, 'utf8');
console.log('Done refactoring reports UI!');

