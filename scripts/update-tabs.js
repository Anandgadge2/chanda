const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/reports/page.jsx', 'utf8');

const tabsToken = 'TOP SEGMENTED TABS';
const toolbarToken = 'INTELLIGENT UNIFIED COMMAND TOOLBAR & FILTERS';

const tabsIdx = code.indexOf(tabsToken);
const toolbarIdx = code.indexOf(toolbarToken);

if (tabsIdx === -1 || toolbarIdx === -1) {
  console.error('Could not find tokens!', tabsIdx, toolbarIdx);
  process.exit(1);
}

const oldTabsStart = code.lastIndexOf('{/*', tabsIdx);
const oldTabsEnd = code.lastIndexOf('{/*', toolbarIdx);

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

code = code.slice(0, oldTabsStart) + newTabs + code.slice(oldTabsEnd);
fs.writeFileSync('frontend/src/app/reports/page.jsx', code, 'utf8');
console.log('Tabs updated successfully!');
