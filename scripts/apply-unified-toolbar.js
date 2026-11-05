const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/reports/page.jsx', 'utf8');
const lines = code.split('\n');

// Find starting line of OFFICIAL 5 PRAPATRAS
let startLine = -1;
let endLine = -1;

for (let i = 2370; i < lines.length; i++) {
  if (lines[i].includes('OFFICIAL 5 PRAPATRAS DROPDOWN SELECTOR')) {
    startLine = i - 1; // start from comment line
    break;
  }
}

for (let i = startLine; i < lines.length; i++) {
  if (lines[i].includes('FILTER PENDING CONFIRMATION ALERT BANNER')) {
    endLine = i - 1; // before comment line
    break;
  }
}

console.log('startLine:', startLine, 'endLine:', endLine);

if (startLine === -1 || endLine === -1) {
  console.error('Could not locate line indices');
  process.exit(1);
}

const unifiedFilterCard = `        {/* =========================================================
            INTELLIGENT UNIFIED COMMAND TOOLBAR & FILTERS
        ========================================================= */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
          {/* Row 1: Contextual Category or Prapatra Selector (Seamlessly Integrated) */}
          {activeTab === 'categories' && (
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 flex-1 min-w-0">
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 flex-1 min-w-0">
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

// Replace lines from startLine to endLine
lines.splice(startLine, endLine - startLine, unifiedFilterCard);

let newCode = lines.join('\n');

// Also fix the typo bg-slate-50/80/95 in isFilterPending banner
newCode = newCode.replace('bg-slate-50/80/95 border border-indigo-200', 'bg-indigo-50 border border-indigo-200 text-indigo-950');

fs.writeFileSync('frontend/src/app/reports/page.jsx', newCode, 'utf8');
console.log('Unified toolbar and filter bar replaced successfully!');

