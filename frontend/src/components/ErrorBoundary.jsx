'use client';

import React from 'react';
import Link from 'next/link';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  returnHome = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-white rounded-2xl sm:rounded-3xl border border-rose-200 shadow-xl p-6 sm:p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto mb-4">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
              प्रणालीमध्ये तांत्रिक त्रुटी उद्भवली आहे
            </h2>
            <p className="text-xs font-semibold text-slate-500 mb-3">
              An unexpected system error occurred while processing your request
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs font-mono text-slate-700 max-h-28 overflow-y-auto mb-3 break-words">
              {this.state.error?.message || 'अज्ञात त्रुटी (Unknown runtime exception)'}
            </div>

            {this.state.error?.message?.includes('insertBefore') ||
            this.state.error?.message?.includes('not a child of this node') ? (
              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-4 text-left leading-relaxed">
                💡 <strong>टीप:</strong> ब्राउझर ऑटो-ट्रान्सलेटर (Google Translate) किंवा भाषा विस्तारकांमुळे ही त्रुटी उद्भवते. आम्ही प्रणाली सुरक्षित केली आहे; कृपया खालील बटणावर क्लिक करून पृष्ठ रिफ्रेश करा.
              </p>
            ) : null}

            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>पुन्हा प्रयत्न करा</span>
              </button>

              <button
                type="button"
                onClick={this.returnHome}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl transition active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>मुख्य पृष्ठ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
