'use client';

import { useState, useEffect } from 'react';
import {
  HardDrive,
  RefreshCw,
  DownloadCloud,
  UploadCloud,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FolderTree,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRightLeft,
  Columns,
  Table,
  Layers
} from 'lucide-react';
import { api } from '../lib/api';
import { useTranslation } from './LanguageContext';

export default function GoogleDriveSyncPanel() {
  const { isMarathi } = useTranslation();

  // Status & Scan state
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [driveStatus, setDriveStatus] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [driveData, setDriveData] = useState(null);

  // Selection state
  const [selectedTaluka, setSelectedTaluka] = useState('');
  const [selectedCircle, setSelectedCircle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Operations state
  const [activeSubTab, setActiveSubTab] = useState('pull'); // 'pull' | 'push' | 'add-column' | 'add-row'
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Form states
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnDefault, setNewColumnDefault] = useState('');
  const [newRowData, setNewRowData] = useState({
    gatNumber: '',
    oldSurveyNo: '',
    totalAreaHa: '',
    tenureClass: 'BHOGVATDAR_CLASS_1',
    ownerName: '',
    remarks: ''
  });

  // Check Drive status on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setLoadingStatus(true);
    setActionError(null);
    try {
      const res = await api.getDriveStatus();
      if (res.success) {
        setDriveStatus(res.data);
      }
    } catch (err) {
      setActionError(err.message || 'गुगल ड्राइव्ह जोडणी तपासण्यात अयशस्वी.');
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleScanDrive = async () => {
    setScanning(true);
    setActionError(null);
    setActionResult(null);
    try {
      const res = await api.scanDriveHierarchy();
      if (res.success && res.data) {
        setDriveData(res.data);
        if (res.data.talukas && res.data.talukas.length > 0) {
          const firstTaluka = res.data.talukas[0];
          setSelectedTaluka(firstTaluka.name);
          updateSelectedFile(firstTaluka, '');
        }
      }
    } catch (err) {
      setActionError(err.message || 'गुगल ड्राइव्ह स्कॅन अयशस्वी झाले.');
    } finally {
      setScanning(false);
    }
  };

  const updateSelectedFile = (talukaObj, circleName) => {
    if (!talukaObj) return;
    let availableFiles = [];
    if (circleName) {
      const circle = (talukaObj.circles || []).find(c => c.name === circleName);
      availableFiles = circle ? circle.files : [];
    } else {
      availableFiles = talukaObj.files || [];
      if (availableFiles.length === 0 && (talukaObj.circles || []).length > 0) {
        availableFiles = talukaObj.circles[0].files || [];
      }
    }
    setSelectedFile(availableFiles[0] || null);
  };

  const handleTalukaChange = (tName) => {
    setSelectedTaluka(tName);
    setSelectedCircle('');
    setActionResult(null);
    if (!driveData) return;
    const tObj = driveData.talukas.find(t => t.name === tName);
    updateSelectedFile(tObj, '');
  };

  const handleCircleChange = (cName) => {
    setSelectedCircle(cName);
    setActionResult(null);
    if (!driveData) return;
    const tObj = driveData.talukas.find(t => t.name === selectedTaluka);
    updateSelectedFile(tObj, cName);
  };

  // 1. On-Demand Pull
  const handlePullFromDrive = async () => {
    if (!selectedFile) return;
    setActionLoading(true);
    setActionError(null);
    setActionResult(null);
    try {
      const res = await api.pullVillageFromDrive({
        fileId: selectedFile.fileId,
        mimeType: selectedFile.mimeType,
        taluka: selectedFile.taluka,
        villageName: selectedFile.villageName,
        circle: selectedCircle || selectedFile.circle
      });
      setActionResult({
        type: 'pull',
        message: res.message,
        details: res.data
      });
    } catch (err) {
      setActionError(err.message || 'डेटा सिंक अयशस्वी.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. On-Demand Push
  const handlePushToDrive = async () => {
    if (!selectedFile) return;
    setActionLoading(true);
    setActionError(null);
    setActionResult(null);
    try {
      const res = await api.pushVillageToDrive({
        fileId: selectedFile.fileId,
        mimeType: selectedFile.mimeType,
        taluka: selectedFile.taluka,
        villageName: selectedFile.villageName
      });
      setActionResult({
        type: 'push',
        message: res.message,
        details: res.data
      });
    } catch (err) {
      setActionError(err.message || 'ड्राईव्हवर बदल पाठवणे अयशस्वी.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Add Custom Column
  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!selectedFile || !newColumnName.trim()) return;
    setActionLoading(true);
    setActionError(null);
    setActionResult(null);
    try {
      const res = await api.addDriveColumn({
        fileId: selectedFile.fileId,
        mimeType: selectedFile.mimeType,
        columnName: newColumnName.trim(),
        defaultValue: newColumnDefault.trim()
      });
      setActionResult({
        type: 'add-column',
        message: res.message,
        details: res.data
      });
      setNewColumnName('');
      setNewColumnDefault('');
    } catch (err) {
      setActionError(err.message || 'कॉलम जोडणे अयशस्वी.');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Add Custom Row
  const handleAddRow = async (e) => {
    e.preventDefault();
    if (!selectedFile || !newRowData.gatNumber.trim()) return;
    setActionLoading(true);
    setActionError(null);
    setActionResult(null);
    try {
      const res = await api.addDriveRow({
        fileId: selectedFile.fileId,
        mimeType: selectedFile.mimeType,
        taluka: selectedFile.taluka,
        villageName: selectedFile.villageName,
        rowData: newRowData
      });
      setActionResult({
        type: 'add-row',
        message: res.message,
        details: res.data
      });
      setNewRowData({
        gatNumber: '',
        oldSurveyNo: '',
        totalAreaHa: '',
        tenureClass: 'BHOGVATDAR_CLASS_1',
        ownerName: '',
        remarks: ''
      });
    } catch (err) {
      setActionError(err.message || 'नवीन रो जोडणे अयशस्वी.');
    } finally {
      setActionLoading(false);
    }
  };

  const currentTalukaObj = driveData?.talukas?.find(t => t.name === selectedTaluka);
  const currentCircleFiles = selectedCircle
    ? (currentTalukaObj?.circles?.find(c => c.name === selectedCircle)?.files || [])
    : (currentTalukaObj?.files || []);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Status */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-indigo-800/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-800/80 text-amber-300">
                <HardDrive className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                {isMarathi ? 'गुगल ड्राइव्ह थेट ऑन-डिमांड सिंक' : 'Google Drive Direct On-Demand Sync'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed max-w-2xl">
              {isMarathi
                ? 'जिल्हा महसूल गुगल ड्राइव्ह फोल्डरमधील तालुका व मंडळ निहाय एक्सेल शीट्स थेट पोर्टलशी जोडल्या आहेत. कोणतेही पार्श्वभूमी किंवा स्वयंचलित शेड्युल नाही — पूर्ण नियंत्रण तुमच्या हातात आहे.'
                : 'Connect directly with District Taluka & Circle Excel sheets. 100% on-demand sync with zero scheduled background tasks — complete control in your hands.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Clock className="w-3.5 h-3.5" />
              {isMarathi ? 'केवळ ऑन-डिमांड (No Auto Sync)' : 'On-Demand Only (No Auto)'}
            </span>

            {driveStatus?.connected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isMarathi ? 'ड्राईव्ह जोडलेले' : 'Drive Connected'}
              </span>
            ) : (
              <button
                onClick={checkConnection}
                disabled={loadingStatus}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
                {isMarathi ? 'जोडणी तपासा' : 'Check Connection'}
              </button>
            )}
          </div>
        </div>

        {/* Credentials Meta */}
        <div className="mt-4 pt-4 border-t border-indigo-800/50 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-300">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 font-semibold">{isMarathi ? 'रूट फोल्डर ID:' : 'Root Folder ID:'}</span>
            <code className="bg-indigo-950/80 px-2 py-0.5 rounded text-amber-300 font-mono text-[11px]">
              13SWYMwF9JOocnV_uKlfoqg7q6oNHRnMu
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 font-semibold">{isMarathi ? 'सर्व्हिस खाते:' : 'Service Account:'}</span>
            <code className="bg-indigo-950/80 px-2 py-0.5 rounded text-indigo-200 font-mono text-[11px]">
              chandrapur-land-records@chandrapur-land-records.iam.gserviceaccount.com
            </code>
          </div>
        </div>
      </div>

      {/* 2. Folder Scanner Trigger */}
      {!driveData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <FolderTree className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {isMarathi ? 'गुगल ड्राइव्ह मधील तालुक्यांची व गावांची यादी तपासा' : 'Scan Drive for Talukas & Village Sheets'}
            </h3>
            <p className="text-xs text-slate-500">
              {isMarathi
                ? 'रूट फोल्डरमधून सर्व १५ तालुके, मंडळे (Circles) आणि गावांच्या एक्सेल फाइल्सची ताज्या यादी आणा.'
                : 'Fetch the real-time list of all 15 Talukas, Circles, and Village Excel files from the Drive folder.'}
            </p>
          </div>
          <button
            onClick={handleScanDrive}
            disabled={scanning}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning
              ? (isMarathi ? 'ड्राईव्ह स्कॅन होत आहे...' : 'Scanning Drive...')
              : (isMarathi ? 'आता ड्राइव्ह स्कॅन करा' : 'Scan Drive Now')}
          </button>
        </div>
      )}

      {/* 3. Hierarchy Selector & Action Workspace */}
      {driveData && (
        <div className="space-y-6">
          {/* Selector Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>{isMarathi ? 'गाव एक्सेल फाईल निवडा' : 'Select Village Excel Sheet'}</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {driveData.totalTalukas} {isMarathi ? 'तालुके' : 'Talukas'} • {driveData.totalFiles} {isMarathi ? 'फाईल्स' : 'Files'}
                </span>
              </div>
              <button
                onClick={handleScanDrive}
                disabled={scanning}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
                {isMarathi ? 'पुन्हा रिफ्रेश करा' : 'Re-scan'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Taluka */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isMarathi ? 'तालुका निवडा' : 'Select Taluka'}
                </label>
                <select
                  value={selectedTaluka}
                  onChange={(e) => handleTalukaChange(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {driveData.talukas.map((t) => (
                    <option key={t.folderId} value={t.name}>
                      {t.name} ({t.files.length + t.circles.reduce((a, c) => a + c.files.length, 0)} {isMarathi ? 'फाईल्स' : 'files'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Circle (if present) */}
              {currentTalukaObj && currentTalukaObj.circles && currentTalukaObj.circles.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isMarathi ? 'मंडळ निवडा (Circle)' : 'Select Circle'}
                  </label>
                  <select
                    value={selectedCircle}
                    onChange={(e) => handleCircleChange(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{isMarathi ? '-- सर्व मंडळे / थेट फाईल्स --' : '-- All Circles / Direct Files --'}</option>
                    {currentTalukaObj.circles.map((c) => (
                      <option key={c.folderId} value={c.name}>
                        {c.name} ({c.files.length} {isMarathi ? 'गावे' : 'villages'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Village File */}
              <div className={currentTalukaObj?.circles?.length ? '' : 'sm:col-span-2'}>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isMarathi ? 'गाव / फाईल निवडा' : 'Select Village / File'}
                </label>
                <select
                  value={selectedFile?.fileId || ''}
                  onChange={(e) => {
                    const f = driveData.flatFiles.find(item => item.fileId === e.target.value);
                    setSelectedFile(f || null);
                    setActionResult(null);
                  }}
                  className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {currentCircleFiles.map((f) => (
                    <option key={f.fileId} value={f.fileId}>
                      {f.fileName} {f.size ? `(${(f.size / 1024).toFixed(0)} KB)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected File Card Details */}
            {selectedFile && (
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-950">{selectedFile.villageName}</span>
                  <span className="text-indigo-600 font-mono">({selectedFile.taluka}{selectedFile.circle ? ` • ${selectedFile.circle}` : ''})</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <span>ID: <code className="text-slate-700 font-mono text-[11px]">{selectedFile.fileId.slice(0, 12)}...</code></span>
                  {selectedFile.modifiedTime && (
                    <span>{isMarathi ? 'सुधारित:' : 'Modified:'} {new Date(selectedFile.modifiedTime).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. Action Tabs */}
          {selectedFile && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
                <button
                  onClick={() => { setActiveSubTab('pull'); setActionResult(null); }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    activeSubTab === 'pull'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>{isMarathi ? '१. ड्राइव्हवरून पोर्टलमध्ये सिंक करा (Pull)' : '1. Pull to Portal'}</span>
                </button>

                <button
                  onClick={() => { setActiveSubTab('push'); setActionResult(null); }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    activeSubTab === 'push'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isMarathi ? '२. बदल ड्राइव्हमध्ये सेव्ह करा (Push)' : '2. Push to Drive'}</span>
                </button>

                <button
                  onClick={() => { setActiveSubTab('add-column'); setActionResult(null); }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    activeSubTab === 'add-column'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Columns className="w-4 h-4" />
                  <span>{isMarathi ? '३. नवीन कॉलम जोडा (Add Column)' : '3. Add Column'}</span>
                </button>

                <button
                  onClick={() => { setActiveSubTab('add-row'); setActionResult(null); }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    activeSubTab === 'add-row'
                      ? 'bg-purple-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span>{isMarathi ? '४. नवीन रो जोडा (Add Row)' : '4. Add Row'}</span>
                </button>
              </div>

              {/* Sub-tab 1: Pull from Drive */}
              {activeSubTab === 'pull' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs sm:text-sm text-indigo-950 space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      {isMarathi ? 'थेट ऑन-डिमांड इनजेशन व रिकॉन्सिलिएशन' : 'On-Demand Ingestion & Reconciliation'}
                    </p>
                    <p className="text-slate-600 text-xs">
                      {isMarathi
                        ? `गुगल ड्राइव्हमधील '${selectedFile.fileName}' फाईल डाऊनलोड करून त्यातील सर्व गट व जमीन नोंदी पोर्टल डेटाबेसमध्ये तात्काळ अपडेट केल्या जातील. पूर्वीचा कोणताही डेटा नष्ट होणार नाही; केवळ बदल तपासले जातील.`
                        : `Downloads '${selectedFile.fileName}' from Google Drive and updates the portal database idempotently without dropping foreign keys.`}
                    </p>
                  </div>

                  <button
                    onClick={handlePullFromDrive}
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <DownloadCloud className={`w-4 h-4 ${actionLoading ? 'animate-bounce' : ''}`} />
                    {actionLoading
                      ? (isMarathi ? 'सिंक होत आहे...' : 'Syncing...')
                      : (isMarathi ? `डेटा पोर्टलमध्ये आणा (${selectedFile.villageName})` : `Pull Data for ${selectedFile.villageName}`)}
                  </button>
                </div>
              )}

              {/* Sub-tab 2: Push to Drive */}
              {activeSubTab === 'push' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs sm:text-sm text-emerald-950 space-y-2">
                    <p className="font-bold flex items-center gap-1.5">
                      <ArrowRightLeft className="w-4 h-4 text-emerald-700" />
                      {isMarathi ? 'पोर्टलवरील बदल ड्राइव्ह एक्सेल शीटमध्ये सेव्ह करा' : 'Write Portal Changes Back to Drive'}
                    </p>
                    <p className="text-slate-600 text-xs">
                      {isMarathi
                        ? `जर तुम्ही पोर्टलवर खातेदाराचे नाव, क्षेत्र, किंवा इतर नोंदी बदलल्या असतील किंवा नवीन गट जोडले असतील, तर ते थेट गुगल ड्राइव्हमधील '${selectedFile.fileName}' फाईलमध्ये रिफ्लेक्ट होतील.`
                        : `Updates existing rows or appends newly added portal parcels back to '${selectedFile.fileName}' on Google Drive.`}
                    </p>
                  </div>

                  <button
                    onClick={handlePushToDrive}
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <UploadCloud className={`w-4 h-4 ${actionLoading ? 'animate-bounce' : ''}`} />
                    {actionLoading
                      ? (isMarathi ? 'ड्राईव्हवर सेव्ह होत आहे...' : 'Pushing to Drive...')
                      : (isMarathi ? `बदल गुगल ड्राइव्हमध्ये सेव्ह करा` : `Save Changes to Drive File`)}
                  </button>
                </div>
              )}

              {/* Sub-tab 3: Add Custom Column */}
              {activeSubTab === 'add-column' && (
                <form onSubmit={handleAddColumn} className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 text-xs sm:text-sm text-amber-950 space-y-1">
                    <p className="font-bold">{isMarathi ? 'गुगल ड्राइव्ह एक्सेल शीटमध्ये नवीन कॉलम जोडा' : 'Add Custom Column to Drive Sheet'}</p>
                    <p className="text-slate-600 text-xs">
                      {isMarathi
                        ? `निवडलेल्या '${selectedFile.fileName}' फाईलच्या हेडरमध्ये नवीन रकाना जोडला जाईल.`
                        : `Appends a new header column to '${selectedFile.fileName}' on Google Drive.`}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isMarathi ? 'स्तंभाचे / कॉलमचे नाव' : 'Column Header Name'} *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isMarathi ? 'उदा. तपासणी शेरा / Verification Remarks' : 'e.g. Audit Status'}
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {isMarathi ? 'डीफॉल्ट व्हॅल्यू (पर्यायी)' : 'Default Value (Optional)'}
                      </label>
                      <input
                        type="text"
                        placeholder={isMarathi ? 'उदा. प्रलंबित / Pending' : 'e.g. Pending'}
                        value={newColumnDefault}
                        onChange={(e) => setNewColumnDefault(e.target.value)}
                        className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading || !newColumnName.trim()}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Columns className="w-4 h-4" />
                    {actionLoading
                      ? (isMarathi ? 'कॉलम जोडला जात आहे...' : 'Adding Column...')
                      : (isMarathi ? 'ड्राईव्ह शीटमध्ये कॉलम जोडा' : 'Add Column to Drive Sheet')}
                  </button>
                </form>
              )}

              {/* Sub-tab 4: Add Custom Row */}
              {activeSubTab === 'add-row' && (
                <form onSubmit={handleAddRow} className="space-y-4">
                  <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 text-xs sm:text-sm text-purple-950 space-y-1">
                    <p className="font-bold">{isMarathi ? 'गुगल ड्राइव्ह एक्सेल शीटमध्ये नवीन नोंद (Row) जोडा' : 'Add New Row to Drive Sheet'}</p>
                    <p className="text-slate-600 text-xs">
                      {isMarathi
                        ? `निवडलेल्या '${selectedFile.fileName}' शीटच्या शेवटी नवीन भूखंड नोंद थेट जोडली जाईल.`
                        : `Appends a new parcel row at the end of '${selectedFile.fileName}' on Google Drive.`}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{isMarathi ? 'गट क्रमांक' : 'Gat Number'} *</label>
                      <input
                        type="text"
                        required
                        placeholder="उदा. 45/1"
                        value={newRowData.gatNumber}
                        onChange={(e) => setNewRowData({ ...newRowData, gatNumber: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{isMarathi ? 'जुना सर्व्हे क्र.' : 'Old Survey No'}</label>
                      <input
                        type="text"
                        placeholder="उदा. 12"
                        value={newRowData.oldSurveyNo}
                        onChange={(e) => setNewRowData({ ...newRowData, oldSurveyNo: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{isMarathi ? 'एकूण क्षेत्र (हेक्टर)' : 'Area (Ha)'}</label>
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="उदा. 1.25"
                        value={newRowData.totalAreaHa}
                        onChange={(e) => setNewRowData({ ...newRowData, totalAreaHa: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{isMarathi ? 'भोगवटादार वर्ग' : 'Tenure Class'}</label>
                      <select
                        value={newRowData.tenureClass}
                        onChange={(e) => setNewRowData({ ...newRowData, tenureClass: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-slate-50"
                      >
                        <option value="BHOGVATDAR_CLASS_1">भोगवटादार वर्ग-१ (Class 1)</option>
                        <option value="BHOGVATDAR_CLASS_2">भोगवटादार वर्ग-२ (Class 2)</option>
                        <option value="SARKAR_SHASAN">शासकीय जमीन (Govt Land)</option>
                        <option value="DEVASTHAN_INAM">इनाम / देवस्थान (Inam)</option>
                        <option value="FOREST_JANGAL">वन जमीन (Forest)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">{isMarathi ? 'खातेदाराचे नाव' : 'Owner Name'}</label>
                      <input
                        type="text"
                        placeholder="उदा. रमेश विठ्ठलराव मून"
                        value={newRowData.ownerName}
                        onChange={(e) => setNewRowData({ ...newRowData, ownerName: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-300 p-2.5"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading || !newRowData.gatNumber.trim()}
                    className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-purple-700 hover:bg-purple-800 text-white shadow-sm flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {actionLoading
                      ? (isMarathi ? 'नोंद जोडली जात आहे...' : 'Adding Row...')
                      : (isMarathi ? 'ड्राईव्ह शीटमध्ये नोंद जोडा' : 'Append Row to Drive Sheet')}
                  </button>
                </form>
              )}

              {/* Feedback Alert Messages */}
              {actionError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{isMarathi ? 'त्रुटी आढळली' : 'Error'}</p>
                    <p className="text-xs">{actionError}</p>
                  </div>
                </div>
              )}

              {actionResult && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{actionResult.message}</span>
                  </div>

                  {actionResult.details?.syncResult?.diffResult?.stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 text-xs">
                      <div className="bg-white/80 p-2 rounded-lg">
                        <span className="text-slate-500 block text-[10px]">{isMarathi ? 'शीटमधील एकूण' : 'Total in Sheet'}</span>
                        <span className="font-bold text-slate-800">{actionResult.details.syncResult.diffResult.stats.totalInSheet}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg">
                        <span className="text-slate-500 block text-[10px]">{isMarathi ? 'बदललेले' : 'Modified'}</span>
                        <span className="font-bold text-amber-700">{actionResult.details.syncResult.diffResult.stats.modifiedCount}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg">
                        <span className="text-slate-500 block text-[10px]">{isMarathi ? 'नवीन जोडलेले' : 'Net-New Added'}</span>
                        <span className="font-bold text-emerald-700">{actionResult.details.syncResult.diffResult.stats.netNewCount}</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg">
                        <span className="text-slate-500 block text-[10px]">{isMarathi ? 'अपरिवर्तित' : 'Unchanged'}</span>
                        <span className="font-bold text-slate-700">{actionResult.details.syncResult.diffResult.stats.unchangedCount}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
