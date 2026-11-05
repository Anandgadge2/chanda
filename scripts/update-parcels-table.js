const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/parcels/page.jsx', 'utf8');

const cardStart = code.indexOf('{/* Mobile Cards View (Shown on screens < md when mobileViewMode === \'cards\') */}');
const tableEnd = code.indexOf('{/* Pagination Controls */}');

if (cardStart === -1 || tableEnd === -1) {
  console.error('Boundaries not found!');
  process.exit(1);
}

const replacement = `{/* Mobile Cards View (Shown on screens < md when mobileViewMode === 'cards') */}
            {mobileViewMode === 'cards' && (
              <div className="md:hidden p-3 sm:p-4 space-y-3 bg-slate-50/70 divide-y divide-slate-100">
                {sortedParcels.map((parcel, index) => {
                  const tenure = getTenureDetails(parcel.tenureClass);
                  const hasDispute = parcel.hasActiveDispute;
                  const isCopied = copiedUpi === parcel.upi;
                  const areaHa = Number(parcel.totalAreaHa || 0);
                  const areaAcres = (areaHa * 2.47105).toFixed(2);
                  const activeCase = parcel.forwardCases && parcel.forwardCases[0];
                  const ownerName =
                    parcel.currentOwner ||
                    parcel.metadata?.currentOwner ||
                    parcel.metadata?.ownerName ||
                    (parcel.tenureClass === 'SARKAR_SHASAN'
                      ? (isMarathi ? 'महाराष्ट्र शासन' : 'Government of Maharashtra')
                      : (isMarathi ? 'नोंद उपलब्ध नाही' : 'No record available'));

                  return (
                    <div
                      key={\`mob-\${parcel.id}\`}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md p-4 space-y-3 transition active:scale-[0.99]"
                    >
                      {/* Top Row: Gat Badge, Old Survey, Copy UPI */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-950 border border-emerald-300 font-black text-sm">
                            {isMarathi ? 'गट क्र.' : 'Gat'} {parcel.gatNumber}
                          </span>
                          {parcel.hissaNumber && parcel.hissaNumber !== '0' && (
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold">
                              {isMarathi ? 'हि.' : 'H.'} {parcel.hissaNumber}
                            </span>
                          )}
                          {parcel.oldSurveyNo && (
                            <span className="text-xs text-slate-600 font-semibold">
                              ({isMarathi ? 'जुना स.नं.' : 'Old S.'} {parcel.oldSurveyNo})
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyUpi(parcel.upi)}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                          title={isMarathi ? 'UPI कॉपी करा' : 'Copy UPI'}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                          <span className="truncate max-w-[100px]">{parcel.upi?.slice(-10) || 'UPI'}</span>
                        </button>
                      </div>

                      {/* Location: Village & Taluka */}
                      <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-slate-900">{formatVillageName(parcel.villageName, isMarathi)}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-semibold text-slate-600">{formatTalukaName(parcel.taluka, isMarathi)}</span>
                      </div>

                      {/* Owner / Khatedar Card */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-xs text-slate-600 font-bold uppercase tracking-wider block mb-1">
                          {isMarathi ? 'खातेदार / भोगवटदार' : 'Khatedar / Occupant'}
                        </span>
                        <p className="text-sm font-bold text-slate-950 leading-snug line-clamp-2">
                          {ownerName}
                        </p>
                      </div>

                      {/* Metrics: Area & Tenure */}
                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="text-xs text-slate-600 font-semibold block mb-0.5">
                            {isMarathi ? 'एकूण क्षेत्र' : 'Total Area'}
                          </span>
                          <span className="font-black text-slate-950 font-mono text-sm">
                            {areaHa.toFixed(2)} {isMarathi ? 'हे.' : 'Ha'}
                          </span>
                          <span className="text-xs text-slate-600 font-medium ml-1">
                            ({areaAcres} {isMarathi ? 'एकर' : 'Ac'})
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                          <span className="text-xs text-slate-600 font-semibold block mb-0.5">
                            {isMarathi ? 'धारणा प्रकार' : 'Tenure'}
                          </span>
                          <span className={clsx('inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg border mt-0.5 w-fit', tenure.badgeClass)}>
                            {tenure.icon}
                            <span className="truncate max-w-[120px]">{tenure.label}</span>
                          </span>
                        </div>
                      </div>

                      {/* Dispute Status Bar */}
                      {hasDispute ? (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-rose-900 font-bold text-xs">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{isMarathi ? 'शर्तभंग / सक्रिय वाद' : 'Breach / Dispute Flagged'}</span>
                          </div>
                          {activeCase && (
                            <span className="text-xs font-mono text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md font-bold">
                              {activeCase.caseNumber}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold px-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{isMarathi ? 'निर्वैध नोंद (Clear Record)' : 'Clear Record'}</span>
                        </div>
                      )}

                      {/* Quick Action CTAs */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUpi(parcel.upi)}
                          className="flex-1 h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-white shrink-0" />
                          <span>{isMarathi ? '३६०° साखळी पहा' : 'View 360° Trace'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setUploadModalParcelId(parcel.id)}
                          className="h-11 w-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                          title={isMarathi ? 'दस्तऐवज जोडा' : 'Attach Document'}
                          aria-label={isMarathi ? 'दस्तऐवज जोडा' : 'Attach Document'}
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Desktop Table (and mobile when mobileViewMode === 'table') */}
            <div
              className={clsx(
                'w-full overflow-x-auto touch-scroll',
                mobileViewMode === 'cards' ? 'hidden md:block' : 'block'
              )}
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <table className="w-full border-collapse text-sm min-w-[900px]">
              {/* Native Table Head with Balanced Proportions */}
              <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200 select-none">
                <tr>
                  {/* Col 1: # */}
                  <th scope="col" className="py-3 px-2 w-[4%] min-w-[40px] text-center">
                    #
                  </th>

                  {/* Col 2: UPI */}
                  <th
                    scope="col"
                    onClick={() => handleSort('upi')}
                    className="py-3 px-3 w-[16%] text-left cursor-pointer hover:bg-slate-200/70 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>{isMarathi ? 'UPI / भूखंड ओळख' : 'UPI / Parcel ID'}</span>
                      {sortColumn === 'upi' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-indigo-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Col 3: Village & Taluka */}
                  <th
                    scope="col"
                    onClick={() => handleSort('villageName')}
                    className="py-3 px-3 w-[14%] text-left cursor-pointer hover:bg-slate-200/70 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>{isMarathi ? 'तालुका व गाव' : 'Taluka & Village'}</span>
                      {sortColumn === 'villageName' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-indigo-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Col 4: Gat No & Survey No */}
                  <th
                    scope="col"
                    onClick={() => handleSort('gatNumber')}
                    className="py-3 px-3 w-[11%] text-left cursor-pointer hover:bg-slate-200/70 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>{isMarathi ? 'गट व सर्व्हे क्र.' : 'Gat & Survey No.'}</span>
                      {sortColumn === 'gatNumber' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-indigo-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Col 5: Current Owner / Khatedar & Ferfar */}
                  <th
                    scope="col"
                    className="py-3 px-3 w-[22%] text-left"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSort('currentOwner')}
                        className="inline-flex items-center gap-1 hover:text-indigo-600 transition text-left group/owner cursor-pointer"
                        title={isMarathi ? 'खातेदारानुसार क्रमवारी लावा' : 'Sort by Khatedar'}
                      >
                        <span className="font-bold">
                          {isMarathi ? 'खातेदार / भोगवटदार' : 'Khatedar / Occupant'}
                        </span>
                        {sortColumn === 'currentOwner' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover/owner:text-slate-600" />
                        )}
                      </button>
                    </div>
                  </th>

                  {/* Col 6: Total Area & Potkharaba */}
                  <th
                    scope="col"
                    onClick={() => handleSort('totalAreaHa')}
                    className="py-3 px-3 w-[11%] text-left cursor-pointer hover:bg-slate-200/70 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>{isMarathi ? 'एकूण क्षेत्र' : 'Total Area'}</span>
                      {sortColumn === 'totalAreaHa' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-indigo-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Col 7: Tenure Class */}
                  <th
                    scope="col"
                    onClick={() => handleSort('tenureClass')}
                    className="py-3 px-3 w-[12%] text-left cursor-pointer hover:bg-slate-200/70 transition group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span>{isMarathi ? 'धारणा प्रकार' : 'Tenure Type'}</span>
                      {sortColumn === 'tenureClass' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-indigo-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                      )}
                    </div>
                  </th>

                  {/* Col 8: Dispute Status */}
                  <th scope="col" className="py-3 px-2 w-[7%] text-center">
                    {isMarathi ? 'वाद स्थिती' : 'Dispute'}
                  </th>

                  {/* Col 9: Actions (Kruti) */}
                  <th scope="col" className="py-3 px-3 w-[8%] min-w-[95px] text-right">
                    {isMarathi ? 'कृती' : 'Actions'}
                  </th>
                </tr>
              </thead>

              {/* Native Table Body */}
              <tbody className="divide-y divide-slate-100">
                {sortedParcels.map((parcel, index) => {
                  const tenure = getTenureDetails(parcel.tenureClass);
                  const hasDispute = parcel.hasActiveDispute;
                  const isCopied = copiedUpi === parcel.upi;
                  const numericLimit = limit === 'all' ? (totalCount || 1) : (Number(limit) || 25);
                  const rowNumber = limit === 'all' ? index + 1 : (page - 1) * numericLimit + index + 1;
                  const areaHa = Number(parcel.totalAreaHa || 0);
                  const areaAcres = (areaHa * 2.47105).toFixed(2);
                  const potkharabaHa = Number(parcel.potkharabaAreaHa || 0);
                  const activeCase = parcel.forwardCases && parcel.forwardCases[0];
                  const ownerName =
                    parcel.currentOwner ||
                    parcel.metadata?.currentOwner ||
                    parcel.metadata?.ownerName ||
                    (parcel.tenureClass === 'SARKAR_SHASAN'
                      ? (isMarathi ? 'महाराष्ट्र शासन' : 'Government of Maharashtra')
                      : (isMarathi ? 'नोंद उपलब्ध नाही' : 'No record available'));
                  const mutationCount = parcel._count?.backwardHistories || 0;

                  return (
                    <tr
                      key={parcel.id}
                      className={\`transition-colors cursor-pointer \${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                      } hover:bg-indigo-50/50\`}
                      onClick={() => setSelectedUpi(parcel.upi)}
                    >
                      {/* Col 1: Sr No */}
                      <td className="py-3 px-2 text-center align-middle">
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          {rowNumber}
                        </span>
                      </td>

                      {/* Col 2: UPI / भूखंड ओळख */}
                      <td className="py-3 px-3 align-middle">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-mono text-sm font-bold text-slate-900 select-all whitespace-nowrap transition group-hover:text-indigo-600"
                            title={isMarathi ? '३६०° शीर्षक साखळी पाहण्यासाठी क्लिक करा' : 'Click to view 360° title trace'}
                          >
                            {parcel.upi}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => copyToClipboard(parcel.upi, e)}
                            className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition shrink-0 cursor-pointer"
                            title={isCopied ? (isMarathi ? 'UPI कॉपी झाले!' : 'UPI copied!') : (isMarathi ? 'UPI कॉपी करा' : 'Copy UPI')}
                          >
                            {isCopied ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Col 3: Village & Taluka */}
                      <td className="py-3 px-3 align-middle">
                        <div>
                          <div className="font-bold text-slate-900 text-sm truncate" title={formatVillageName(parcel.villageName, isMarathi)}>
                            {formatVillageName(parcel.villageName, isMarathi)}
                          </div>
                          <div className="text-xs text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{formatTalukaName(parcel.taluka, isMarathi)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Col 4: Gat No, Survey No & Hissa */}
                      <td className="py-3 px-3 align-middle">
                        <div>
                          <div className="text-sm flex items-center gap-1.5">
                            <span className="font-black text-emerald-950 bg-emerald-100 border border-emerald-300 rounded-md px-2 py-0.5 text-sm">
                              {isMarathi ? \`गट \${parcel.gatNumber}\` : \`Gat \${parcel.gatNumber}\`}
                            </span>
                            {parcel.hissaNumber && parcel.hissaNumber !== '0' && parcel.hissaNumber !== '०' && (
                              <span className="text-slate-700 font-bold text-xs">
                                {isMarathi ? \`/ हि. \${parcel.hissaNumber}\` : \`/ Hissa \${parcel.hissaNumber}\`}
                              </span>
                            )}
                          </div>
                          {parcel.oldSurveyNo && (
                            <p className="text-xs text-slate-600 mt-1 font-mono font-medium">
                              {isMarathi ? \`जुना स.नं. \${parcel.oldSurveyNo}\` : \`Old S.No. \${parcel.oldSurveyNo}\`}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Col 5: Current Owner / Khatedar */}
                      <td className="py-3 px-3 align-middle">
                        <div>
                          <div
                            className="font-bold text-slate-950 text-sm truncate max-w-[240px]"
                            title={ownerName}
                          >
                            {ownerName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {mutationCount > 0 ? (
                              <span className="inline-flex items-center gap-1 text-xs text-indigo-700 font-bold">
                                <History className="w-3 h-3 shrink-0" />
                                <span>{mutationCount} {isMarathi ? 'फेरफार' : 'Mutations'}</span>
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500 font-medium">
                                {isMarathi ? 'मूळ नोंद' : 'Original Record'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Col 6: Total & Potkharaba Area */}
                      <td className="py-3 px-3 align-middle">
                        <div>
                          <div className="font-mono font-black text-slate-900 text-sm">
                            {areaHa.toFixed(4)} {isMarathi ? 'हे.' : 'Ha'}
                          </div>
                          <div className="text-xs text-slate-600 font-semibold mt-0.5">
                            ~{areaAcres} {isMarathi ? 'एकर' : 'Acres'}{potkharabaHa > 0 ? \` • \${isMarathi ? 'पो.ख.' : 'Potkharaba'} \${potkharabaHa.toFixed(2)}\` : ''}
                          </div>
                        </div>
                      </td>

                      {/* Col 7: Tenure Class */}
                      <td className="py-3 px-3 align-middle">
                        <span
                          className={\`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap \${tenure.badgeClass}\`}
                          title={tenure.hint}
                        >
                          {tenure.icon}
                          <span>{tenure.label}</span>
                        </span>
                      </td>

                      {/* Col 8: Dispute Status */}
                      <td className="py-3 px-2 text-center align-middle">
                        {hasDispute ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs bg-rose-50 text-rose-800 font-bold px-2.5 py-1 rounded-lg border border-rose-300 whitespace-nowrap"
                            title={activeCase ? (isMarathi ? \`सक्रिय केस क्र: \${activeCase.caseNumber}\` : \`Active Case No: \${activeCase.caseNumber}\`) : (isMarathi ? 'शर्तभंग चौकशी प्रलंबित' : 'Breach inquiry pending')}
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{isMarathi ? 'शर्तभंग' : 'Breach'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-300 whitespace-nowrap">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{isMarathi ? 'निर्वेध' : 'Clear'}</span>
                          </span>
                        )}
                      </td>

                      {/* Col 9: Action Buttons */}
                      <td
                        className="py-3 px-3 text-right align-middle"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedUpi(parcel.upi)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition active:scale-95 whitespace-nowrap cursor-pointer shadow-2xs"
                            title={isMarathi ? '१९५० शीर्षक साखळी व संपूर्ण इतिहास पहा' : 'View 1950 title chain and complete history'}
                          >
                            <Eye className="w-3.5 h-3.5 shrink-0" />
                            <span>{isMarathi ? '३६०° साखळी' : '360° Trace'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setUploadModalParcelId(parcel.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition active:scale-95 cursor-pointer"
                            title={isMarathi ? 'दस्तऐवज जोडा' : 'Attach Document'}
                            aria-label={isMarathi ? 'दस्तऐवज जोडा' : 'Attach Document'}
                          >
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>

    `;

code = code.slice(0, cardStart) + replacement + code.slice(tableEnd);
fs.writeFileSync('frontend/src/app/parcels/page.jsx', code, 'utf8');
console.log('Parcels table and cards upgraded successfully!');

