'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  Layers,
  Filter,
  AlertCircle,
  CheckCircle2,
  Building2,
  FileText,
  MapPin,
  LandPlot,
} from 'lucide-react';
import { CHANDRAPUR_TALUKAS, TENURE_CLASSES } from '../../lib/constants';
import { api } from '../../lib/api';

const BOOKLET_TYPES = [
  {
    id: 'ceiling',
    prapatra: 'प्रपत्र - १',
    nameMr: 'सिलिंग कायद्यान्वये वाटप',
    nameEn: 'Ceiling Act Allotment',
    color: 'border-blue-500 text-blue-800 bg-blue-50/50',
    desc: 'मा. महसूल मंत्री महोदय यांचे निर्देशानूसार सिलींग कायद्यानूसार वाटप जमिनींचे बुकलेट',
  },
  {
    id: 'bhudan',
    prapatra: 'प्रपत्र - २',
    nameMr: 'भुदान कायद्यान्वये वाटप',
    nameEn: 'Bhudan Act Allotment',
    color: 'border-amber-500 text-amber-800 bg-amber-50/50',
    desc: 'मा. महसूल मंत्री महोदय यांचे निर्देशानूसार भुदान कायद्यानूसार वाटप जमिनींचे बुकलेट',
  },
  {
    id: 'tribal',
    prapatra: 'प्रपत्र - ३',
    nameMr: 'आदिवासी जमीन संरक्षण',
    nameEn: 'Tribal Land Protection',
    color: 'border-emerald-500 text-emerald-800 bg-emerald-50/50',
    desc: 'मा. महसूल मंत्री महोदय यांचे निर्देशानूसार आदिवासी जमीन बाबत वाटप बुकलेट (कलम ३६/३६अ)',
  },
  {
    id: 'tenancy89a',
    prapatra: 'प्रपत्र - ४',
    nameMr: 'कुळवहिवाट कलम ८९-अ मॅपिंग',
    nameEn: 'Tenancy Sec 89-A Industrial Mapping',
    color: 'border-purple-500 text-purple-800 bg-purple-50/50',
    desc: 'महाराष्ट्र कुळवहिवाट व शेतजमीन अधिनियम १९५८ चे कलम ८९-अ जमीन मॅपिंग बुकलेट',
  },
];

export default function ReportsPage() {
  const [bookletType, setBookletType] = useState('ceiling');
  const [taluka, setTaluka] = useState('');
  const [village, setVillage] = useState('');
  const [surveyNo, setSurveyNo] = useState('');
  const [gatNo, setGatNo] = useState('');
  const [tenure, setTenure] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [summary, setSummary] = useState({ totalCount: 0, totalAreaHa: '0.0000', breachesCount: 0 });
  const [errorMessage, setErrorMessage] = useState('');

  const fetchPreview = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await api.getBookletPreview({
        type: bookletType,
        taluka,
        village,
        surveyNo,
        gatNo,
        tenure,
      });
      setPreviewData(data.rows || []);
      if (data.summary) {
        setSummary(data.summary);
      } else {
        setSummary({
          totalCount: data.rows ? data.rows.length : 0,
          totalAreaHa: '0.0000',
          breachesCount: 0,
        });
      }
    } catch (err) {
      console.error('Failed to load booklet preview:', err);
      setErrorMessage(err.message || 'बुकलेट डेटा आणण्यात अडचण आली.');
    } finally {
      setLoading(false);
    }
  }, [bookletType, taluka, village, surveyNo, gatNo, tenure]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    setErrorMessage('');
    try {
      await api.downloadBookletExcel({
        type: bookletType,
        taluka,
        village,
        surveyNo,
        gatNo,
        tenure,
      });
    } catch (err) {
      console.error('Download Excel error:', err);
      setErrorMessage(err.message || 'एक्सेल फाईल डाऊनलोड करण्यात त्रुटी आली.');
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    setErrorMessage('');
    try {
      await api.downloadBookletPdf({
        type: bookletType,
        taluka,
        village,
        surveyNo,
        gatNo,
        tenure,
      });
    } catch (err) {
      console.error('Download PDF error:', err);
      setErrorMessage(err.message || 'पीडीएफ फाईल डाऊनलोड करण्यात त्रुटी आली.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleResetFilters = () => {
    setTaluka('');
    setVillage('');
    setSurveyNo('');
    setGatNo('');
    setTenure('');
  };

  const activeBooklet = BOOKLET_TYPES.find((b) => b.id === bookletType) || BOOKLET_TYPES[0];

  // Column header configurations
  const getHeaders = () => {
    const baseCols = ['अ.क्र.', 'सध्या कब्जेदार सदरी असलेले नाव', 'स.नं.', 'क्षेत्र (हे.)', 'धारणा प्रकार'];
    if (bookletType === 'ceiling') {
      return [
        ...baseCols,
        'मूळ खातेदाराचे नाव',
        'जमिनीची सध्यस्थिती',
        'वाटप फे.फा.',
        'शर्तभंग झाला?',
        'अनाधिकृत हस्तांतरण',
        'वापरात बदल',
        'वर्ग-२ चे वर्ग-१',
        'शेरा',
      ];
    }
    if (bookletType === 'bhudan') {
      return [
        ...baseCols,
        'मूळ खातेदाराशी नाते',
        'जमिनीची सध्यस्थिती',
        'वाटप फे.फा.',
        'शर्तभंग झाला?',
        'अनाधिकृत हस्तांतरण',
        'वापरात बदल',
        'वर्ग-२ चे वर्ग-१',
        'शेरा',
      ];
    }
    if (bookletType === 'tribal') {
      return [
        'अ.क्र.',
        'मूळ खातेदार / वारसदार',
        'स.नं.',
        'क्षेत्र (हे.)',
        'धारणा प्रकार',
        'सध्या कब्जेदार सदरी नाव',
        'परवानगीने आला किंवा कसे',
        'आदिवासी ते आदिवासी',
        'आदिवासी ते गैरआदिवासी',
        'अनाधिकृत हस्तांतरण',
        'वापरात बदल',
        'वर्ग-२ चे वर्ग-१',
        'शेरा',
      ];
    }
    if (bookletType === 'tenancy89a') {
      return [
        'अ.क्र.',
        'कंपनीचे नाव (कलम ८९-अ)',
        'स.नं. / गट क्र.',
        'क्षेत्र (हे.)',
        'धारणा प्रकार',
        'खरेदी दिनांक',
        'औद्योगिक प्रयोजन वापर?',
        'जमिनीची सध्यस्थिती',
        'शेरा',
      ];
    }
    return [];
  };

  const headers = getHeaders();

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Sleek, Low-Profile Compact Header */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-900">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                अहवाल व प्रपत्र जनरेशन (Booklet Generation)
              </h1>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                वैधानिक अहवाल
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              सिलिंग (प्रपत्र-१), भुदान (प्रपत्र-२), आदिवासी जमीन (प्रपत्र-३) व कुळवहिवाट कलम ८९-अ (प्रपत्र-४) चे अधिकृत बुकलेट
            </p>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto flex-wrap">
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf || loading}
            className="inline-flex items-center justify-center gap-1.5 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-2xs transition active:scale-95 cursor-pointer"
            title="अधिकृत पीडीएफ बुकलेट डाऊनलोड करा"
          >
            {downloadingPdf ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>PDF बुकलेट</span>
          </button>
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel || loading}
            className="inline-flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-2xs transition active:scale-95 cursor-pointer"
            title="अधिकृत एक्सेल स्प्रेडशीट डाऊनलोड करा"
          >
            {downloadingExcel ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span>Excel बुकलेट</span>
          </button>
        </div>
      </div>

      {/* Error notification if any */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-3 text-rose-800 text-xs font-medium animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Booklet Type Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {BOOKLET_TYPES.map((b) => {
          const isSelected = bookletType === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setBookletType(b.id)}
              className={`text-left p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? `${b.color} border-2 shadow-sm font-semibold scale-[1.01]`
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex justify-between items-center w-full mb-1.5">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-white/80 shadow-xs' : 'bg-slate-100 text-slate-600'}`}>
                  {b.prapatra}
                </span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-current" />}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold leading-snug">{b.nameMr}</h3>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{b.nameEn}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-bold text-slate-800">
              तपशीलवार फिल्टर निकष (Search & Filter Parameters):
            </span>
          </div>
          {(taluka || village || surveyNo || gatNo || tenure) && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold underline cursor-pointer"
            >
              फिल्टर साफ करा (Reset)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">तालुका (Taluka)</label>
            <select
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
            >
              <option value="">सर्व तालुके (All Talukas)</option>
              {CHANDRAPUR_TALUKAS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nameMr} ({t.nameEn})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">गाव (Village Name)</label>
            <input
              type="text"
              placeholder="उदा. माढेळी किंवा Madheli"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
            </input>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">स.नं. (Survey No.)</label>
            <input
              type="text"
              placeholder="उदा. 14 किंवा 14/2"
              value={surveyNo}
              onChange={(e) => setSurveyNo(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">गट क्र. (Gat No.)</label>
            <input
              type="text"
              placeholder="उदा. 19 किंवा 105"
              value={gatNo}
              onChange={(e) => setGatNo(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">धारणा प्रकार (Tenure)</label>
            <select
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
            >
              <option value="">सर्व धारणा प्रकार</option>
              {Object.entries(TENURE_CLASSES).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.labelMr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">एकूण नोंदी</span>
            <span className="text-sm font-black text-slate-800">{previewData.length}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <LandPlot className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">एकूण क्षेत्र</span>
            <span className="text-sm font-black text-slate-800">{summary.totalAreaHa} हे.</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">शर्तभंग संशयित</span>
            <span className="text-sm font-black text-rose-700">{summary.breachesCount}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold block">निवडलेले प्रपत्र</span>
            <span className="text-xs font-black text-purple-900">{activeBooklet.prapatra}</span>
          </div>
        </div>
      </div>

      {/* Live Preview Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              थेट बुकलेट पूर्वावलोकन ({activeBooklet.nameMr}):
            </span>
            <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
              {previewData.length} नोंदी
            </span>
          </div>
          <button
            onClick={fetchPreview}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            title="माहिती रिफ्रेश करा"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] whitespace-nowrap min-w-[1024px]">
            <thead className="bg-slate-100/90 text-slate-900 font-bold border-b border-slate-200">
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="py-3 px-3 text-center border-r border-slate-200 last:border-r-0 text-[11px]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={headers.length} className="py-20 text-center text-slate-500">
                    <div className="w-7 h-7 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <span className="text-xs font-semibold">अधिकृत बुकलेट डेटा तयार होत आहे...</span>
                  </td>
                </tr>
              ) : previewData.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="py-16 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-1">
                      <p className="text-xs font-bold text-slate-700">
                        निवडलेल्या निकषांनुसार ({activeBooklet.prapatra}) मध्ये कोणताही डेटा आढळला नाही.
                      </p>
                      <p className="text-[11px] text-slate-400">
                        कृपया वर दिलेले तालुका, गाव किंवा गट क्र. चे फिल्टर बदलून पुन्हा प्रयत्न करा.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                previewData.map((row, index) => {
                  const hasBreach =
                    row.breachCondition === 'होय' ||
                    row.unauthorizedTransfer === 'होय' ||
                    row.changeOfUse === 'होय' ||
                    row.tribalToNonTribal === 'होय';

                  return (
                    <tr
                      key={index}
                      className={`hover:bg-blue-50/40 transition duration-150 ${
                        hasBreach ? 'bg-rose-50/20' : index % 2 === 1 ? 'bg-slate-50/40' : ''
                      }`}
                    >
                      {Object.entries(row).map(([key, val], idx) => {
                        const isBreachCell =
                          val === 'होय' &&
                          (key.includes('breach') ||
                            key.includes('unauthorized') ||
                            key.includes('changeOfUse') ||
                            key.includes('tribalToNonTribal'));

                        return (
                          <td
                            key={idx}
                            className={`py-2.5 px-3 border-r border-slate-100 last:border-r-0 text-center font-medium ${
                              isBreachCell
                                ? 'text-rose-700 font-bold bg-rose-50/80'
                                : 'text-slate-700'
                            }`}
                          >
                            {val !== null && val !== undefined && val !== '' ? (
                              isBreachCell ? (
                                <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px]">
                                  {val}
                                </span>
                              ) : (
                                val
                              )
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Official Statutory Verification Footer Notice */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>
            * हे बुकलेट महाराष्ट्र जमीन महसूल संहिता १९६६ आणि संबंधित विशेष अधिनियमांनुसार तयार केलेले शासकीय प्रपत्र आहे.
          </span>
          <span className="font-semibold text-slate-600">
            मुद्रण व तपासणी: तलाठी / मंडळ अधिकारी / तहसीलदार
          </span>
        </div>
      </div>
    </div>
  );
}
