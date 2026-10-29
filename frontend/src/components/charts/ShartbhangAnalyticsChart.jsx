'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ShieldAlert, Scale } from 'lucide-react';
import { VIOLATION_TYPES } from '../../lib/constants';
import { useTranslation } from '../LanguageContext';

const VIOLATION_PALETTE = {
  SHARTBHANG: { barColor: 'bg-rose-600', textColor: 'text-rose-700', badgeColor: 'bg-rose-50 border-rose-200' },
  TRIBAL_LAND_VIOLATION: { barColor: 'bg-red-600', textColor: 'text-red-700', badgeColor: 'bg-red-50 border-red-200' },
  UNAUTHORIZED_NA_CONVERSION: { barColor: 'bg-amber-600', textColor: 'text-amber-700', badgeColor: 'bg-amber-50 border-amber-200' },
  ENCROACHMENT: { barColor: 'bg-orange-600', textColor: 'text-orange-700', badgeColor: 'bg-orange-50 border-orange-200' },
  POKALIST_NONDI: { barColor: 'bg-yellow-600', textColor: 'text-yellow-800', badgeColor: 'bg-yellow-50 border-yellow-200' },
  GOVERNMENT_NAME_MISSING: { barColor: 'bg-slate-600', textColor: 'text-slate-700', badgeColor: 'bg-slate-100 border-slate-200' },
};

