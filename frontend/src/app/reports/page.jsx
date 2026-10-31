'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  Layers,
  Filter,
  CheckCircle2,
  FileText,
  LandPlot,
  TableProperties,
  Search,
  X,
  ShieldCheck,
  Building2,
  Eye,
  SlidersHorizontal,
  Info,
  Scale,
  AlertTriangle,
  Compass,
  History,
  Clock,
  ArrowRight,
  ChevronRight,
  Calendar,
  User,
  MapPin,
  ChevronDown,
  Edit3,
  Check,
  RotateCcw,
  Save
} from 'lucide-react';
import clsx from 'clsx';
import { CHANDRAPUR_TALUKAS } from '../../lib/constants';
import { api } from '../../lib/api';
import EditParcelModal from '../../components/EditParcelModal';
import RenumberingParchaView from '../../components/RenumberingParchaView';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';
import { useTranslation } from '../../components/LanguageContext';
import { cleanVillageName, formatVillageName, formatScopeText, formatTalukaName, formatRemarks } from '../../lib/villageUtils';

// 17 Official Statutory Booklet Categories
const STATUTORY_CATEGORIES = [
  { id: 1, nameMr: 'सरकारी जमीन', nameEn: 'Government Land', descMr: 'गायरान, वन, पहाड, खडक, अतिक्रमण व वाटप तपासणी', descEn: 'Gairan, forest, hill, rocky terrain, encroachment & allotment inspection' },
  { id: 2, nameMr: 'कुळ वहिवाट व शेतजमीन कायदा', nameEn: 'Tenancy & Agricultural Land Act', descMr: 'कुळ घोषित जमिनी, शर्तभंग व वर्ग-२ चे वर्ग-१ अवैध रूपांतरण', descEn: 'Declared tenant lands, breach & illegal conversion from Class-2 to Class-1' },
  { id: 3, nameMr: 'जमिन इनाम व वतन जमिनी', nameEn: 'Inam & Watan Lands', descMr: 'मदद माश/खिदमत माश इनाम वतन जमिनी व शर्तभंग', descEn: 'Madad Mash/Khidmat Mash Inam Watan lands & condition breaches' },
  { id: 4, nameMr: 'म.ज.म.अधि. १९६६ भूमिहीन वाटप', nameEn: 'MLRC 1966 Landless Allotments', descMr: 'भूमिहीन, शेतमजूर, स्वातंत्र्य सैनिक प्रदान जमिनी', descEn: 'Lands granted to landless, farm laborers, freedom fighters' },
  { id: 5, nameMr: 'म.ज.म.अधि. १९६६ संस्था/उद्योग', nameEn: 'MLRC 1966 Institutions / Industries', descMr: 'गृहनिर्माण संस्था, उद्योग, शैक्षणिक संस्था, प्रकल्प प्रदान जमिनी', descEn: 'Housing societies, industries, educational institutes, projects' },
  { id: 6, nameMr: 'महाराष्ट्र शेतजमीन कमाल धारणा १९६१', nameEn: 'Agricultural Land Ceiling Act 1961', descMr: 'सिलिंग कायद्यान्वये वाटप जमिनी व शर्तभंग', descEn: 'Ceiling Act surplus land allotments & condition breaches' },
  { id: 7, nameMr: 'विकास आराखडा व गुरचरण जमिनी', nameEn: 'Development Plan & Gurcharan Lands', descMr: 'महानगरपालिका/प्राधिकरण विकास आराखडा व ग्रामपंचायत गुरचरण', descEn: 'Municipal/Authority DP and Gram Panchayat grazing lands' },
  { id: 8, nameMr: 'जमीन देवस्थान इनाम जमिनी', nameEn: 'Devasthan Inam Lands', descMr: 'देवस्थान इनाम जमिनी व वर्ग रूपांतरण तपासणी', descEn: 'Devasthan Inam trust lands & tenure conversion review' },
  { id: 9, nameMr: 'आदिवासी खातेदारांचे जमिनी', nameEn: 'Tribal Khatedar Lands', descMr: 'कलम ३६/३६अ अन्वये आदिवासी ते आदिवासी/गैर-आदिवासी हस्तांतरण', descEn: 'Sec 36/36A tribal to tribal / non-tribal land transfers' },
  { id: 10, nameMr: 'पुनर्वसन अधिनियम १९९९ कलम १६', nameEn: 'Rehabilitation Act 1999 Sec 16', descMr: 'प्रकल्पग्रस्तांना प्रदान जमिनी व इतर हक्क तपासणी', descEn: 'Project-affected persons allotment review & rights verification' },
  { id: 11, nameMr: 'भाडेपट्ट्याने दिलेली शासकीय जमीन', nameEn: 'Govt Leased Lands', descMr: 'शासकीय भाडेपट्टा जमिनी, कालावधी व शर्तभंग', descEn: 'Government lease lands, tenure duration & breach check' },
  { id: 12, nameMr: 'भूदान व ग्रामदान प्रदान जमिनी', nameEn: 'Bhoodan & Gramdan Lands', descMr: 'भूदान चळवळ अंतर्गत प्रदान व अनधिकृत हस्तांतरण', descEn: 'Bhoodan movement lands & unauthorized alienations' },
  { id: 13, nameMr: 'खाजगी वने संपादन अधिनियम १९७५', nameEn: 'Private Forest Acquisition Act 1975', descMr: 'खाजगी वने संपादन व कमाल जमीन धारणा प्रलंबित चौकशी', descEn: 'Private forest acquisition & pending ceiling inquiries' },
  { id: 14, nameMr: 'भूमीधारी हक्क प्राप्त जमिनी', nameEn: 'Bhumidhari Rights Lands', descMr: 'भूमीधारी हक्क जमिनी व वर्ग-२ रूपांतरण तपासणी', descEn: 'Bhumidhari rights verification & Class-2 conversion check' },
  { id: 15, nameMr: 'कमाल जमीन धारणा सूट जमीन', nameEn: 'Ceiling Exemption Lands', descMr: 'कमाल मर्यादेपेक्षा अधिक जमीन धारणा विशेष सूट', descEn: 'Special exemption holdings exceeding ceiling limits' },
  { id: 16, nameMr: 'वक्फ बोर्डाचे मालकीची जमीन', nameEn: 'Waqf Board Lands', descMr: 'वक्फ बोर्ड मालमत्ता व इतर हक्क तपासणी', descEn: 'Waqf board registered properties & other rights' },
  { id: 17, nameMr: 'भूसंपादन अधिग्रहित / राखीव जमीन', nameEn: 'Land Acquisition Acquired/Reserved', descMr: 'भूसंपादन कायदयांतर्गत अधिग्रहित किंवा राखीव जमिनी', descEn: 'Lands acquired or reserved under Land Acquisition Act' },
  { id: 18, nameMr: 'कुळ कायद्याचे कलम 89 व 89-अ/47 व 47 प्रमाणे धारण केलेली जमीन', nameEn: 'Tenancy Act Sec 89 & 89-A / 47 & 47 Holdings', descMr: 'कंपनीने धारण करताना परवानगी, वापराबाबत व हस्तांतरणाबाबत शर्तभंग, इतर अधिकारात नोंद तपासणी', descEn: 'Company holding permission, use breach, transfer breach & other rights' }
];

// 5 Official Statutory Prapatras (Matching Docs PDF booklets 1 to 5)
const OFFICIAL_5_PRAPATRAS = [
  { id: 1, nameMr: 'प्रपत्र क्र. १: १९५० मूळ ७/१२ तपासणी व दुरुस्ती', nameEn: 'Prapatra 1: 1950 Baseline 7/12 Audit & Rectification', descMr: 'शासकीय जमिनींचे सन १९५० पासूनचे सर्व मूळ ७/१२ अभिलेखांची तपासणी व दुरुस्ती', descEn: 'Inspection and rectification of all 1950 baseline Govt land records' },
  { id: 2, nameMr: 'प्रपत्र क्र. २: पोकळीस्त नोंदी (बु.ग.दे./ता.ग.दे.) वगळणे', nameEn: 'Prapatra 2: Removal of Hollow Remarks (Bu.Ga.De / Ta.Ga.De)', descMr: 'शासकीय जमिनीचे ७/१२ अभिलेखावरील पोकळीस्त नोंदी कमी करण्याबाबत', descEn: 'Deletion of non-statutory hollow entries from Govt 7/12 records' },
  { id: 3, nameMr: 'प्रपत्र क्र. ३: शासकीय विभाग / महामंडळे वाटप व शर्तभंग', nameEn: 'Prapatra 3: Govt Dept / Corporation Allotments & Breaches', descMr: 'शासकीय विभाग/स्थानिक संस्थांना प्रदान जमिनींचे अनधिकृत हस्तांतरण व शासन जमा', descEn: 'Unauthorized transfer and govt repossession of dept-allotted lands' },
  { id: 4, nameMr: 'प्रपत्र क्र. ४: खाजगी संस्था / व्यक्ती वाटप व शर्तभंग', nameEn: 'Prapatra 4: Private Society / Individual Grants & Breaches', descMr: 'शैक्षणिक/सामाजिक संस्था व खाजगी व्यक्तींना प्रदान जमिनींचे अनधिकृत हस्तांतरण व शर्तभंग', descEn: 'Breach of condition and unauthorized transfer by private grantees' },
  { id: 5, nameMr: 'प्रपत्र क्र. ५: गायरान व शासकीय अतिक्रमण व मोजणी', nameEn: 'Prapatra 5: Gairan & Govt Land Encroachments & Demarcation', descMr: 'शासकीय जमिनींची एकूण संख्या, वाटप, शर्तभंग, अतिक्रमण व मोजणी अहवाल', descEn: 'Comprehensive count of Govt lands, allotments, breaches & encroachments' }
];

// Official 46 Checkpoints Column Definitions
const CHECKLIST_46_COLUMNS = [
  // 1 to 9: रिनंबरींग पर्चाप्रमाणे (ऐतिहासिक कालक्रम)
  { num: 1, title: 'i) बंदोबस्त क्र. (१९५०)', titleEn: 'i) Settlement No. (1950)', group: 'renumbering', minW: 'min-w-[110px]' },
  { num: 2, title: 'ii) बंदोबस्त नंबर प्रमाणे भोगवटदाराचे नाव', titleEn: 'ii) Owner Name per Settlement No.', group: 'renumbering', minW: 'min-w-[190px]' },
  { num: 3, title: 'iii) बंदोबस्त नंबर प्रमाणे भूधारणा', titleEn: 'iii) Tenure per Settlement No.', group: 'renumbering', minW: 'min-w-[130px]' },
  { num: 4, title: 'i) एकत्रिकरण नंबर (१९७२)', titleEn: 'i) Consolidation No. (1972)', group: 'renumbering', minW: 'min-w-[110px]' },
  { num: 5, title: 'ii) एकत्रिकरण नंबर प्रमाणे भोगवटदाराचे नाव', titleEn: 'ii) Owner Name per Consolidation No.', group: 'renumbering', minW: 'min-w-[190px]' },
  { num: 6, title: 'iii) एकत्रिकरण नंबरप्रमाणे भूधारणा', titleEn: 'iii) Tenure per Consolidation No.', group: 'renumbering', minW: 'min-w-[130px]' },
  { num: 7, title: 'i) पुर्नमोजणी नंबर (७/१२)', titleEn: 'i) Resurvey No. (7/12)', group: 'renumbering', minW: 'min-w-[110px]' },
  { num: 8, title: 'ii) ७/१२ प्रमाणे भोगवटदाराचे नाव', titleEn: 'ii) Owner Name per 7/12', group: 'renumbering', minW: 'min-w-[190px]' },
  { num: 9, title: 'iii) ७/१२ प्रमाणे भूधारणा', titleEn: 'iii) Tenure per 7/12', group: 'renumbering', minW: 'min-w-[130px]' },

  // 10 to 19: भोगवटदार सरकार / महाराष्ट्र शासन असल्यास
  { num: 10, title: 'सध्यस्थितीतील 7/12 प्रमाणे भोगवटदाराचे नाव', titleEn: 'Current 7/12 Occupant Name', group: 'govt', minW: 'min-w-[190px]' },
  { num: 11, title: 'अधिकार अभिलेखानुसार जमिनीचा दर्जा/प्रकार (गायरान/सरकार पहाड खडक/परमपोक इ.)', titleEn: 'Land classification in ROR (Gairan/Govt hill/rock/parampoke etc.)', group: 'govt', minW: 'min-w-[180px]' },
  { num: 12, title: 'मुढ ७/१२ शी तुलना करता सध्यास्थितीती 7/12 मधील क्षेत्र, एकक,भूधारणा, इतर अधिकार मधील नोंदी किंवा वापराचे प्रयोजन या मध्ये तफावत 7/12 मध्ये आहेत का? असल्यास नमूद करणे.', titleEn: 'Discrepancy compared to original 7/12 in area, tenure, or other rights?', group: 'govt', minW: 'min-w-[210px]' },
  { num: 13, title: 'वन / झुडपी जंगल जमीन आहे का?', titleEn: 'Is land Forest / Scrub Forest?', group: 'govt', minW: 'min-w-[100px]' },
  { num: 14, title: 'सदर जमीन वाटप झाली आहे का? असल्यास क्षेत्र नमूद करावे.', titleEn: 'Is land allotted? If yes, specify area.', group: 'govt', minW: 'min-w-[130px]' },
  { num: 15, title: 'अतिक्रमण आहे का? असल्यास क्षेत्र', titleEn: 'Is there encroachment? If yes, area', group: 'govt', minW: 'min-w-[120px]' },
  { num: 16, title: 'सदर गट/सर्व्हे नंबरचे KML तयार केले आहे काय?', titleEn: 'Is KML prepared for this Gat/Survey?', group: 'govt', minW: 'min-w-[110px]' },
  { num: 17, title: 'भूसंपादन झाले आहे का? असल्यास भूसंपादित क्षेत्र', titleEn: 'Has land acquisition occurred? If yes, acquired area', group: 'govt', minW: 'min-w-[120px]' },
  { num: 18, title: 'अवैधरित्या सरकार किंवा शासन नोंद कमी केली आहे काय?', titleEn: 'Has Govt/Shasan entry been illegally removed?', group: 'govt', minW: 'min-w-[130px]' },
  { num: 19, title: 'शासकीय जमिनीवर पोकळीस्त नोंदी आहेत का ? असल्यास इतर अधिकारामध्ये फेरफारशिवाय काही नोंदी झाल्यात का ? असल्यास नमूद करणे.', titleEn: 'Are hollow entries present without mutation?', group: 'govt', minW: 'min-w-[170px]' },

  // 20 to 46: वैधानिक कायदे व तपासणी रकाने
  { num: 20, title: 'मुंबई कुळ वहिवाट व शेतजमीन (विदर्भ) कायदा अन्वये कुळ घोषित केलेली जमीन आहे काय?', titleEn: 'Is land declared under Tenancy Act (Vidarbha)?', group: 'statutory', minW: 'min-w-[160px]' },
  { num: 21, title: 'सदर जमिन इनाम व वतन जमिनी (देवस्थान जमिनी वगळुन) प्रकारातील आहे काय ? असल्यास कोणता प्रकार (मदद माश इनाम/खिदमत माश इनाम, इतर)', titleEn: 'Is land Inam & Watan (excluding Devasthan)?', group: 'statutory', minW: 'min-w-[170px]' },
  { num: 22, title: 'सदर जमिन म.ज.म.अधि.1966 अंतर्गत विवीध योजनेअंतर्गत प्रदान/अतिक्रमण नियमानुकूल केलेल्या जमिनी (गृहनिर्माण संस्था,औद्योगिक आस्थापना,शैक्षणिक संस्था,विशेष वसाहत,प्रकल्प इ.) प्रकारची जमिन आहे का ? असल्यास संस्थेचे नाव नमुद करावे.', titleEn: 'Is land granted under MLRC 1966 schemes (Housing, Industry, Education etc.)?', group: 'statutory', minW: 'min-w-[220px]' },
  { num: 23, title: 'सदर जमिन महाराष्ट्र शेतजमिन कमाल धारणा अधिनियम 1961 अंतर्गत वाटप केलेल्या जमिनी प्रकारातील आहे काय ? (होय/नाही)', titleEn: 'Is land allotted under Agricultural Land Ceiling Act 1961?', group: 'statutory', minW: 'min-w-[160px]' },
  { num: 24, title: 'सदर जमीन महानगरपालिका, नगर पालिका व विविध प्राधिकरण यांच्या विकास आराखडयात समाविष्ट असलेल्या जमिनी अथवा ग्रामपंचायतकडे गुरचरण अथवा इतर प्रयोजनासाठी वर्ग केलेली आहे का ?', titleEn: 'Is land included in Municipal DP or Gram Panchayat grazing?', group: 'statutory', minW: 'min-w-[180px]' },
  { num: 25, title: 'सदर जमीन देवस्थान इनाम जमीन आहे काय? (होय/नाही)', titleEn: 'Is land Devasthan Inam? (Yes/No)', group: 'statutory', minW: 'min-w-[110px]' },
  { num: 26, title: 'सदर जमीन आदिवासी खातेदारांचे मालकीची आहे काय? (होय/नाही)', titleEn: 'Is land owned by Tribal Khatedar? (Yes/No)', group: 'statutory', minW: 'min-w-[120px]' },
  { num: 27, title: 'सदर जमिन महाराष्ट्र पुर्नवसन अधिनियम 1999 च्या कलम 16 अन्वये प्रदान केलेली आहे काय ? (होय/नाही)', titleEn: 'Is land granted under Rehabilitation Act 1999 Sec 16?', group: 'statutory', minW: 'min-w-[150px]' },
  { num: 28, title: 'सदर जमिन भाडेपट्टयाने दिलेली शासकीय जमिन आहे काय? (होय/नाही)', titleEn: 'Is land Government leased land? (Yes/No)', group: 'statutory', minW: 'min-w-[120px]' },
  { num: 29, title: 'सदर जमिन भुदान व ग्रामदान अंतर्गत दिलेली आहे काय ? (होय/नाही)', titleEn: 'Is land granted under Bhoodan & Gramdan?', group: 'statutory', minW: 'min-w-[120px]' },
  { num: 30, title: 'सदर जमिन महाराष्ट्र खाजगी वने (संपादन) अधिनियम 1975 तसेच महाराष्ट्र शेतजमिन अधिनियम 1961 अन्वये चौकशीसाठी प्रलंबित आहे काय ?', titleEn: 'Is land pending inquiry under Private Forest / Ceiling Act?', group: 'statutory', minW: 'min-w-[170px]' },
  { num: 31, title: 'सदर जमिन भुमीधारी हक्कान्वये प्राप्त झालेली आहे काय ? (होय/नाही)', titleEn: 'Is land acquired under Bhumidhari rights?', group: 'statutory', minW: 'min-w-[120px]' },
  { num: 32, title: 'सदर जमिनीस कमाल मर्यादेपेक्षा अधिक धारण करण्यास सुट दिलेली आहे काय ?', titleEn: 'Is land exempted for holding beyond ceiling limit?', group: 'statutory', minW: 'min-w-[140px]' },
  { num: 33, title: 'सदर जमिन वक्फ बोर्डाचे मालकीची आहे काय? (होय/नाही)', titleEn: 'Is land owned by Waqf Board? (Yes/No)', group: 'statutory', minW: 'min-w-[120px]' },
  { num: 34, title: 'सदर जमिन भुसंपादन कायदयाअंतर्गत अधिग्रहित/राखीव आहे काय ? (होय/नाही)', titleEn: 'Is land acquired/reserved under Land Acquisition Act?', group: 'statutory', minW: 'min-w-[130px]' },
  { num: 35, title: 'सदर जमीन रकाना 10 ते 34 पैकी कोणत्याही रकान्यात होय असल्यास सक्षम प्राधिका-यांच्या परवानगीशिवाय भोग. वर्ग-2 मधुन भोग. वर्ग-1 मध्ये रुपांतरीत झालेली आहे काय ?', titleEn: 'Illegal conversion from Class-2 to Class-1 without sanction?', group: 'statutory', minW: 'min-w-[190px]' },
  { num: 36, title: 'सदर जमीन रकाना 10 ते 34 पैकी कोणत्याही रकान्यात होय असल्यास, मौका चौकशीअंती सदर जमिनीबाबत शर्तभंग झालेला आहे काय ?', titleEn: 'Spot inquiry reveals condition breach?', group: 'statutory', minW: 'min-w-[180px]' },
  { num: 37, title: 'रकाना क्र. 26 चे उत्तर "होय" असल्यास, आदिवासी जमिनीबाबत सक्षम अधिकारी यांचे परवानगीशिवाय आदिवासी ते आदिवासी हस्तांतरण झाले आहे का ?', titleEn: 'Tribal to Tribal transfer without sanction?', group: 'statutory', minW: 'min-w-[180px]' },
  { num: 38, title: 'रकाना क्र. 26 चे उत्तर "होय" असल्यास, आदिवासी जमिनीबाबत सक्षम अधिकारी यांचे परवानगीशिवाय आदिवासी ते गैर आदिवासी हस्तांतरण झाले आहे का ?', titleEn: 'Tribal to Non-Tribal alienation without sanction?', group: 'statutory', minW: 'min-w-[180px]' },
  { num: 39, title: 'जमिनीच्या निर्बंधीत सत्ताप्रकारानुसार नोंद इतर अधिकारामध्ये घेण्यात आली आहे काय? (होय / नाही)', titleEn: 'Restricted tenure noted in other rights? (Yes/No)', group: 'statutory', minW: 'min-w-[140px]' },
  { num: 40, title: 'अधिकार अभिलेखापासून ते आजपावेतोच्या अधिकार अभिलेखानुसार इतर अधिकारातील नोंदी/भुधारणा/भोगवटदार यांच्या नोंदी अवैधरित्या कमी केलेल्या आहेत काय?', titleEn: 'Have other rights/tenure entries been illegally deleted?', group: 'statutory', minW: 'min-w-[180px]' },
  { num: 41, title: 'भोगवटदार कंपनी/बिगर शेतकरी असल्यास परवानगी घेतलेली आहे काय ? (होय/नाही)', titleEn: 'Non-farmer/Company occupant taken prior sanction?', group: 'statutory', minW: 'min-w-[160px]' },
  { num: 42, title: 'सदर जमिन कलम 89 व 89 अ अन्वये ख-याखु-या औद्योगिक प्रयोजनाकरिता कंपनीने धारण केलेली आहे काय ? (होय/नाही)', titleEn: 'Bonafide industrial holding under Sec 89/89A?', group: 'statutory', minW: 'min-w-[160px]' },
  { num: 43, title: 'खरेदी दिनांक', titleEn: 'Purchase Date', group: 'statutory', minW: 'min-w-[100px]' },
  { num: 44, title: 'वापर सुरू केला आहे काय?', titleEn: 'Has utilization commenced?', group: 'statutory', minW: 'min-w-[100px]' },
  { num: 45, title: 'विना परवानगी/हस्तांतरण/वापरात बदल झाला आहे काय ?', titleEn: 'Unauthorized transfer or change of land use?', group: 'statutory', minW: 'min-w-[130px]' },
  { num: 46, title: 'मुद्दा क्र. 10 ते 34 प्रमाणे गाव नमुना 1 क अद्यावत आहे काय ?', titleEn: 'Is Village Form 1-C updated per points 10 to 34?', group: 'statutory', minW: 'min-w-[120px]' }
];

export default function ReportsPage() {
  const { isMarathi } = useTranslation();
  // Main Tab: 'checklist' (Master 46-point checklist) vs 'prapatra5' (5 Official Prapatras) vs 'categories' (17 Statutory Booklets)
  const [activeTab, setActiveTab] = useState('checklist');
  const [selectedCatId, setSelectedCatId] = useState(1);
  const [selectedPrapatraId, setSelectedPrapatraId] = useState(1);
  const [renumberingExportHandlers, setRenumberingExportHandlers] = useState(null);

  // DRAFT FILTERS (Controlled by input selectors in UI)
  const [draftTaluka, setDraftTaluka] = useState('all');
  const [draftVillage, setDraftVillage] = useState('all');
  const [draftTenure, setDraftTenure] = useState('all');
  const [draftViolation, setDraftViolation] = useState('all');
  const [draftSearch, setDraftSearch] = useState('');

  // APPLIED FILTERS (Active query & export parameters)
  const [appliedFilters, setAppliedFilters] = useState({
    taluka: 'all',
    village: 'all',
    tenure: 'all',
    violation: 'all',
    search: '',
  });

  const [villageOptions, setVillageOptions] = useState([]);

  const isDraftTalukaSelected = Boolean(draftTaluka && draftTaluka !== 'all' && draftTaluka !== 'सर्व तालुके');
  const isDraftVillageSelected = Boolean(draftVillage && draftVillage !== 'all' && draftVillage !== 'सर्व गावे');

  // Aliases for seamless backward compatibility across table, cards, and child views
  const taluka = appliedFilters.taluka;
  const village = appliedFilters.village;
  const tenureFilter = appliedFilters.tenure;
  const violationFilter = appliedFilters.violation;
  const search = appliedFilters.search;
  const debouncedSearch = appliedFilters.search;

  // View state:
  // For 'checklist': 'timeline', 'parcels'
  // For 'prapatra5': 'prapatraData'
  // For 'categories': 'categorySummary' (Goshwara Rollup), 'categoryData' (Detailed 7/12 List)
  const [activeView, setActiveView] = useState('timeline');
  // Goshwara is EXCLUSIVELY for 1 to 18 Subject Booklets
  const isGoshwaraView = activeTab === 'categories' && activeView === 'categorySummary';
  const [goshwaraTier, setGoshwaraTier] = useState('all'); // 'all', 'village', 'taluka', 'district'
  const [categoryGoshwaraTier, setCategoryGoshwaraTier] = useState('all'); // 'all', 'village', 'taluka', 'district'
  const [prapatraTier, setPrapatraTier] = useState('all'); // 'all', 'taluka', 'village'
  const [prapatraSearch, setPrapatraSearch] = useState('');
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedKpiFilter, setSelectedKpiFilter] = useState('all'); // 'all', 'area', 'class2', 'violations'
  const [tableHighlight, setTableHighlight] = useState(false);
  const tableSectionRef = useRef(null);

  // Interactive KPI Card click handler with smooth auto-scroll to table section
  const handleKpiCardClick = (kpiKey) => {
    const nextFilter = selectedKpiFilter === kpiKey && kpiKey !== 'all' ? 'all' : kpiKey;
    setSelectedKpiFilter(nextFilter);
    setPage(1);

    // If user is on Goshwara or Renumbering tabs where individual 7/12 records are hidden,
    // automatically switch to Checklist tab so they can see the records properly
    if (activeTab === 'goshwara' || activeTab === 'renumbering') {
      setActiveTab('checklist');
    }

    // Trigger visual pulse/highlight on the table container
    setTableHighlight(true);
    setTimeout(() => setTableHighlight(false), 1400);

    // Smooth scroll down to table section with proper clearance below sticky navbar
    setTimeout(() => {
      if (tableSectionRef.current) {
        const yOffset = -90; // clear sticky navbar with margin
        const y = tableSectionRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 70);
  };

  // Data states
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [serverRollup, setServerRollup] = useState(null);
  const [activeScope, setActiveScope] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Modal inspection for 46 points
  const [inspectedParcel, setInspectedParcel] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open and handle Escape key
  useEffect(() => {
    if (inspectedParcel) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setInspectedParcel(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [inspectedParcel]);

  // Read URL query params on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const qTab = urlParams.get('tab');
      const qPrapatra = urlParams.get('prapatra');
      const qCat = urlParams.get('category') || urlParams.get('cat');
      const qTaluka = urlParams.get('taluka');
      const qVillage = urlParams.get('village');
      const qTenure = urlParams.get('tenure');
      const qViolation = urlParams.get('violation');

      if (qTab) {
        if (qTab === 'goshwara') {
          setActiveTab('categories');
          setActiveView('categorySummary');
        } else {
          setActiveTab(qTab);
        }
      }
      if (qPrapatra) setSelectedPrapatraId(parseInt(qPrapatra, 10) || 1);
      if (qCat) setSelectedCatId(parseInt(qCat, 10) || 1);
      if (qTaluka) {
        setDraftTaluka(qTaluka);
        setAppliedFilters((prev) => ({ ...prev, taluka: qTaluka }));
      }
      if (qVillage) {
        setDraftVillage(qVillage);
        setAppliedFilters((prev) => ({ ...prev, village: qVillage }));
      }
      if (qTenure) {
        setDraftTenure(qTenure);
        setAppliedFilters((prev) => ({ ...prev, tenure: qTenure }));
      }
      if (qViolation) {
        setDraftViolation(qViolation);
        setAppliedFilters((prev) => ({ ...prev, violation: qViolation }));
      }
    }
  }, []);

  // Ghoshwara editable overrides state & persistence
  const [goshwaraEdits, setGoshwaraEdits] = useState({});
  const [editingRowKey, setEditingRowKey] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('chandrapur_goshwara_edits');
      if (saved) {
        setGoshwaraEdits(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load goshwara edits from localStorage', e);
    }
  }, []);

  const handleStartEdit = (rowKey, row) => {
    setEditingRowKey(rowKey);
    setEditFormData({
      totalSurveys: row.totalSurveys,
      totalArea: row.totalArea,
      c1Surveys: row.c1Surveys,
      c1Area: row.c1Area,
      c2Surveys: row.c2Surveys,
      c2Area: row.c2Area,
      convSurveys: row.convSurveys,
      convArea: row.convArea,
      noOtherSurveys: row.noOtherSurveys,
      noOtherArea: row.noOtherArea,
      delSurveys: row.delSurveys,
      delArea: row.delArea,
    });
  };

  const handleSaveEdit = (rowKey) => {
    setGoshwaraEdits((prev) => {
      const next = { ...prev, [rowKey]: editFormData };
      try {
        localStorage.setItem('chandrapur_goshwara_edits', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    setEditingRowKey(null);
    setToastMessage({
      type: 'success',
      text: isMarathi ? 'गोषवारा नोंद यशस्वीरीत्या जतन केली.' : 'Goshwara record saved successfully.'
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCancelEdit = () => {
    setEditingRowKey(null);
    setEditFormData({});
  };

  const handleResetAllEdits = () => {
    setGoshwaraEdits({});
    try {
      localStorage.removeItem('chandrapur_goshwara_edits');
    } catch (e) {}
    setEditingRowKey(null);
    setToastMessage({
      type: 'success',
      text: isMarathi ? 'सर्व बदल पूर्ववत करण्यात आले.' : 'All manual edits reset to calculated values.'
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Dynamically load villages for draft taluka
  useEffect(() => {
    async function loadVillages() {
      try {
        if (!draftTaluka || draftTaluka === 'all' || draftTaluka === 'सर्व तालुके') {
          setVillageOptions([]);
          return;
        }
        const res = await api.getTalukaVillages(draftTaluka);
        setVillageOptions(res.villages || []);
      } catch (err) {
        console.error('Failed to load villages list:', err);
      }
    }
    loadVillages();
  }, [draftTaluka]);

  // Load report data (triggers ONLY when appliedFilters change or tabs change)
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const reportId = activeTab === 'checklist'
        ? 'checklist' 
        : (activeTab === 'prapatra5' ? selectedPrapatraId : selectedCatId);
      const isBooklet = activeTab === 'categories';

      const res = await api.getPrapatraReport(reportId, {
        taluka: appliedFilters.taluka,
        village: appliedFilters.village,
        search: appliedFilters.search,
        tenure: appliedFilters.tenure,
        violation: appliedFilters.violation,
        booklet: isBooklet ? 'true' : 'false'
      });
      setSummaryData(res.data || []);
      setParcels(res.parcels || []);
      setServerRollup(res.rollup || null);
      setActiveScope(res.scope || '');
      setPage(1);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCatId, selectedPrapatraId, appliedFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  // Reset KPI filter on tab or category switch
  useEffect(() => {
    setSelectedKpiFilter('all');
  }, [activeTab, selectedCatId, selectedPrapatraId]);
  // Current category details
  const currentCategory = useMemo(() => {
    return STATUTORY_CATEGORIES.find(c => c.id === selectedCatId) || STATUTORY_CATEGORIES[0];
  }, [selectedCatId]);

  const isTenancyCategory = currentCategory?.id === 18;

  // Current Prapatra 1-5 details
  const currentPrapatra5 = useMemo(() => {
    return OFFICIAL_5_PRAPATRAS.find(p => p.id === selectedPrapatraId) || OFFICIAL_5_PRAPATRAS[0];
  }, [selectedPrapatraId]);

  // Class 2 / Government Land matching predicate
  const isClass2Parcel = useCallback((p) => {
    if (!p) return false;
    const tc = String(p.tenureClass || '').toUpperCase();
    const td = String(p.tenureDisplay || '');
    const pts = p.points || {};
    return Boolean(
      tc === 'BHOGVATDAR_CLASS_2' ||
      tc === 'SARKAR_SHASAN' ||
      td.includes('वर्ग-२') ||
      td.includes('वर्ग २') ||
      td.includes('शासकीय') ||
      td.includes('सरकार') ||
      pts[3]?.includes('वर्ग-२') ||
      pts[6]?.includes('वर्ग-२') ||
      pts[9]?.includes('वर्ग-२') ||
      pts[3]?.includes('शासकीय') ||
      pts[6]?.includes('शासकीय') ||
      pts[9]?.includes('शासकीय') ||
      pts[10]?.includes('सरकार') ||
      pts[10]?.includes('शासन')
    );
  }, []);

  // Condition Breach / Suspicious / Flagged Issues matching predicate
  const isViolationParcel = useCallback((p) => {
    if (!p) return false;
    const sf = String(p.statusFinding || '');
    const pts = p.points || {};
    const or = String(p.otherRights || p.remarks || '');
    return Boolean(
      sf.includes('शर्तभंग') ||
      sf.includes('अवैध') ||
      sf.includes('रूपांतर') ||
      sf.includes('अतिक्रमण') ||
      sf.includes('चौकशी') ||
      sf.includes('वगळण्यास शिल्लक') ||
      sf.includes('संशयित') ||
      pts[18] === 'होय' ||
      pts[19] === 'होय' ||
      pts[35] === 'होय' ||
      pts[36] === 'होय' ||
      pts[37] === 'होय' ||
      pts[38] === 'होय' ||
      pts[40] === 'होय' ||
      pts[45] === 'होय' ||
      or.includes('शर्तभंग') ||
      or.includes('अवैध') ||
      or.includes('रूपांतर') ||
      p.metadata?.flags?.isShartbhang === true ||
      p.metadata?.flags?.isIllegalDeletion === true ||
      p.metadata?.flags?.isEncroached === true
    );
  }, []);

  // Compute aggregate metrics
  const stats = useMemo(() => {
    const hasSearchOrSpecificFilter = Boolean(appliedFilters.search || appliedFilters.tenure !== 'all' || appliedFilters.violation !== 'all');
    if (serverRollup?.districtTotal && !hasSearchOrSpecificFilter) {
      return {
        totalCount: serverRollup.districtTotal.total712Count,
        totalAreaHa: serverRollup.districtTotal.totalArea,
        class2Count: serverRollup.districtTotal.c2Count,
        shartbhangCount: serverRollup.districtTotal.shartCount
      };
    }

    let totalArea = 0;
    let shartbhangCount = 0;
    let class2Count = 0;

    parcels.forEach(p => {
      const area = parseFloat(p.totalAreaHa) || 0;
      totalArea += area;
      if (isClass2Parcel(p)) {
        class2Count++;
      }
      if (isViolationParcel(p)) {
        shartbhangCount++;
      }
    });

    return {
      totalCount: parcels.length,
      totalAreaHa: totalArea.toFixed(2),
      class2Count,
      shartbhangCount
    };
  }, [serverRollup, parcels, appliedFilters, isClass2Parcel, isViolationParcel]);

  // Dynamic rollup computed from filtered parcels for 100% mathematical accuracy across all views
  const dynamicRollup = useMemo(() => {
    if (!parcels || parcels.length === 0) return { byVillage: [], byTaluka: [], districtTotal: null };

    const villageMap = new Map();
    const talukaMap = new Map();
    let distTotal = {
      id: 'district-chandrapur-grand-total',
      district: 'Chandrapur',
      taluka: isMarathi ? 'चंद्रपूर जिल्हा' : 'Chandrapur District',
      villageName: isMarathi ? 'संपूर्ण जिल्हा (१५ तालुके गोषवारा)' : 'Whole District Rollup',
      total712Count: 0,
      totalAreaHa: 0,
      c1Count: 0,
      c1Area: 0,
      c2Count: 0,
      c2Area: 0,
      convCount: 0,
      convArea: 0,
      noOtherCount: 0,
      noOtherArea: 0,
      shartCount: 0,
      shartArea: 0,
      remarks: isMarathi ? 'जिल्हास्तरीय एकत्रित गोषवारा' : 'District Consolidated Rollup'
    };

    parcels.forEach((p) => {
      const vName = cleanVillageName(p.villageName);
      const tName = p.taluka || 'Chandrapur';
      const key = `${tName}__${vName}`;
      const area = parseFloat(p.totalAreaHa) || 0;
      const isC1 = p.tenureClass === 'BHOGVATDAR_CLASS_1';
      const isC2 = p.tenureClass === 'BHOGVATDAR_CLASS_2' || p.tenureDisplay?.includes('वर्ग-२');
      const isConv = p.points?.[35] === 'होय' || p.statusFinding?.includes('रूपांतर');
      const isNoOther = p.points?.[39] === 'ईतर अधिकारात नोंद नाही';
      const isShart = p.points?.[36] === 'होय' || p.statusFinding?.includes('शर्तभंग') || p.statusFinding?.includes('अवैध');

      // 1. Village Entry
      if (!villageMap.has(key)) {
        villageMap.set(key, {
          id: `v-${key}`,
          taluka: tName,
          villageName: vName,
          total712Count: 0,
          totalAreaHa: 0,
          c1Count: 0,
          c1Area: 0,
          c2Count: 0,
          c2Area: 0,
          convCount: 0,
          convArea: 0,
          noOtherCount: 0,
          noOtherArea: 0,
          shartCount: 0,
          shartArea: 0,
          remarks: p.statusFinding || '-'
        });
      }
      const vEntry = villageMap.get(key);
      vEntry.total712Count++;
      vEntry.totalAreaHa += area;
      if (isC1) { vEntry.c1Count++; vEntry.c1Area += area; }
      if (isC2) { vEntry.c2Count++; vEntry.c2Area += area; }
      if (isConv) { vEntry.convCount++; vEntry.convArea += area; }
      if (isNoOther) { vEntry.noOtherCount++; vEntry.noOtherArea += area; }
      if (isShart) { vEntry.shartCount++; vEntry.shartArea += area; }

      // 2. Taluka Entry
      if (!talukaMap.has(tName)) {
        talukaMap.set(tName, {
          id: `t-${tName}`,
          taluka: tName,
          villageName: 'संपूर्ण तालुका (All Villages)',
          total712Count: 0,
          totalAreaHa: 0,
          c1Count: 0,
          c1Area: 0,
          c2Count: 0,
          c2Area: 0,
          convCount: 0,
          convArea: 0,
          noOtherCount: 0,
          noOtherArea: 0,
          shartCount: 0,
          shartArea: 0,
          remarks: isMarathi ? `${formatTalukaName(tName, true)} तालुका एकत्रित` : `${formatTalukaName(tName, false)} Taluka Total`
        });
      }
      const tEntry = talukaMap.get(tName);
      tEntry.total712Count++;
      tEntry.totalAreaHa += area;
      if (isC1) { tEntry.c1Count++; tEntry.c1Area += area; }
      if (isC2) { tEntry.c2Count++; tEntry.c2Area += area; }
      if (isConv) { tEntry.convCount++; tEntry.convArea += area; }
      if (isNoOther) { tEntry.noOtherCount++; tEntry.noOtherArea += area; }
      if (isShart) { tEntry.shartCount++; tEntry.shartArea += area; }

      // 3. District Grand Total
      distTotal.total712Count++;
      distTotal.totalAreaHa += area;
      if (isC1) { distTotal.c1Count++; distTotal.c1Area += area; }
      if (isC2) { distTotal.c2Count++; distTotal.c2Area += area; }
      if (isConv) { distTotal.convCount++; distTotal.convArea += area; }
      if (isNoOther) { distTotal.noOtherCount++; distTotal.noOtherArea += area; }
      if (isShart) { distTotal.shartCount++; distTotal.shartArea += area; }
    });

    const formatRow = (r) => ({
      ...r,
      totalArea: r.totalAreaHa.toFixed(2),
      c1Area: r.c1Area.toFixed(2),
      c2Area: r.c2Area.toFixed(2),
      convArea: r.convArea.toFixed(2),
      noOtherArea: r.noOtherArea.toFixed(2),
      shartArea: r.shartArea.toFixed(2)
    });

    const byVillage = Array.from(villageMap.values()).map(formatRow).sort((a, b) => a.villageName.localeCompare(b.villageName, 'mr'));
    const byTaluka = Array.from(talukaMap.values()).map(formatRow).sort((a, b) => (a.taluka || '').localeCompare(b.taluka || ''));
    return {
      byVillage,
      byTaluka,
      districtTotal: formatRow(distTotal)
    };
  }, [parcels, isMarathi]);

  // Filtered parcels based on interactive KPI card selection
  const kpiFilteredParcels = useMemo(() => {
    if (!parcels || parcels.length === 0) return [];
    if (selectedKpiFilter === 'all') return parcels;

    if (selectedKpiFilter === 'area') {
      // Filter parcels with area > 0 and sort descending by acreage (largest first)
      return [...parcels]
        .filter((p) => (parseFloat(p.totalAreaHa) || 0) > 0)
        .sort((a, b) => (parseFloat(b.totalAreaHa) || 0) - (parseFloat(a.totalAreaHa) || 0));
    }

    if (selectedKpiFilter === 'class2') {
      return parcels.filter(isClass2Parcel);
    }

    if (selectedKpiFilter === 'violations') {
      return parcels.filter(isViolationParcel);
    }

    return parcels;
  }, [parcels, selectedKpiFilter, isClass2Parcel, isViolationParcel]);

  const isAllRows = pageSize === 'all';
  const effectivePageSize = isAllRows ? (kpiFilteredParcels.length || 1) : (Number(pageSize) || 25);
  const totalPages = isAllRows ? 1 : Math.max(1, Math.ceil(kpiFilteredParcels.length / effectivePageSize));

  // Paginated parcel items
  const paginatedParcels = useMemo(() => {
    if (pageSize === 'all') return kpiFilteredParcels;
    const size = Number(pageSize) || 25;
    const start = (page - 1) * size;
    return kpiFilteredParcels.slice(start, start + size);
  }, [kpiFilteredParcels, page, pageSize]);

  // Download URLs
  const currentReportId = activeTab === 'checklist' 
    ? 'checklist' 
    : (activeTab === 'prapatra5' ? selectedPrapatraId : selectedCatId);
  const isBookletMode = activeTab === 'categories';

  const effectiveTenureExport = selectedKpiFilter === 'class2' ? 'BHOGVATDAR_CLASS_2' : tenureFilter;
  const effectiveViolationExport = selectedKpiFilter === 'violations' ? 'shartbhang' : violationFilter;

  const currentExportView = activeTab === 'checklist'
    ? activeView
    : (activeTab === 'categories' ? activeView : (activeTab === 'prapatra5' ? activeView : undefined));

  const excelDownloadUrl = api.getPrapatraExcelUrl(currentReportId, {
    taluka,
    village,
    search: debouncedSearch,
    tenure: effectiveTenureExport,
    violation: effectiveViolationExport,
    booklet: isBookletMode ? 'true' : 'false',
    view: currentExportView
  });
  const pdfDownloadUrl = api.getPrapatraPdfUrl(currentReportId, {
    taluka,
    village,
    search: debouncedSearch,
    tenure: effectiveTenureExport,
    violation: effectiveViolationExport,
    booklet: isBookletMode ? 'true' : 'false',
    view: currentExportView
  });

  // Prapatra Summary Filtered Rows & Aggregates
  const filteredPrapatraSummaryRows = useMemo(() => {
    if (!summaryData || summaryData.length === 0) return [];
    let rows = summaryData;

    if (prapatraTier === 'taluka') {
      rows = rows.filter(r => r.villageName === 'संपूर्ण तालुका (All Villages)');
    } else if (prapatraTier === 'village') {
      rows = rows.filter(r => r.villageName && r.villageName !== 'संपूर्ण तालुका (All Villages)');
    }

    if (prapatraSearch && prapatraSearch.trim()) {
      const q = prapatraSearch.trim().toLowerCase();
      rows = rows.filter(r => 
        (r.villageName && r.villageName.toLowerCase().includes(q)) ||
        (r.taluka && r.taluka.toLowerCase().includes(q))
      );
    }
    return rows;
  }, [summaryData, prapatraTier, prapatraSearch]);

  const prapatraTotals = useMemo(() => {
    const totals = {
      total712Count: 0,
      inspected1950Count: 0,
      govtFound1950Count: 0,
      illegalDeletionsCount: 0,
      rectifiedCount: 0,
      pendingRectifyCount: 0,
      pokalistCount: 0,
      pokalistRemovedCount: 0,
      pokalistPendingCount: 0,
      govtDeptsAllottedCount: 0,
      govtDeptsShartbhang: 0,
      govtDeptsRestoredGovt: 0,
      privateAllottedCount: 0,
      privateShartbhang: 0,
      privateRestoredGovt: 0,
      totalGovtLandCount: 0,
      govtAllottedCount: 0,
      govtShartbhangCount: 0,
      govtEncroachedCount: 0,
      govtMojaniDoneCount: 0
    };

    const baseRows = prapatraTier === 'all'
      ? filteredPrapatraSummaryRows.filter(r => r.villageName !== 'संपूर्ण तालुका (All Villages)')
      : filteredPrapatraSummaryRows;

    const rowsToSum = baseRows.length > 0 ? baseRows : filteredPrapatraSummaryRows;

    rowsToSum.forEach(r => {
      totals.total712Count += (r.total712Count || 0);
      totals.inspected1950Count += (r.inspected1950Count || 0);
      totals.govtFound1950Count += (r.govtFound1950Count || 0);
      totals.illegalDeletionsCount += (r.illegalDeletionsCount || 0);
      totals.rectifiedCount += (r.rectifiedCount || 0);
      totals.pendingRectifyCount += (r.pendingRectifyCount || 0);
      totals.pokalistCount += (r.pokalistCount || 0);
      totals.pokalistRemovedCount += (r.pokalistRemovedCount || 0);
      totals.pokalistPendingCount += (r.pokalistPendingCount || 0);
      totals.govtDeptsAllottedCount += (r.govtDeptsAllottedCount || 0);
      totals.govtDeptsShartbhang += (r.govtDeptsShartbhang || 0);
      totals.govtDeptsRestoredGovt += (r.govtDeptsRestoredGovt || 0);
      totals.privateAllottedCount += (r.privateAllottedCount || 0);
      totals.privateShartbhang += (r.privateShartbhang || 0);
      totals.privateRestoredGovt += (r.privateRestoredGovt || 0);
      totals.totalGovtLandCount += (r.totalGovtLandCount || 0);
      totals.govtAllottedCount += (r.govtAllottedCount || 0);
      totals.govtShartbhangCount += (r.govtShartbhangCount || 0);
      totals.govtEncroachedCount += (r.govtEncroachedCount || 0);
      totals.govtMojaniDoneCount += (r.govtMojaniDoneCount || 0);
    });

    return totals;
  }, [filteredPrapatraSummaryRows, prapatraTier]);

  // Category Subject Rollup Rows (Sheet 2 format) from serverRollup
  const categoryRollupRows = useMemo(() => {
    if (serverRollup) {
      if (taluka && taluka !== 'all') {
        return [
          ...(serverRollup.byTaluka || []),
          ...(serverRollup.byVillage || [])
        ];
      }
      return [
        ...(serverRollup.districtTotal ? [serverRollup.districtTotal] : []),
        ...(serverRollup.byTaluka || []),
        ...(serverRollup.byVillage || [])
      ];
    }
    return summaryData || [];
  }, [serverRollup, summaryData, taluka]);

  // Individual Tier Rows for Category Booklets (Village, Taluka, District) matching Image 2
  const categoryVillageRows = useMemo(() => {
    if (serverRollup?.byVillage && serverRollup.byVillage.length > 0) {
      return serverRollup.byVillage;
    }
    return (summaryData || []).filter(r => 
      r.villageName && 
      !r.villageName.includes('संपूर्ण तालुका') && 
      !r.villageName.includes('संपूर्ण जिल्हा') && 
      !r.villageName.includes('Whole District') && 
      !r.id?.startsWith('t-') && 
      r.id !== 'district-chandrapur-grand-total'
    );
  }, [serverRollup, summaryData]);

  const categoryTalukaRows = useMemo(() => {
    if (serverRollup?.byTaluka && serverRollup.byTaluka.length > 0) {
      return serverRollup.byTaluka;
    }
    return (summaryData || []).filter(r => 
      r.villageName === 'संपूर्ण तालुका (All Villages)' || 
      r.id?.startsWith('t-')
    );
  }, [serverRollup, summaryData]);

  const categoryDistrictRows = useMemo(() => {
    // If a specific village is chosen, district aggregate is not relevant to that single village
    if (village && village !== 'all' && village !== 'सर्व गावे') {
      return [];
    }
    if (serverRollup?.districtTotal) {
      const dt = serverRollup.districtTotal;
      return [{
        ...dt,
        villageName: isMarathi
          ? (taluka !== 'all' ? `चंद्रपूर जिल्हा (केवळ निवडलेला ${formatTalukaName(taluka, true)} तालुका)` : 'चंद्रपूर जिल्हा (एकत्रित गोषवारा)')
          : (taluka !== 'all' ? `Chandrapur District (Only ${formatTalukaName(taluka, false)} Taluka)` : 'Whole District Rollup')
      }];
    }
    const dist = (summaryData || []).filter(r => 
      r.id === 'district-chandrapur-grand-total' || 
      r.villageName?.includes('संपूर्ण जिल्हा') || 
      r.villageName === 'Whole District Rollup'
    );
    if (dist.length > 0) return dist;
    if (categoryTalukaRows.length > 0) {
      const totalCount = categoryTalukaRows.reduce((a, b) => a + (b.total712Count || 0), 0);
      return [{
        id: 'district-chandrapur-grand-total',
        district: 'Chandrapur',
        taluka: taluka !== 'all' ? taluka : 'All',
        villageName: isMarathi 
          ? (taluka !== 'all' ? `चंद्रपूर जिल्हा (केवळ निवडलेला ${formatTalukaName(taluka, true)} तालुका)` : 'चंद्रपूर जिल्हा (एकत्रित गोषवारा)') 
          : (taluka !== 'all' ? `Chandrapur District (Only ${formatTalukaName(taluka, false)} Taluka)` : 'Whole District Rollup'),
        total712Count: totalCount,
        totalAreaHa: categoryTalukaRows.reduce((a, b) => a + Number(b.totalAreaHa || b.totalArea || 0), 0),
        totalArea: categoryTalukaRows.reduce((a, b) => a + Number(b.totalAreaHa || b.totalArea || 0), 0).toFixed(2),
        companyPermittedCount: categoryTalukaRows.reduce((a, b) => a + (b.companyPermittedCount || 0), 0),
        companyPermittedArea: categoryTalukaRows.reduce((a, b) => a + Number(b.companyPermittedArea || 0), 0).toFixed(2),
        companyUnpermittedCount: categoryTalukaRows.reduce((a, b) => a + (b.companyUnpermittedCount || 0), 0),
        companyUnpermittedArea: categoryTalukaRows.reduce((a, b) => a + Number(b.companyUnpermittedArea || 0), 0).toFixed(2),
        usageBreachCount: categoryTalukaRows.reduce((a, b) => a + (b.usageBreachCount || 0), 0),
        usageBreachArea: categoryTalukaRows.reduce((a, b) => a + Number(b.usageBreachArea || 0), 0).toFixed(2),
        transferBreachCount: categoryTalukaRows.reduce((a, b) => a + (b.transferBreachCount || 0), 0),
        transferBreachArea: categoryTalukaRows.reduce((a, b) => a + Number(b.transferBreachArea || 0), 0).toFixed(2),
        otherRightsCount: categoryTalukaRows.reduce((a, b) => a + (b.otherRightsCount || 0), 0),
        otherRightsArea: categoryTalukaRows.reduce((a, b) => a + Number(b.otherRightsArea || 0), 0).toFixed(2),
        c1Count: categoryTalukaRows.reduce((a, b) => a + (b.c1Count || 0), 0),
        c1Area: categoryTalukaRows.reduce((a, b) => a + Number(b.c1Area || 0), 0).toFixed(2),
        c2Count: categoryTalukaRows.reduce((a, b) => a + (b.c2Count || 0), 0),
        c2Area: categoryTalukaRows.reduce((a, b) => a + Number(b.c2Area || 0), 0).toFixed(2),
        convCount: categoryTalukaRows.reduce((a, b) => a + (b.convCount || 0), 0),
        convArea: categoryTalukaRows.reduce((a, b) => a + Number(b.convArea || 0), 0).toFixed(2),
        noOtherCount: categoryTalukaRows.reduce((a, b) => a + (b.noOtherCount || 0), 0),
        noOtherArea: categoryTalukaRows.reduce((a, b) => a + Number(b.noOtherArea || 0), 0).toFixed(2),
        delCount: categoryTalukaRows.reduce((a, b) => a + (b.delCount || 0), 0),
        delArea: categoryTalukaRows.reduce((a, b) => a + Number(b.delArea || 0), 0).toFixed(2),
        shartCount: categoryTalukaRows.reduce((a, b) => a + (b.shartCount || 0), 0),
        shartArea: categoryTalukaRows.reduce((a, b) => a + Number(b.shartArea || 0), 0).toFixed(2),
      }];
    }
    return [];
  }, [serverRollup, summaryData, categoryTalukaRows, isMarathi, taluka, village]);

  // Context-aware active category rollup rows count
  const activeCategoryRollupCount = useMemo(() => {
    if (village && village !== 'all' && village !== 'सर्व गावे') {
      return categoryVillageRows.length;
    }
    if (taluka && taluka !== 'all' && taluka !== 'सर्व तालुके') {
      return categoryVillageRows.length + categoryTalukaRows.length;
    }
    return categoryVillageRows.length + categoryTalukaRows.length + (categoryDistrictRows.length > 0 ? 1 : 0);
  }, [village, taluka, categoryVillageRows.length, categoryTalukaRows.length, categoryDistrictRows.length]);

  // Processed Ghoshwara Rows with manual edits overlaid
  const { processedDistrictRows, processedTalukaRows, processedVillageRows } = useMemo(() => {
    const rawDistrict = serverRollup?.districtTotal ? [serverRollup.districtTotal] : (
      summaryData.filter(r => r.villageName === 'संपूर्ण जिल्हा (१५ तालुके गोषवारा)' || r.villageName === 'Whole District Rollup')
    );
    const rawTaluka = serverRollup?.byTaluka?.length > 0 ? serverRollup.byTaluka : (
      summaryData.filter(r => r.villageName === 'संपूर्ण तालुका (All Villages)')
    );
    const rawVillage = serverRollup?.byVillage?.length > 0 ? serverRollup.byVillage : (
      summaryData.filter(r => r.villageName && r.villageName !== 'संपूर्ण तालुका (All Villages)' && r.villageName !== 'संपूर्ण जिल्हा (१५ तालुके गोषवारा)' && r.villageName !== 'Whole District Rollup')
    );

    const mapRow = (r, idx, type) => {
      const isDistrictTotal = type === 'district' || r.villageName === 'संपूर्ण जिल्हा (१५ तालुके गोषवारा)' || r.villageName === 'Whole District Rollup';
      const isTalukaTotal = type === 'taluka' || r.villageName === 'संपूर्ण तालुका (All Villages)';

      const name = isDistrictTotal
        ? (isMarathi ? 'चंद्रपूर जिल्हा' : 'Chandrapur District')
        : isTalukaTotal
        ? formatTalukaName(r.taluka, isMarathi)
        : cleanVillageName(r.villageName || r.taluka || '-');

      const rowKey = r.id || `${type}-${r.taluka || 'taluka'}-${r.villageName || idx}`;
      const edit = goshwaraEdits[rowKey];

      const rawTotalSurveys = Number(r.total712Count || r.totalGovtLandCount || 0);
      const rawTotalArea = r.totalArea !== undefined ? r.totalArea : (r.totalAreaHa !== undefined ? Number(r.totalAreaHa).toFixed(2) : '0.00');
      const rawC1Surveys = Number(r.c1Count !== undefined ? r.c1Count : (r.govtFound1950Count || 0));
      const rawC1Area = r.c1Area !== undefined ? r.c1Area : '0.00';
      const rawC2Surveys = Number(r.c2Count !== undefined ? r.c2Count : (r.pendingRectifyCount || 0));
      const rawC2Area = r.c2Area !== undefined ? r.c2Area : '0.00';
      const rawConvSurveys = Number(r.convCount !== undefined ? r.convCount : (r.illegalDeletionsCount || 0));
      const rawConvArea = r.convArea !== undefined ? r.convArea : '0.00';
      const rawNoOtherSurveys = Number(r.noOtherCount !== undefined ? r.noOtherCount : (r.pokalistPendingCount || 0));
      const rawNoOtherArea = r.noOtherArea !== undefined ? r.noOtherArea : '0.00';
      const rawDelSurveys = Number(r.delCount !== undefined ? r.delCount : (r.illegalReductionCount !== undefined ? r.illegalReductionCount : (r.shartCount || 0)));
      const rawDelArea = r.delArea !== undefined ? r.delArea : (r.delAreaHa !== undefined ? r.delAreaHa : (r.shartArea !== undefined ? r.shartArea : '0.00'));

      return {
        id: rowKey,
        key: rowKey,
        name,
        taluka: r.taluka,
        villageName: r.villageName,
        totalSurveys: edit?.totalSurveys !== undefined ? Number(edit.totalSurveys) : rawTotalSurveys,
        totalArea: edit?.totalArea !== undefined ? Number(edit.totalArea).toFixed(2) : Number(rawTotalArea).toFixed(2),
        c1Surveys: edit?.c1Surveys !== undefined ? Number(edit.c1Surveys) : rawC1Surveys,
        c1Area: edit?.c1Area !== undefined ? Number(edit.c1Area).toFixed(2) : Number(rawC1Area).toFixed(2),
        c2Surveys: edit?.c2Surveys !== undefined ? Number(edit.c2Surveys) : rawC2Surveys,
        c2Area: edit?.c2Area !== undefined ? Number(edit.c2Area).toFixed(2) : Number(rawC2Area).toFixed(2),
        convSurveys: edit?.convSurveys !== undefined ? Number(edit.convSurveys) : rawConvSurveys,
        convArea: edit?.convArea !== undefined ? Number(edit.convArea).toFixed(2) : Number(rawConvArea).toFixed(2),
        noOtherSurveys: edit?.noOtherSurveys !== undefined ? Number(edit.noOtherSurveys) : rawNoOtherSurveys,
        noOtherArea: edit?.noOtherArea !== undefined ? Number(edit.noOtherArea).toFixed(2) : Number(rawNoOtherArea).toFixed(2),
        delSurveys: edit?.delSurveys !== undefined ? Number(edit.delSurveys) : rawDelSurveys,
        delArea: edit?.delArea !== undefined ? Number(edit.delArea).toFixed(2) : Number(rawDelArea).toFixed(2),
        hasEdit: Boolean(edit)
      };
    };

    const pVillage = rawVillage.map((r, i) => mapRow(r, i, 'village'));
    const pTaluka = rawTaluka.map((r, i) => mapRow(r, i, 'taluka'));
    let pDistrict = rawDistrict.map((r, i) => mapRow(r, i, 'district'));

    if (pDistrict.length === 0 && (pTaluka.length > 0 || pVillage.length > 0)) {
      const source = pTaluka.length > 0 ? pTaluka : pVillage;
      pDistrict = [{
        id: 'dist-total',
        key: 'dist-total',
        name: isMarathi ? 'चंद्रपूर जिल्हा' : 'Chandrapur District',
        totalSurveys: source.reduce((a, b) => a + b.totalSurveys, 0),
        totalArea: source.reduce((a, b) => a + parseFloat(b.totalArea), 0).toFixed(2),
        c1Surveys: source.reduce((a, b) => a + b.c1Surveys, 0),
        c1Area: source.reduce((a, b) => a + parseFloat(b.c1Area), 0).toFixed(2),
        c2Surveys: source.reduce((a, b) => a + b.c2Surveys, 0),
        c2Area: source.reduce((a, b) => a + parseFloat(b.c2Area), 0).toFixed(2),
        convSurveys: source.reduce((a, b) => a + b.convSurveys, 0),
        convArea: source.reduce((a, b) => a + parseFloat(b.convArea), 0).toFixed(2),
        noOtherSurveys: source.reduce((a, b) => a + b.noOtherSurveys, 0),
        noOtherArea: source.reduce((a, b) => a + parseFloat(b.noOtherArea), 0).toFixed(2),
        delSurveys: source.reduce((a, b) => a + b.delSurveys, 0),
        delArea: source.reduce((a, b) => a + parseFloat(b.delArea), 0).toFixed(2),
      }];
    }

    return {
      processedDistrictRows: pDistrict,
      processedTalukaRows: pTaluka,
      processedVillageRows: pVillage
    };
  }, [serverRollup, summaryData, goshwaraEdits, isMarathi]);

  // Dedicated export function sending exact current/edited Goshwara tables
  const exportCurrentGoshwara = async (type) => {
    const isExcel = type === 'excel';
    if (isExcel) setDownloadingExcel(true);
    else setDownloadingPdf(true);

    try {
      const effectiveTier = village !== 'all' ? 'village' : (taluka !== 'all' ? 'taluka' : 'all');
      const payload = {
        tier: effectiveTier,
        scopeName: activeScope || taluka || 'Chandrapur',
        districtRows: processedDistrictRows,
        talukaRows: processedTalukaRows,
        villageRows: processedVillageRows
      };

      if (isExcel) {
        await api.exportGoshwaraExcel(payload);
      } else {
        await api.exportGoshwaraPdf(payload);
      }

      setToastMessage({
        type: 'success',
        text: isMarathi 
          ? `गोषवारा ${isExcel ? 'एक्सेल (.xlsx)' : 'पीडीएफ (.pdf)'} यशस्वीरीत्या डाऊनलोड झाला.`
          : `Goshwara ${isExcel ? 'Excel (.xlsx)' : 'PDF (.pdf)'} downloaded successfully.`
      });
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.warn('Custom goshwara export failed, falling back to URL download:', err);
      const url = isExcel ? excelDownloadUrl : pdfDownloadUrl;
      window.location.href = url;
    } finally {
      if (isExcel) setDownloadingExcel(false);
      else setDownloadingPdf(false);
    }
  };

  // Robust programmatic download with feedback
  const handleDownload = async (type) => {
    if (activeTab === 'renumbering') {
      if (type === 'excel') { setDownloadingExcel(true); try { await renumberingExportHandlers?.exportExcel?.(); } finally { setDownloadingExcel(false); } return; }
      else { setDownloadingPdf(true); try { await renumberingExportHandlers?.exportPdf?.(); } finally { setDownloadingPdf(false); } return; }
    }
    if (activeTab === 'goshwara' || (activeTab === 'checklist' && activeView === 'summary')) {
      return exportCurrentGoshwara(type);
    }
    const isExcel = type === 'excel';
    if (isExcel) setDownloadingExcel(true);
    else setDownloadingPdf(true);

    const url = isExcel ? excelDownloadUrl : pdfDownloadUrl;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = isExcel 
        ? (activeTab === 'prapatra5' 
            ? `Prapatra-${selectedPrapatraId}_Chandrapur.xlsx` 
            : activeTab === 'categories' 
            ? `Category-${selectedCatId}_Booklet.xlsx` 
            : (activeView === 'parcels' ? `Checklist_Sankshipt_7-12.xlsx` : `Checklist-46_Chandrapur.xlsx`))
        : (activeTab === 'prapatra5' 
            ? `Prapatra-${selectedPrapatraId}_Chandrapur.pdf` 
            : activeTab === 'categories' 
            ? (activeView === 'categorySummary' ? `Category-${selectedCatId}_Goshwara.pdf` : `Category-${selectedCatId}_Booklet.pdf`) 
            : (activeView === 'parcels' ? `Checklist_Sankshipt_7-12.pdf` : `Checklist-46_Chandrapur.pdf`));

      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setToastMessage({
        type: 'success',
        text: isMarathi 
          ? `बुकलेट '${filename}' यशस्वीरीत्या डाऊनलोड झाली.` 
          : `Booklet '${filename}' downloaded successfully.`
      });
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.warn('Direct blob download error, triggering fallback navigation:', err);
      window.location.href = url;
    } finally {
      if (isExcel) setDownloadingExcel(false);
      else setDownloadingPdf(false);
    }
  };

  const isFilterPending =
    draftTaluka !== appliedFilters.taluka ||
    draftVillage !== appliedFilters.village ||
    (!isGoshwaraView && activeTab !== 'prapatra5' && activeTab !== 'renumbering' && (
      draftTenure !== appliedFilters.tenure ||
      draftViolation !== appliedFilters.violation ||
      draftSearch.trim() !== appliedFilters.search
    ));

  const hasActiveFilters =
    appliedFilters.taluka !== 'all' ||
    appliedFilters.village !== 'all' ||
    draftTaluka !== 'all' ||
    draftVillage !== 'all' ||
    (!isGoshwaraView && activeTab !== 'prapatra5' && activeTab !== 'renumbering' && (
      appliedFilters.tenure !== 'all' ||
      appliedFilters.violation !== 'all' ||
      appliedFilters.search !== '' ||
      draftTenure !== 'all' ||
      draftViolation !== 'all' ||
      draftSearch !== ''
    ));

  const handleApplyFilters = () => {
    setAppliedFilters({
      taluka: draftTaluka,
      village: draftVillage,
      tenure: draftTenure,
      violation: draftViolation,
      search: draftSearch.trim(),
    });
    setSelectedKpiFilter('all');
    if (draftVillage !== 'all') {
      setGoshwaraTier('village');
    } else if (draftTaluka !== 'all') {
      if (goshwaraTier === 'district') setGoshwaraTier('taluka');
    }
  };

  const handleResetFilters = () => {
    setDraftTaluka('all');
    setDraftVillage('all');
    setDraftTenure('all');
    setDraftViolation('all');
    setDraftSearch('');
    setSelectedKpiFilter('all');
    setAppliedFilters({
      taluka: 'all',
      village: 'all',
      tenure: 'all',
      violation: 'all',
      search: '',
    });
  };

  // Searchable Dropdown Options
  const talukaSelectOptions = useMemo(() => [
    { value: 'all', label: isMarathi ? 'सर्व तालुके (१५)' : 'All Talukas (15)' },
    ...CHANDRAPUR_TALUKAS.map(t => ({
      value: t.id,
      label: isMarathi ? t.nameMr : t.nameEn
    }))
  ], [isMarathi]);

  const villageSelectOptions = useMemo(() => {
    const opts = [{ value: 'all', label: isMarathi ? 'सर्व गावे' : 'All Villages' }];
    villageOptions.forEach(v => {
      const vName = typeof v === 'object' ? (v.villageName || v.name) : v;
      const vVal = typeof v === 'object' ? (v.villageName || v.originalVillageName || v.name) : v;
      const cleanV = cleanVillageName(vName);
      if (!cleanV || cleanV === 'अज्ञात गाव') return;
      opts.push({
        value: vVal,
        label: formatVillageName(cleanV, isMarathi),
        count: v.total712Count ? `${v.total712Count}` : undefined
      });
    });
    return opts;
  }, [villageOptions, isMarathi]);

  const tenureSelectOptions = useMemo(() => [
    { value: 'all', label: isMarathi ? 'सर्व धारणा प्रकार' : 'All Tenure Types' },
    { value: 'BHOGVATDAR_CLASS_1', label: isMarathi ? 'भोगवटादार वर्ग-१' : 'Class-1 (Freehold)' },
    { value: 'BHOGVATDAR_CLASS_2', label: isMarathi ? 'भोगवटादार वर्ग-२' : 'Class-2 (Restricted)' },
    { value: 'SARKAR_SHASAN', label: isMarathi ? 'शासकीय जमीन' : 'Government Land' },
    { value: 'DEVASTHAN_INAM', label: isMarathi ? 'देवस्थान / इनाम' : 'Devasthan / Inam' },
    { value: 'FOREST_JANGAL', label: isMarathi ? 'वन जमीन' : 'Forest Land' },
  ], [isMarathi]);

  const violationSelectOptions = useMemo(() => [
    { value: 'all', label: isMarathi ? 'सर्व तपासणी निष्कर्ष' : 'All Audit Findings' },
    { value: 'shartbhang', label: isMarathi ? 'शर्तभंग (Breach)' : 'Breach of Conditions' },
    { value: 'illegalConversion', label: isMarathi ? 'वर्ग-२ चे वर्ग-१ रूपांतरण' : 'Class-2 to Class-1 Conversion' },
    { value: 'illegalDeletion', label: isMarathi ? 'सरकार नोंद कमी केलेले' : 'Govt Name Altered/Deleted' },
    { value: 'pokalist', label: isMarathi ? 'पोकळीस्त नोंदी (बु.ग.दे.)' : 'Hollow Remarks (Bu.Ga.De)' },
    { value: 'tribalViolation', label: isMarathi ? 'आदिवासी जमीन हस्तांतरण' : 'Tribal Land Alienation' },
    { value: 'encroachment', label: isMarathi ? 'शासकीय अतिक्रमण' : 'Govt Land Encroachment' },
  ], [isMarathi]);

  const categorySelectOptions = useMemo(() => [
    ...STATUTORY_CATEGORIES.map(cat => ({
      value: cat.id,
      label: isMarathi ? `प्रपत्र क्र. ${cat.id}: ${cat.nameMr}` : `Booklet ${cat.id}: ${cat.nameEn}`,
      subtext: isMarathi ? cat.descMr : cat.descEn
    }))
  ], [isMarathi]);

  const prapatra5SelectOptions = useMemo(() => [
    ...OFFICIAL_5_PRAPATRAS.map(p => ({
      value: p.id,
      label: isMarathi ? p.nameMr : p.nameEn,
      subtext: isMarathi ? p.descMr : p.descEn
    }))
  ], [isMarathi]);

  // Strictly formatted official 14-column Goshwara Table Section Component
  const renderGoshwaraTableSection = (title, nameHeader, rows) => {
    const sumSurveys = rows.reduce((a, b) => a + Number(b.totalSurveys || 0), 0);
    const sumArea = rows.reduce((a, b) => a + parseFloat(b.totalArea || 0), 0).toFixed(2);
    const sumC1 = rows.reduce((a, b) => a + Number(b.c1Surveys || 0), 0);
    const sumC1A = rows.reduce((a, b) => a + parseFloat(b.c1Area || 0), 0).toFixed(2);
    const sumC2 = rows.reduce((a, b) => a + Number(b.c2Surveys || 0), 0);
    const sumC2A = rows.reduce((a, b) => a + parseFloat(b.c2Area || 0), 0).toFixed(2);
    const sumConv = rows.reduce((a, b) => a + Number(b.convSurveys || 0), 0);
    const sumConvA = rows.reduce((a, b) => a + parseFloat(b.convArea || 0), 0).toFixed(2);
    const sumNo = rows.reduce((a, b) => a + Number(b.noOtherSurveys || 0), 0);
    const sumNoA = rows.reduce((a, b) => a + parseFloat(b.noOtherArea || 0), 0).toFixed(2);
    const sumDel = rows.reduce((a, b) => a + Number(b.delSurveys || 0), 0);
    const sumDelA = rows.reduce((a, b) => a + parseFloat(b.delArea || 0), 0).toFixed(2);

    return (
      <div className="space-y-0 mb-6 bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden">
        {/* Strictly formatted Title Banner from user format */}
        <div className="bg-slate-100 text-slate-900 font-extrabold text-sm md:text-base py-2.5 px-4 text-center tracking-wide border-b border-slate-300 flex items-center justify-between">
          <div className="w-16 hidden sm:block" />
          <span className="flex-1 text-center font-black text-slate-800">{title}</span>
          <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
            {rows.length} {isMarathi ? 'घटक' : 'Items'}
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[1100px]">
            <thead className="sticky top-0 z-10 shadow-2xs">
              {/* Row 1: Super Headers */}
              <tr className="bg-slate-50 text-slate-900 font-bold border-b border-slate-300 text-center text-[11px]">
                <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-300 w-12 bg-slate-100/80">{isMarathi ? 'अ.क्र.' : 'Sr.'}</th>
                <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-300 text-left min-w-[150px] bg-slate-100/80">{nameHeader}</th>
                <th rowSpan={2} className="py-2.5 px-2.5 border-r border-slate-300 w-24 bg-slate-100/80">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Total Survey No.'}</th>
                <th rowSpan={2} className="py-2.5 px-2.5 border-r border-slate-300 w-28 text-right bg-slate-100/80">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Total Area (Ha.R)'}</th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-blue-50/70 text-blue-950 font-black">
                  {isMarathi ? 'एकूण भोगवटदार वर्ग 1 जमिनी' : 'Total Occupant Class 1 Lands'}
                </th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-amber-50/70 text-amber-950 font-black">
                  {isMarathi ? 'एकूण भोगवटदार वर्ग 2 जमिनी' : 'Total Occupant Class 2 Lands'}
                </th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-rose-50/70 text-rose-950 font-black">
                  {isMarathi ? 'अवैधरित्या वर्ग 2 मधून वर्ग 1 केलेल्या जमिनी' : 'Illegally Converted Class 2 to 1'}
                </th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-purple-50/70 text-purple-950 font-black">
                  {isMarathi ? 'इतर अधिकारात नोंद न घेतलेल्या जमिनी' : 'Lands Without Other Rights Entry'}
                </th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-emerald-50/70 text-emerald-950 font-black">
                  {isMarathi ? 'अवैधरित्या इतर अधिकारामधून नोंद कमी केलेल्या जमिनी' : 'Illegally Deleted From Other Rights'}
                </th>
                <th rowSpan={2} className="py-2.5 px-2 w-20 text-center border-l border-slate-300 bg-slate-100/80">
                  {isMarathi ? 'कृती' : 'Action'}
                </th>
              </tr>
              {/* Row 2: Sub-Headers */}
              <tr className="bg-slate-50 text-[10px] text-slate-700 font-bold border-b border-slate-300 text-center">
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-16">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-20 text-right">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-16">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-20 text-right">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-16 text-rose-900">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-20 text-right text-rose-900">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-16 text-purple-900">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-20 text-right text-purple-900">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-16 text-emerald-900">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-20 text-right text-emerald-900">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={15} className="py-8 text-center text-slate-400">
                    {isMarathi ? 'या पत्रकाकरिता डेटा उपलब्ध नाही.' : 'No data available for this sheet.'}
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const isEditing = editingRowKey === row.key;
                  return (
                    <tr
                      key={row.key}
                      className={clsx(
                        'transition-colors',
                        isEditing ? 'bg-amber-50/70 ring-1 ring-amber-300' : (idx % 2 === 1 ? 'bg-slate-50/50 hover:bg-blue-50/30' : 'bg-white hover:bg-blue-50/30')
                      )}
                    >
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-slate-500 font-semibold">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{row.name}</span>
                          {row.hasEdit && (
                            <span className="text-[9px] bg-blue-100 text-blue-700 px-1 py-0.2 rounded font-bold" title="वापरकर्त्याने संपादित केलेले">
                              {isMarathi ? 'सुधारित' : 'Edited'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total Surveys & Total Area */}
                      {isEditing ? (
                        <>
                          <td className="py-1 px-1 border-r border-slate-200">
                            <input
                              type="number"
                              min="0"
                              value={editFormData.totalSurveys ?? ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, totalSurveys: e.target.value }))}
                              className="w-full px-1.5 py-0.5 text-xs text-center border border-blue-400 rounded bg-white font-mono focus:outline-blue-600 font-bold"
                            />
                          </td>
                          <td className="py-1 px-1 border-r border-slate-200">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editFormData.totalArea ?? ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, totalArea: e.target.value }))}
                              className="w-full px-1.5 py-0.5 text-xs text-right border border-blue-400 rounded bg-white font-mono focus:outline-blue-600 font-bold"
                            />
                          </td>
                          {/* Class 1 */}
                          <td className="py-1 px-1 border-r border-slate-200">
                            <input
                              type="number"
                              min="0"
                              value={editFormData.c1Surveys ?? ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, c1Surveys: e.target.value }))}
                              className="w-full px-1.5 py-0.5 text-xs text-center border border-blue-400 rounded bg-white font-mono focus:outline-blue-600 text-blue-800"
                            />
                          </td>
                          <td className="py-1 px-1 border-r border-slate-200">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editFormData.c1Area ?? ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, c1Area: e.target.value }))}
                              className="w-full px-1.5 py-0.5 text-xs text-right border border-blue-400 rounded bg-white font-mono focus:outline-blue-600 text-blue-800"
                            />
                          </td>
                          {/* Class 2 */}
                          <td className="py-1 px-1 border-r border-slate-200">
                            <input
                              type="number"
                              min="0"
                              value={editFormData.c2Surveys ?? ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, c2Surveys: e.target.value }))}
                              className="w-full px-1.5 py-0.5 text-xs text-center border border-blue-400 rounded bg-white font-mono focus:outline-blue-600 text-amber-800"
                            />
                          </td>
                          <td className="py-1 px-1 border-r border-slate-200">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editFormData.c2Area ?? ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, c2Area: e.target.value }))}
                              className="w-full px-1.5 py-0.5 text-xs text-right border border-blue-400 rounded bg-white font-mono focus:outline-blue-600 text-amber-800"
                            />
                          </td>
                          {/* Conversion */}
                          <td className="py-1 px-1 border-r border-slate-200">
                            <input
                              type="number"
                              min="0"
                              value={editFormData.convSurveys ?? ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, convSurveys: e.target.value }))}
                              className="w-full px-1.5 py-0.5 text-xs text-center border border-rose-400 rounded bg-white font-mono focus:outline-rose-600 text-rose-800"
                            />
                          </td>
                          <td className="py-1 px-1 border-r border-slate-200">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editFormData.convArea ?? ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, convArea: e.target.value }))}
                              className="w-full px-1.5 py-0.5 text-xs text-right border border-rose-400 rounded bg-white font-mono focus:outline-rose-600 text-rose-800"
                            />
                          </td>
                          {/* No Other Rights */}
                          <td className="py-1 px-1 border-r border-slate-200">
                            <input
                              type="number"
                              min="0"
                              value={editFormData.noOtherSurveys ?? ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, noOtherSurveys: e.target.value }))}
                              className="w-full px-1.5 py-0.5 text-xs text-center border border-purple-400 rounded bg-white font-mono focus:outline-purple-600 text-purple-800"
                            />
                          </td>
                          <td className="py-1 px-1 border-r border-slate-200">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editFormData.noOtherArea ?? ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, noOtherArea: e.target.value }))}
                              className="w-full px-1.5 py-0.5 text-xs text-right border border-purple-400 rounded bg-white font-mono focus:outline-purple-600 text-purple-800"
                            />
                          </td>
                          {/* Illegal Deletion */}
                          <td className="py-1 px-1 border-r border-slate-200">
                            <input
                              type="number"
                              min="0"
                              value={editFormData.delSurveys ?? ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, delSurveys: e.target.value }))}
                              className="w-full px-1.5 py-0.5 text-xs text-center border border-emerald-400 rounded bg-white font-mono focus:outline-emerald-600 text-emerald-800"
                            />
                          </td>
                          <td className="py-1 px-1 border-r border-slate-200">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editFormData.delArea ?? ''}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, delArea: e.target.value }))}
                              className="w-full px-1.5 py-0.5 text-xs text-right border border-emerald-400 rounded bg-white font-mono focus:outline-emerald-600 text-emerald-800"
                            />
                          </td>
                          {/* Action Buttons */}
                          <td className="py-1 px-1 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(row.key)}
                                className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer transition shadow-xs"
                                title={isMarathi ? 'जतन करा' : 'Save'}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="p-1 bg-slate-400 hover:bg-slate-500 text-white rounded cursor-pointer transition shadow-xs"
                                title={isMarathi ? 'रद्द करा' : 'Cancel'}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-2 px-2.5 text-center border-r border-slate-200 font-mono font-bold text-slate-800">
                            {row.totalSurveys}
                          </td>
                          <td className="py-2 px-2.5 text-right border-r border-slate-200 font-mono text-slate-700 font-semibold">
                            {row.totalArea}
                          </td>

                          {/* Class 1 */}
                          <td className="py-2 px-1.5 text-center border-r border-slate-200 font-mono text-blue-700 font-bold">
                            {row.c1Surveys}
                          </td>
                          <td className="py-2 px-1.5 text-right border-r border-slate-200 font-mono text-slate-600">
                            {row.c1Area}
                          </td>

                          {/* Class 2 */}
                          <td className="py-2 px-1.5 text-center border-r border-slate-200 font-mono text-amber-700 font-bold">
                            {row.c2Surveys}
                          </td>
                          <td className="py-2 px-1.5 text-right border-r border-slate-200 font-mono text-slate-600">
                            {row.c2Area}
                          </td>

                          {/* Conversion 2 to 1 */}
                          <td className="py-2 px-1.5 text-center border-r border-slate-200 font-mono text-rose-700 font-bold">
                            {row.convSurveys}
                          </td>
                          <td className="py-2 px-1.5 text-right border-r border-slate-200 font-mono text-rose-600">
                            {row.convArea}
                          </td>

                          {/* No Other Rights */}
                          <td className="py-2 px-1.5 text-center border-r border-slate-200 font-mono text-purple-700 font-bold">
                            {row.noOtherSurveys}
                          </td>
                          <td className="py-2 px-1.5 text-right border-r border-slate-200 font-mono text-purple-600">
                            {row.noOtherArea}
                          </td>

                          {/* Illegal Deletion */}
                          <td className="py-2 px-1.5 text-center border-r border-slate-200 font-mono text-emerald-700 font-bold">
                            {row.delSurveys}
                          </td>
                          <td className="py-2 px-1.5 text-right border-r border-slate-200 font-mono text-emerald-600">
                            {row.delArea}
                          </td>

                          {/* Edit Action Button */}
                          <td className="py-1 px-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(row.key, row)}
                              className="px-2 py-1 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded text-[11px] font-semibold cursor-pointer transition flex items-center justify-center gap-1 mx-auto"
                              title={isMarathi ? 'संपादन करा' : 'Edit Row'}
                            >
                              <Edit3 className="w-3 h-3 text-blue-600" />
                              <span className="hidden sm:inline">{isMarathi ? 'बदला' : 'Edit'}</span>
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Grand Total Footer */}
            {rows.length > 0 && (
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900">
                <tr>
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-black">
                    {isMarathi ? 'एकूण' : 'Total'}
                  </td>
                  <td className="py-2.5 px-3 border-r border-slate-300 font-black">
                    -
                  </td>
                  <td className="py-2.5 px-2.5 text-center border-r border-slate-300 font-mono font-black text-slate-900">
                    {sumSurveys}
                  </td>
                  <td className="py-2.5 px-2.5 text-right border-r border-slate-300 font-mono font-black text-slate-900">
                    {sumArea}
                  </td>
                  {/* Class 1 Total */}
                  <td className="py-2.5 px-1.5 text-center border-r border-slate-300 font-mono font-black text-blue-900">
                    {sumC1}
                  </td>
                  <td className="py-2.5 px-1.5 text-right border-r border-slate-300 font-mono font-black text-blue-900">
                    {sumC1A}
                  </td>
                  {/* Class 2 Total */}
                  <td className="py-2.5 px-1.5 text-center border-r border-slate-300 font-mono font-black text-amber-900">
                    {sumC2}
                  </td>
                  <td className="py-2.5 px-1.5 text-right border-r border-slate-300 font-mono font-black text-amber-900">
                    {sumC2A}
                  </td>
                  {/* Conversion Total */}
                  <td className="py-2.5 px-1.5 text-center border-r border-slate-300 font-mono font-black text-rose-900">
                    {sumConv}
                  </td>
                  <td className="py-2.5 px-1.5 text-right border-r border-slate-300 font-mono font-black text-rose-900">
                    {sumConvA}
                  </td>
                  {/* No Other Rights Total */}
                  <td className="py-2.5 px-1.5 text-center border-r border-slate-300 font-mono font-black text-purple-900">
                    {sumNo}
                  </td>
                  <td className="py-2.5 px-1.5 text-right border-r border-slate-300 font-mono font-black text-purple-900">
                    {sumNoA}
                  </td>
                  {/* Illegal Deletion Total */}
                  <td className="py-2.5 px-1.5 text-center border-r border-slate-300 font-mono font-black text-emerald-900">
                    {sumDel}
                  </td>
                  <td className="py-2.5 px-1.5 text-right border-r border-slate-300 font-mono font-black text-emerald-900">
                    {sumDelA}
                  </td>
                  <td className="py-2.5 px-2 text-center text-slate-400">
                    -
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  };

  // =========================================================================
  // Strictly formatted Category 18 & 2 Tenancy Act Goshwara Table Section Component (Matching Image 2)
  // =========================================================================
  const renderCategoryTenancyGoshwaraSection = (title, nameHeader, rows, type = 'village') => {
    const isDistrict = type === 'district';
    const isTaluka = type === 'taluka';

    const sumSurveys = rows.reduce((a, b) => a + Number(b.total712Count || 0), 0);
    const sumArea = rows.reduce((a, b) => a + parseFloat(b.totalArea || b.totalAreaHa || 0), 0).toFixed(2);
    const sumPermSurveys = rows.reduce((a, b) => a + Number(b.companyPermittedCount || 0), 0);
    const sumPermArea = rows.reduce((a, b) => a + parseFloat(b.companyPermittedArea || 0), 0).toFixed(2);
    const sumUnpermSurveys = rows.reduce((a, b) => a + Number(b.companyUnpermittedCount || 0), 0);
    const sumUnpermArea = rows.reduce((a, b) => a + parseFloat(b.companyUnpermittedArea || 0), 0).toFixed(2);
    const sumUseSurveys = rows.reduce((a, b) => a + Number(b.usageBreachCount || 0), 0);
    const sumUseArea = rows.reduce((a, b) => a + parseFloat(b.usageBreachArea || 0), 0).toFixed(2);
    const sumTrSurveys = rows.reduce((a, b) => a + Number(b.transferBreachCount || 0), 0);
    const sumTrArea = rows.reduce((a, b) => a + parseFloat(b.transferBreachArea || 0), 0).toFixed(2);
    const sumOthSurveys = rows.reduce((a, b) => a + Number(b.otherRightsCount || 0), 0);
    const sumOthArea = rows.reduce((a, b) => a + parseFloat(b.otherRightsArea || 0), 0).toFixed(2);

    return (
      <div className="space-y-0 mb-6 bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden">
        {/* Strictly formatted Title Banner matching Image 2 */}
        <div className="bg-slate-800 text-white font-extrabold text-sm md:text-base py-2.5 px-4 text-center tracking-wide border-b border-slate-300 flex items-center justify-between">
          <div className="w-24 hidden sm:flex items-center text-[10px] text-slate-300 gap-1 font-mono">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>१४ रकाने</span>
          </div>
          <span className="flex-1 text-center font-black tracking-wide text-white">{title}</span>
          <span className="text-[11px] font-semibold text-slate-200 bg-slate-700/80 border border-slate-600 px-2.5 py-0.5 rounded-md">
            {rows.length} {isDistrict ? (isMarathi ? 'जिल्हा' : 'District') : isTaluka ? (isMarathi ? 'तालुका' : 'Taluka') : (isMarathi ? 'गावे' : 'Villages')}
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <table className="w-full text-left border-collapse text-xs min-w-[1280px]">
            <thead className="sticky top-0 z-10 shadow-2xs">
              {/* Row 1: Super Headers */}
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 text-center text-[11px]">
                <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-300 w-12 bg-slate-200/90">{isMarathi ? 'अ.क्र.' : 'Sr.'}</th>
                <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-300 text-left min-w-[160px] bg-slate-200/90">{nameHeader}</th>
                <th rowSpan={2} className="py-2.5 px-2.5 border-r border-slate-300 w-24 bg-slate-200/90">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Total Survey No.'}</th>
                <th rowSpan={2} className="py-2.5 px-2.5 border-r border-slate-300 w-28 text-right bg-slate-200/90">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Total Area (Ha.R)'}</th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-emerald-50 text-emerald-950 font-black">
                  {isMarathi ? 'कंपनीने जमीन धारण करताना परवानगी घेतलेल्या जमिनी' : 'Permitted Company Holdings'}
                </th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-amber-50 text-amber-950 font-black">
                  {isMarathi ? 'कंपनीने जमीन धारण करताना परवानगी न घेतलेल्या जमिनी' : 'Unpermitted Company Holdings'}
                </th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-rose-50 text-rose-950 font-black">
                  {isMarathi ? 'वापराबाबत शर्तभंग झालेला जमिनी' : 'Usage Condition Breach Lands'}
                </th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-red-50 text-red-950 font-black">
                  {isMarathi ? 'हस्तांतरणाबाबत शर्तभंग जमिनी' : 'Transfer Condition Breach Lands'}
                </th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-blue-50 text-blue-950 font-black">
                  {isMarathi ? 'इतर अधिकारात नोंद घेतलेल्या जमिनी' : 'Lands with Other Rights Noted'}
                </th>
              </tr>
              {/* Row 2: Sub-Headers (Paired columns) */}
              <tr className="bg-slate-50 text-[10px] text-slate-700 font-bold border-b border-slate-300 text-center">
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-20">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-24 text-right">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-20">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-24 text-right">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-20 text-rose-900">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-24 text-right text-rose-900">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-20 text-red-900">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-24 text-right text-red-900">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-20 text-blue-900">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-24 text-right text-blue-900">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
              </tr>
              {/* Row 3: Statutory Numbers Row (१ ते १४) */}
              <tr className="bg-slate-100 text-[10px] text-slate-500 font-mono text-center border-b border-slate-300 italic">
                <th className="py-0.5 border-r border-slate-300">१</th>
                <th className="py-0.5 border-r border-slate-300">२</th>
                <th className="py-0.5 border-r border-slate-300">३</th>
                <th className="py-0.5 border-r border-slate-300">४</th>
                <th className="py-0.5 border-r border-slate-300 bg-emerald-50/40">५</th>
                <th className="py-0.5 border-r border-slate-300 bg-emerald-50/40">६</th>
                <th className="py-0.5 border-r border-slate-300 bg-amber-50/40">७</th>
                <th className="py-0.5 border-r border-slate-300 bg-amber-50/40">८</th>
                <th className="py-0.5 border-r border-slate-300 bg-rose-50/40">९</th>
                <th className="py-0.5 border-r border-slate-300 bg-rose-50/40">१०</th>
                <th className="py-0.5 border-r border-slate-300 bg-red-50/40">११</th>
                <th className="py-0.5 border-r border-slate-300 bg-red-50/40">१२</th>
                <th className="py-0.5 border-r border-slate-300 bg-blue-50/40">१३</th>
                <th className="py-0.5 border-r border-slate-300 bg-blue-50/40">१४</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-slate-400">
                    <Info className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                    <span className="text-xs font-semibold">{isMarathi ? 'या पत्रकाकरिता डेटा उपलब्ध नाही.' : 'No data available for this section.'}</span>
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const talukaDisplay = formatTalukaName(row.taluka, isMarathi);
                  const displayName = isDistrict
                    ? (isMarathi 
                        ? (taluka !== 'all' ? `चंद्रपूर जिल्हा (केवळ निवडलेला ${talukaDisplay} तालुका)` : 'चंद्रपूर जिल्हा (एकत्रित गोषवारा)') 
                        : (taluka !== 'all' ? `Chandrapur District (Only ${talukaDisplay} Taluka)` : 'Chandrapur District (All 15 Talukas)'))
                    : isTaluka
                    ? (row.taluka 
                        ? (village && village !== 'all' && village !== 'सर्व गावे'
                            ? (isMarathi ? `${talukaDisplay} (संपूर्ण तालुका - सर्व गावे एकत्रित)` : `${talukaDisplay} Taluka (Consolidated - All Villages)`)
                            : (isMarathi ? `${talukaDisplay} (तालुका)` : 'Taluka'))
                        : (isMarathi ? 'तालुका' : 'Taluka'))
                    : formatVillageName(row.villageName || row.taluka, isMarathi);

                  return (
                    <tr
                      key={row.id || idx}
                      className={clsx(
                        'transition-colors',
                        isDistrict ? 'bg-indigo-50/70 font-bold text-indigo-950' : isTaluka ? 'bg-slate-50 font-bold text-slate-900' : (idx % 2 === 1 ? 'bg-slate-50/40 hover:bg-blue-50/40' : 'bg-white hover:bg-blue-50/40')
                      )}
                    >
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-slate-500 font-semibold">{idx + 1}</td>
                      <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">{displayName}</td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-indigo-950 bg-indigo-50/20">{row.total712Count || 0}</td>
                      <td className="py-2 px-2.5 text-right border-r border-slate-200 font-mono font-bold text-emerald-800">
                        {row.totalArea || (row.totalAreaHa ? Number(row.totalAreaHa).toFixed(2) : '0.00')}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-emerald-900 bg-emerald-50/30">{row.companyPermittedCount || 0}</td>
                      <td className="py-2 px-2.5 text-right border-r border-slate-200 font-mono text-emerald-900 bg-emerald-50/20">{Number(row.companyPermittedArea || 0).toFixed(2)}</td>
                      
                      {/* Unpermitted Company Holdings */}
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold">
                        {row.companyUnpermittedCount > 0 ? (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 font-black border border-amber-300 shadow-2xs">
                            {row.companyUnpermittedCount}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className={`py-2 px-2.5 text-right border-r border-slate-200 font-mono ${row.companyUnpermittedCount > 0 ? 'text-amber-950 font-bold' : 'text-slate-400'}`}>
                        {Number(row.companyUnpermittedArea || 0).toFixed(2)}
                      </td>

                      {/* Usage Condition Breach */}
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold">
                        {row.usageBreachCount > 0 ? (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-950 font-black border border-rose-300 shadow-2xs">
                            {row.usageBreachCount}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className={`py-2 px-2.5 text-right border-r border-slate-200 font-mono ${row.usageBreachCount > 0 ? 'text-rose-950 font-bold' : 'text-slate-400'}`}>
                        {Number(row.usageBreachArea || 0).toFixed(2)}
                      </td>

                      {/* Transfer Condition Breach */}
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold">
                        {row.transferBreachCount > 0 ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-950 font-black border border-red-300 shadow-2xs">
                            {row.transferBreachCount}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className={`py-2 px-2.5 text-right border-r border-slate-200 font-mono ${row.transferBreachCount > 0 ? 'text-red-950 font-bold' : 'text-slate-400'}`}>
                        {Number(row.transferBreachArea || 0).toFixed(2)}
                      </td>

                      {/* Other Rights */}
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold">
                        {row.otherRightsCount > 0 ? (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-950 font-black border border-blue-200">
                            {row.otherRightsCount}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-right border-r border-slate-200 font-mono text-blue-900 bg-blue-50/20">{Number(row.otherRightsArea || 0).toFixed(2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Totals Row: Only show when multiple rows exist to avoid duplicate row redundancy */}
            {rows.length > 1 && (
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <tr className="text-slate-900">
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono">-</td>
                  <td className="py-2.5 px-3 border-r border-slate-300 font-black text-slate-900">{isMarathi ? 'एकूण' : 'Total'}</td>
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono font-black text-indigo-950">{sumSurveys}</td>
                  <td className="py-2.5 px-2.5 text-right border-r border-slate-300 font-mono font-black text-emerald-800">{sumArea}</td>
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono font-black text-emerald-900 bg-emerald-100/50">{sumPermSurveys}</td>
                  <td className="py-2.5 px-2.5 text-right border-r border-slate-300 font-mono font-black text-emerald-900 bg-emerald-100/40">{sumPermArea}</td>
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono font-black text-amber-900 bg-amber-100/50">{sumUnpermSurveys}</td>
                  <td className="py-2.5 px-2.5 text-right border-r border-slate-300 font-mono font-black text-amber-900 bg-amber-100/40">{sumUnpermArea}</td>
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono font-black text-rose-900 bg-rose-100/50">{sumUseSurveys}</td>
                  <td className="py-2.5 px-2.5 text-right border-r border-slate-300 font-mono font-black text-rose-900 bg-rose-100/40">{sumUseArea}</td>
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono font-black text-red-900 bg-red-100/50">{sumTrSurveys}</td>
                  <td className="py-2.5 px-2.5 text-right border-r border-slate-300 font-mono font-black text-red-900 bg-red-100/40">{sumTrArea}</td>
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono font-black text-blue-900 bg-blue-100/50">{sumOthSurveys}</td>
                  <td className="py-2.5 px-2.5 text-right border-r border-slate-300 font-mono font-black text-blue-900 bg-blue-100/40">{sumOthArea}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  };

  // =========================================================================
  // Strictly formatted General Statutory Categories Goshwara Table Section Component
  // =========================================================================
  const renderCategoryGeneralGoshwaraSection = (title, nameHeader, rows, type = 'village') => {
    const isDistrict = type === 'district';
    const isTaluka = type === 'taluka';

    const sumSurveys = rows.reduce((a, b) => a + Number(b.total712Count || 0), 0);
    const sumArea = rows.reduce((a, b) => a + parseFloat(b.totalArea || b.totalAreaHa || 0), 0).toFixed(2);
    const sumC1 = rows.reduce((a, b) => a + Number(b.c1Count || 0), 0);
    const sumC1A = rows.reduce((a, b) => a + parseFloat(b.c1Area || 0), 0).toFixed(2);
    const sumC2 = rows.reduce((a, b) => a + Number(b.c2Count || 0), 0);
    const sumC2A = rows.reduce((a, b) => a + parseFloat(b.c2Area || 0), 0).toFixed(2);
    const sumConv = rows.reduce((a, b) => a + Number(b.convCount || 0), 0);
    const sumConvA = rows.reduce((a, b) => a + parseFloat(b.convArea || 0), 0).toFixed(2);
    const sumNo = rows.reduce((a, b) => a + Number(b.noOtherCount || 0), 0);
    const sumNoA = rows.reduce((a, b) => a + parseFloat(b.noOtherArea || 0), 0).toFixed(2);
    const sumDel = rows.reduce((a, b) => a + Number(b.delCount || 0), 0);
    const sumDelA = rows.reduce((a, b) => a + parseFloat(b.delArea || 0), 0).toFixed(2);
    const sumShart = rows.reduce((a, b) => a + Number(b.shartCount || 0), 0);
    const sumShartA = rows.reduce((a, b) => a + parseFloat(b.shartArea || 0), 0).toFixed(2);

    return (
      <div className="space-y-0 mb-6 bg-white rounded-xl shadow-xs border border-slate-300 overflow-hidden">
        <div className="bg-slate-800 text-white font-extrabold text-sm md:text-base py-2.5 px-4 text-center tracking-wide border-b border-slate-300 flex items-center justify-between">
          <div className="w-24 hidden sm:flex items-center text-[10px] text-slate-300 gap-1 font-mono">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>१६ रकाने</span>
          </div>
          <span className="flex-1 text-center font-black tracking-wide text-white">{title}</span>
          <span className="text-[11px] font-semibold text-slate-200 bg-slate-700/80 border border-slate-600 px-2.5 py-0.5 rounded-md">
            {rows.length} {isDistrict ? (isMarathi ? 'जिल्हा' : 'District') : isTaluka ? (isMarathi ? 'तालुका' : 'Taluka') : (isMarathi ? 'गावे' : 'Villages')}
          </span>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <table className="w-full text-left border-collapse text-xs min-w-[1300px]">
            <thead className="sticky top-0 z-10 shadow-2xs">
              <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300 text-center text-[11px]">
                <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-300 w-12 bg-slate-200/90">{isMarathi ? 'अ.क्र.' : 'Sr.'}</th>
                <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-300 text-left min-w-[150px] bg-slate-200/90">{nameHeader}</th>
                <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-300 w-20 bg-slate-200/90">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Total Survey No.'}</th>
                <th rowSpan={2} className="py-2.5 px-2.5 border-r border-slate-300 w-24 text-right bg-slate-200/90">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Total Area (Ha.R)'}</th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-blue-50/70 text-blue-950 font-black">
                  {isMarathi ? 'एकूण भोगवटदार वर्ग १ जमिनी' : 'Total Occupant Class 1 Lands'}
                </th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-amber-50/70 text-amber-950 font-black">
                  {isMarathi ? 'एकूण भोगवटदार वर्ग २ जमिनी' : 'Total Occupant Class 2 Lands'}
                </th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-rose-50/70 text-rose-950 font-black">
                  {isMarathi ? 'अवैधरित्या वर्ग २ मधून वर्ग १ केलेल्या जमिनी' : 'Illegally Converted Class 2 to 1'}
                </th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-purple-50/70 text-purple-950 font-black">
                  {isMarathi ? 'इतर अधिकारात नोंद न घेतलेल्या जमिनी' : 'Lands Without Other Rights Entry'}
                </th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-emerald-50/70 text-emerald-950 font-black">
                  {isMarathi ? 'अवैधरित्या इतर अधिकारामधून नोंद कमी केलेल्या जमिनी' : 'Illegally Deleted From Other Rights'}
                </th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-red-50 text-red-950 font-black min-w-[175px]">
                  {isMarathi ? 'शर्तभंग झालेल्या जमिनी' : 'Condition Breach Lands'}
                </th>
              </tr>
              <tr className="bg-slate-50 text-[10px] text-slate-700 font-bold border-b border-slate-300 text-center">
                <th className="py-1.5 px-1 border-r border-slate-300 w-16">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-22 text-right">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
                <th className="py-1.5 px-1 border-r border-slate-300 w-16">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-22 text-right">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
                <th className="py-1.5 px-1 border-r border-slate-300 w-16 text-rose-900">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-22 text-right text-rose-900">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-16 text-purple-900">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-22 text-right text-purple-900">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
                <th className="py-1.5 px-1 border-r border-slate-300 w-16 text-emerald-900">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-22 text-right text-emerald-900">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
                <th className="py-1.5 px-1 border-r border-slate-300 w-16 text-red-900 bg-red-50/40">{isMarathi ? 'एकूण सर्व्हे क्रमांक' : 'Survey No.'}</th>
                <th className="py-1.5 px-1.5 border-r border-slate-300 w-24 text-right text-red-900 bg-red-50/40">{isMarathi ? 'एकूण क्षेत्र(हे.आर.)' : 'Area (Ha.R)'}</th>
              </tr>
              <tr className="bg-slate-100 text-[10px] text-slate-500 font-mono text-center border-b border-slate-300 italic">
                <th className="py-0.5 border-r border-slate-300">१</th>
                <th className="py-0.5 border-r border-slate-300">२</th>
                <th className="py-0.5 border-r border-slate-300">३</th>
                <th className="py-0.5 border-r border-slate-300">४</th>
                <th className="py-0.5 border-r border-slate-300 bg-blue-50/40">५</th>
                <th className="py-0.5 border-r border-slate-300 bg-blue-50/40">६</th>
                <th className="py-0.5 border-r border-slate-300 bg-amber-50/40">७</th>
                <th className="py-0.5 border-r border-slate-300 bg-amber-50/40">८</th>
                <th className="py-0.5 border-r border-slate-300 bg-rose-50/40">९</th>
                <th className="py-0.5 border-r border-slate-300 bg-rose-50/40">१०</th>
                <th className="py-0.5 border-r border-slate-300 bg-purple-50/40">११</th>
                <th className="py-0.5 border-r border-slate-300 bg-purple-50/40">१२</th>
                <th className="py-0.5 border-r border-slate-300 bg-emerald-50/40">१३</th>
                <th className="py-0.5 border-r border-slate-300 bg-emerald-50/40">१४</th>
                <th className="py-0.5 border-r border-slate-300 bg-red-50/60">१५</th>
                <th className="py-0.5 border-r border-slate-300 bg-red-50/60">१६</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-8 text-center text-slate-400">
                    <Info className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                    <span className="text-xs font-semibold">{isMarathi ? 'या पत्रकाकरिता डेटा उपलब्ध नाही.' : 'No data available for this section.'}</span>
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const talukaDisplay = formatTalukaName(row.taluka, isMarathi);
                  const displayName = isDistrict
                    ? (isMarathi 
                        ? (taluka !== 'all' ? `चंद्रपूर जिल्हा (केवळ निवडलेला ${talukaDisplay} तालुका)` : 'चंद्रपूर जिल्हा (एकत्रित गोषवारा)') 
                        : (taluka !== 'all' ? `Chandrapur District (Only ${talukaDisplay} Taluka)` : 'Chandrapur District (All 15 Talukas)'))
                    : isTaluka
                    ? (row.taluka 
                        ? (village && village !== 'all' && village !== 'सर्व गावे'
                            ? (isMarathi ? `${talukaDisplay} (संपूर्ण तालुका - सर्व गावे एकत्रित)` : `${talukaDisplay} Taluka (Consolidated - All Villages)`)
                            : (isMarathi ? `${talukaDisplay} (तालुका)` : `${talukaDisplay} Taluka`))
                        : (isMarathi ? 'सर्व तालुके' : 'All Talukas'))
                    : formatVillageName(row.villageName || row.taluka, isMarathi);

                  return (
                    <tr
                      key={row.id || idx}
                      className={clsx(
                        'transition-colors',
                        isDistrict ? 'bg-indigo-50/70 font-bold text-indigo-950' : isTaluka ? 'bg-slate-50 font-bold text-slate-900' : (idx % 2 === 1 ? 'bg-slate-50/40 hover:bg-blue-50/40' : 'bg-white hover:bg-blue-50/40')
                      )}
                    >
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-slate-500 font-semibold">{idx + 1}</td>
                      <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">{displayName}</td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-indigo-950 bg-indigo-50/20">{row.total712Count || 0}</td>
                      <td className="py-2 px-2.5 text-right border-r border-slate-200 font-mono font-bold text-emerald-800">
                        {row.totalArea || (row.totalAreaHa ? Number(row.totalAreaHa).toFixed(2) : '0.00')}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-blue-900 bg-blue-50/30">{row.c1Count || 0}</td>
                      <td className="py-2 px-2.5 text-right border-r border-slate-200 font-mono text-blue-900 bg-blue-50/20">{Number(row.c1Area || 0).toFixed(2)}</td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-amber-900 bg-amber-50/30">{row.c2Count || 0}</td>
                      <td className="py-2 px-2.5 text-right border-r border-slate-200 font-mono text-amber-900 bg-amber-50/20">{Number(row.c2Area || 0).toFixed(2)}</td>
                      
                      {/* Illegally Converted Class 2 to 1 */}
                      <td className="py-2 px-1 text-center border-r border-slate-200 font-mono">
                        {row.convCount > 0 ? (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-950 font-black text-[11px] border border-rose-300 shadow-2xs">
                            {row.convCount}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className={`py-2 px-2 text-right border-r border-slate-200 font-mono ${row.convCount > 0 ? 'text-rose-950 font-bold' : 'text-slate-400'}`}>
                        {Number(row.convArea || 0).toFixed(2)}
                      </td>

                      {/* Not Noted in Other Rights */}
                      <td className="py-2 px-1 text-center border-r border-slate-200 font-mono">
                        {row.noOtherCount > 0 ? (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-purple-100 text-purple-950 font-black text-[11px] border border-purple-200 shadow-2xs">
                            {row.noOtherCount}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right border-r border-slate-200 font-mono text-purple-900 bg-purple-50/20">{Number(row.noOtherArea || 0).toFixed(2)}</td>

                      {/* Illegally Deleted From Other Rights */}
                      <td className="py-2 px-1 text-center border-r border-slate-200 font-mono">
                        {row.delCount > 0 ? (
                          <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 font-black text-[11px] border border-amber-300 shadow-2xs">
                            {row.delCount}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className={`py-2 px-2 text-right border-r border-slate-200 font-mono ${row.delCount > 0 ? 'text-amber-950 font-bold' : 'text-slate-400'}`}>
                        {Number(row.delArea || 0).toFixed(2)}
                      </td>

                      {/* Condition Breach Lands */}
                      <td className="py-2 px-1 text-center border-r border-slate-200 font-mono bg-red-50/30">
                        {row.shartCount > 0 ? (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-red-100 text-red-950 font-black text-[11px] border border-red-300 shadow-2xs">
                            {row.shartCount}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className={`py-2 px-2 text-right border-r border-slate-200 font-mono bg-red-50/20 ${row.shartCount > 0 ? 'text-red-950 font-black' : 'text-slate-400'}`}>
                        {Number(row.shartArea || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Totals Row: Only render when multiple rows exist to avoid duplicate row redundancy */}
            {rows.length > 1 && (
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <tr className="text-slate-900">
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono">-</td>
                  <td className="py-2.5 px-3 border-r border-slate-300 font-black text-slate-900">{isMarathi ? 'एकूण' : 'Total'}</td>
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono font-black text-indigo-950">{sumSurveys}</td>
                  <td className="py-2.5 px-2.5 text-right border-r border-slate-300 font-mono font-black text-emerald-800">{sumArea}</td>
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono font-black text-blue-900 bg-blue-100/50">{sumC1}</td>
                  <td className="py-2.5 px-2.5 text-right border-r border-slate-300 font-mono font-black text-blue-900 bg-blue-100/40">{sumC1A}</td>
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono font-black text-amber-900 bg-amber-100/50">{sumC2}</td>
                  <td className="py-2.5 px-2.5 text-right border-r border-slate-300 font-mono font-black text-amber-900 bg-amber-100/40">{sumC2A}</td>
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono font-black text-rose-900 bg-rose-100/50">{sumConv}</td>
                  <td className="py-2.5 px-2.5 text-right border-r border-slate-300 font-mono font-black text-rose-900 bg-rose-100/40">{sumConvA}</td>
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono font-black text-purple-900 bg-purple-100/50">{sumNo}</td>
                  <td className="py-2.5 px-2.5 text-right border-r border-slate-300 font-mono font-black text-purple-900 bg-purple-100/40">{sumNoA}</td>
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono font-black text-emerald-900 bg-emerald-100/50">{sumDel}</td>
                  <td className="py-2.5 px-2.5 text-right border-r border-slate-300 font-mono font-black text-emerald-900 bg-emerald-100/40">{sumDelA}</td>
                  <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono font-black text-red-900 bg-red-100/50">{sumShart}</td>
                  <td className="py-2.5 px-2.5 text-right border-r border-slate-300 font-mono font-black text-red-900 bg-red-100/40">{sumShartA}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4 font-sans text-slate-800">
      <div className="w-full space-y-3 sm:space-y-4">
        
        {/* =========================================================
            HEADER & ACTIONS - Pro Compact
        ========================================================= */}
        <header className="bg-gradient-to-r from-teal-50/80 via-cyan-50/40 to-white text-slate-900 rounded-xl px-3.5 py-2 sm:py-2.5 shadow-2xs border border-teal-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight ">
                  {isMarathi ? 'महसूल तपासणी अहवाल व प्रपत्रे' : 'Revenue Inspection Reports & Prapatras'}
                </h1>
                
               
              </div>
              <p className="text-[11px] text-slate-500 md:hidden font-medium">
                {isMarathi
                  ? 'Revenue Inspection Booklets | जिल्हाधिकारी कार्यालय, चंद्रपूर'
                  : 'Revenue Inspection Booklets | District Collectorate, Chandrapur'}
              </p>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => handleDownload('excel')}
              disabled={downloadingExcel}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-60 text-white rounded-lg text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
              title={
                isMarathi
                  ? 'अधिकृत शासकीय एक्सेल बुकलेट डाऊनलोड करा (खातेदारांच्या संपूर्ण यादीसह)'
                  : 'Download official statutory Excel booklet (with complete khatedar registry)'
              }
            >
              {downloadingExcel ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              )}
              <span>
                {downloadingExcel
                  ? (isMarathi ? 'बुकलेट तयार होत आहे...' : 'Generating...')
                  : activeTab === 'checklist' && activeView === 'timeline'
                  ? (isMarathi ? '४६ सूची (.xlsx)' : '46 Points (.xlsx)')
                  : activeTab === 'checklist' && activeView === 'parcels'
                  ? (isMarathi ? 'संक्षिप्त ७/१२ (.xlsx)' : 'Compact 7/12 (.xlsx)')
                  : activeTab === 'prapatra5'
                  ? (isMarathi ? `प्रपत्र ${selectedPrapatraId} (.xlsx)` : `Prapatra ${selectedPrapatraId} (.xlsx)`)
                  : activeTab === 'categories'
                  ? (isMarathi ? `बुकलेट ${selectedCatId} (दोन्ही शीट्स .xlsx)` : `Booklet ${selectedCatId} (Both Sheets .xlsx)`)
                  : activeTab === 'renumbering'
                  ? (isMarathi ? 'रिनंबरिंग (.xlsx)' : 'Renumbering (.xlsx)')
                  : (isMarathi ? 'एक्सेल (.xlsx)' : 'Excel (.xlsx)')}
              </span>
              {activeTab !== 'renumbering' && (
                <span className="bg-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {isGoshwaraView
                    ? activeCategoryRollupCount
                    : (selectedKpiFilter !== 'all' ? kpiFilteredParcels.length : parcels.length)}
                </span>
              )}
            </button>

            {/* If on 46-Point Timeline, hide PDF button and show informative badge */}
            {activeTab === 'checklist' && activeView === 'timeline' ? (
              <div
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 border border-slate-200 text-amber-800 rounded-lg text-[11px] font-semibold"
                title={
                  isMarathi
                    ? "४६ मुद्द्यांचे ५३ स्तंभ केवळ एक्सेलमध्ये उपलब्ध आहेत. पीडीएफकरिता 'संक्षिप्त ७/१२ यादी' निवडा."
                    : "The 53 columns of 46 points are available in Excel only. For PDF, choose 'Compact 7/12 List'."
                }
              >
                <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleDownload('pdf')}
                disabled={downloadingPdf}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 disabled:opacity-60 text-white rounded-lg text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                title={
                  isMarathi
                    ? 'स्वाक्षरी व प्रमाणपत्रासह अधिकृत पीडीएफ प्रत डाऊनलोड करा'
                    : 'Download official PDF copy with digital certificate & signature'
                }
              >
                {downloadingPdf ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>
                  {downloadingPdf
                    ? (isMarathi ? 'तयार होत आहे...' : 'Generating...')
                    : activeTab === 'checklist' && activeView === 'parcels'
                    ? (isMarathi ? 'संक्षिप्त ७/१२ (.pdf)' : 'Compact 7/12 (.pdf)')
                    : activeTab === 'prapatra5'
                    ? (isMarathi ? `प्रपत्र ${selectedPrapatraId} (.pdf)` : `Prapatra ${selectedPrapatraId} (.pdf)`)
                    : activeTab === 'categories'
                    ? (activeView === 'categorySummary'
                        ? (isMarathi ? `बुकलेट ${selectedCatId} गोषवारा (.pdf)` : `Booklet ${selectedCatId} Rollup (.pdf)`)
                        : (isMarathi ? `बुकलेट ${selectedCatId} सविस्तर यादी (.pdf)` : `Booklet ${selectedCatId} Detailed (.pdf)`))
                    : activeTab === 'renumbering'
                    ? (isMarathi ? 'रिनंबरिंग (.pdf)' : 'Renumbering (.pdf)')
                    : (isMarathi ? 'पीडीएफ (.pdf)' : 'PDF (.pdf)')}
                </span>
              </button>
            )}


          </div>
        </header>

        {/* =========================================================
            TOP SEGMENTED TABS (PURE MARATHI, HORIZONTALLY SCROLLABLE ON MOBILE)
        ========================================================= */}
        <div className="flex items-center overflow-x-auto no-scrollbar border-b border-slate-200 gap-1 sm:gap-2 pb-0.5 touch-scroll -mx-1 px-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('checklist');
              setActiveView('timeline');
            }}
            className={`pb-2.5 pt-1 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'checklist'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isMarathi ? '१ ते ४६ मुद्द्यांची तपासणी सूची' : '1 to 46 Checkpoint Audit Matrix'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('prapatra5');
              setActiveView('prapatraData');
              setDraftSearch('');
              setAppliedFilters(prev => ({ ...prev, search: '' }));
            }}
            className={`pb-2.5 pt-1 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'prapatra5'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{isMarathi ? 'शासकीय प्रपत्र क्र. १ ते ५' : 'Official Prapatras 1 to 5'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('categories');
              setActiveView('categorySummary');
            }}
            className={`pb-2.5 pt-1 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'categories'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isMarathi ? '१ ते १८ विषयनिहाय बुकलेट्स' : '1 to 18 Subject Booklets'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('renumbering');
            }}
            className={`pb-2.5 pt-1 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'renumbering'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>{isMarathi ? 'रिनंबरिंग पर्चा (नोंदवही)' : 'Renumbering Parcha (Register)'}</span>
          </button>
        </div>

        {/* =========================================================
            OFFICIAL 5 PRAPATRAS DROPDOWN SELECTOR (SEARCHABLE)
        ========================================================= */}
        {activeTab === 'prapatra5' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 flex-1 min-w-0">
              <label className="text-xs font-bold text-slate-700 shrink-0 flex items-center gap-1.5 whitespace-nowrap">
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
              <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap">
                {isMarathi ? `प्रपत्र क्र. ${selectedPrapatraId}` : `Prapatra ${selectedPrapatraId}`}
              </span>
              <span
                className="text-xs text-slate-500 font-medium truncate max-w-xs md:max-w-md hidden sm:inline"
                title={isMarathi ? currentPrapatra5.descMr : currentPrapatra5.descEn}
              >
                {isMarathi ? currentPrapatra5.descMr : currentPrapatra5.descEn}
              </span>
            </div>
          </div>
        )}

        {/* =========================================================
            PROPER CATEGORY DROPDOWN SELECTOR (SEARCHABLE)
        ========================================================= */}
        {activeTab === 'categories' && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 flex-1 min-w-0">
              <label className="text-xs font-bold text-slate-700 shrink-0 flex items-center gap-1.5 whitespace-nowrap">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>{isMarathi ? 'प्रपत्र / विषय निवडा:' : 'Select Booklet / Subject:'}</span>
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
              <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap">
                {isMarathi ? `प्रपत्र क्र. ${currentCategory.id}` : `Booklet ${currentCategory.id}`}
              </span>
              <span
                className="text-xs text-slate-500 font-medium max-w-xs md:max-w-md hidden sm:inline"
                title={isMarathi ? currentCategory.descMr : currentCategory.descEn}
              >
                {isMarathi ? currentCategory.descMr : currentCategory.descEn}
              </span>
            </div>
          </div>
        )}

        {/* =========================================================
            COMPREHENSIVE MULTI-FILTER SUITE (ALL SEARCHABLE)
        ========================================================= */}
        {activeTab === 'renumbering' ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs">
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-2.5">
              {/* 1. Taluka Dropdown */}
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isMarathi ? 'तालुका निवडा' : 'Select Taluka'}</span>
                </label>
                <SearchableSelect
                  options={talukaSelectOptions}
                  value={draftTaluka}
                  onChange={val => {
                    setDraftTaluka(val);
                    setDraftVillage('all');
                  }}
                  placeholder={isMarathi ? 'तालुका निवडा...' : 'Select Taluka...'}
                  searchPlaceholder={isMarathi ? 'तालुका शोधा...' : 'Search taluka...'}
                  icon={Building2}
                  showCount={false}
                />
              </div>

              {/* 2. Village Dropdown (Disabled until Taluka is selected) */}
              <div className="flex-1 space-y-1">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <LandPlot className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isMarathi ? `गाव निवडा ${villageOptions.length > 0 ? `(${villageOptions.length})` : ''}` : 'Select Village'}</span>
                </label>
                <SearchableSelect
                  options={villageSelectOptions}
                  value={draftVillage}
                  onChange={val => setDraftVillage(val)}
                  disabled={!isDraftTalukaSelected}
                  placeholder={
                    !isDraftTalukaSelected
                      ? (isMarathi ? 'प्रथम तालुका निवडा' : 'Select Taluka first')
                      : (isMarathi ? 'गाव निवडा...' : 'Select Village...')
                  }
                  searchPlaceholder={isMarathi ? 'गाव शोधा...' : 'Search village...'}
                  icon={LandPlot}
                  showCount={true}
                />
              </div>

              {/* 3. Action Buttons: लागू करा (Apply) + रीसेट (Reset) */}
              <div className="flex items-center gap-2 pt-1 md:pt-0 shrink-0">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  disabled={!isDraftTalukaSelected || !isDraftVillageSelected || loading}
                  className={clsx(
                    "inline-flex items-center justify-center gap-1.5 px-4 py-2.5 font-bold text-xs rounded-xl shadow-xs transition",
                    loading
                      ? "bg-blue-800 text-white cursor-wait opacity-90 shadow-inner"
                      : (!isDraftTalukaSelected || !isDraftVillageSelected)
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 pointer-events-none"
                      : "bg-blue-700 hover:bg-blue-800 active:scale-95 text-white cursor-pointer"
                  )}
                  title={
                    loading
                      ? (isMarathi ? 'डेटा लागू होत आहे...' : 'Applying filters...')
                      : !isDraftTalukaSelected
                      ? (isMarathi ? 'कृपया प्रथम तालुका निवडा' : 'Please select Taluka first')
                      : (!isDraftVillageSelected
                          ? (isMarathi ? 'कृपया गाव निवडा' : 'Please select Village')
                          : (isMarathi ? 'फिल्टर लागू करा' : 'Apply Filters'))
                  }
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-200 shrink-0" />
                      <span>{isMarathi ? 'लागू करत आहे...' : 'Applying...'}</span>
                    </>
                  ) : (
                    <>
                      <Filter className="w-3.5 h-3.5 shrink-0" />
                      <span>{isMarathi ? 'लागू करा' : 'Apply'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  disabled={loading}
                  className={clsx(
                    "inline-flex items-center justify-center gap-1 px-3 py-2.5 font-bold text-xs rounded-xl border border-slate-300 shadow-2xs transition",
                    loading
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed opacity-60 pointer-events-none"
                      : "bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 cursor-pointer"
                  )}
                  title={isMarathi ? 'फिल्टर्स पूर्ववत करा' : 'Reset Filters'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isMarathi ? 'रीसेट' : 'Reset'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3">
          {/* Mobile Filter Toggle Button (Hidden on Desktop) */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setShowMobileFilters(p => !p)}
              className={clsx(
                'px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs cursor-pointer',
                showMobileFilters || hasActiveFilters
                  ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{isMarathi ? 'फिल्टर्स' : 'Filters'}</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
              <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform duration-200', showMobileFilters && 'rotate-180')} />
            </button>
          </div>

          <div
            className={clsx(
              'gap-2.5 items-end',
              showMobileFilters
                ? ((isGoshwaraView || activeTab === 'prapatra5')
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl pt-1'
                    : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 pt-1')
                : ((isGoshwaraView || activeTab === 'prapatra5')
                    ? 'hidden md:grid md:grid-cols-3 max-w-4xl'
                    : 'hidden md:grid md:grid-cols-3 lg:grid-cols-6')
            )}
          >
            {/* 1. Taluka Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isMarathi ? 'तालुका' : 'Taluka'}
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

            {/* 2. Village Dropdown (Searchable, disabled if no Taluka selected) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isMarathi ? `गाव ${villageOptions.length > 0 ? `(${villageOptions.length})` : ''}` : `Village ${villageOptions.length > 0 ? `(${villageOptions.length})` : ''}`}
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

            {/* 3. Tenure Class Filter - Hidden in Goshwara View and Prapatra 1 to 5 */}
            {!isGoshwaraView && activeTab !== 'prapatra5' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isMarathi ? 'धारणा प्रकार' : 'Tenure Type'}
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

            {/* 4. Violation / Audit Finding Filter - Hidden in Goshwara View and Prapatra 1 to 5 */}
            {!isGoshwaraView && activeTab !== 'prapatra5' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isMarathi ? 'तपासणी निष्कर्ष' : 'Audit Finding'}
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

            {/* 5. Search Box - Hidden in Goshwara View and Prapatra 1 to 5 */}
            {!isGoshwaraView && activeTab !== 'prapatra5' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isMarathi ? 'शोध' : 'Search'}
                </label>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all h-[36px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                    className="bg-transparent text-xs text-slate-800 outline-none w-full placeholder:text-slate-400 font-medium"
                  />
                  {draftSearch && (
                    <button
                      type="button"
                      onClick={() => setDraftSearch('')}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                      title={isMarathi ? 'शोध मजकूर साफ करा' : 'Clear search text'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 6. Action Controls: Apply & Reset Buttons */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isMarathi ? 'फिल्टर कृती' : 'Action'}
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className={clsx(
                    'flex-1 text-xs font-bold py-1.5 px-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 h-[36px]',
                    loading
                      ? 'bg-blue-800 text-white cursor-wait opacity-90 shadow-inner'
                      : isFilterPending
                      ? 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white ring-2 ring-blue-500/30 cursor-pointer'
                      : 'bg-blue-900 hover:bg-blue-950 text-white cursor-pointer'
                  )}
                  title={loading ? (isMarathi ? 'डेटा लागू होत आहे...' : 'Applying filters...') : (isMarathi ? 'फिल्टर्स लागू करा (Enter)' : 'Apply Filters (Enter)')}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin text-blue-200" />
                      <span>{isMarathi ? 'लागू करत आहे...' : 'Applying...'}</span>
                    </>
                  ) : (
                    <>
                      <Filter className="w-3.5 h-3.5 shrink-0" />
                      <span>{isMarathi ? 'लागू करा' : 'Apply'}</span>
                      {isFilterPending && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                      )}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-2xs cursor-pointer shrink-0 h-[36px]"
                  title={isMarathi ? 'सर्व फिल्टर्स रीसेट करा' : 'Reset all filters'}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{isMarathi ? 'रीसेट' : 'Reset'}</span>
                </button>

                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="h-[36px] w-[36px] text-slate-700 hover:text-blue-900 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-xl transition-all active:scale-95 shadow-2xs cursor-pointer shrink-0 flex items-center justify-center"
                  title={isMarathi ? 'डेटा रिफ्रेश करा' : 'Refresh data'}
                  aria-label={isMarathi ? 'डेटा रिफ्रेश करा' : 'Refresh data'}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : 'text-slate-700'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* =========================================================
            METRICS KPI STRIP (Hidden in Goshwara View & Prapatra 1 to 5)
        ========================================================= */}
        {activeTab !== 'renumbering' && !isGoshwaraView && (
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 transition-all duration-300 relative ${
          loading ? 'opacity-55 pointer-events-none select-none filter contrast-95' : 'opacity-100'
        }`}>
          {/* Card 1: Total Parcels */}
          <button
            type="button"
            onClick={() => handleKpiCardClick('all')}
            className={`text-left rounded-2xl p-3.5 transition-all duration-200 border cursor-pointer select-none group relative focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              selectedKpiFilter === 'all'
                ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-2 ring-blue-400/40'
                : 'bg-white border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className={`text-[11px] font-bold transition ${selectedKpiFilter === 'all' ? 'text-blue-900 font-extrabold' : 'text-slate-500 group-hover:text-blue-800'}`}>
                {isMarathi ? 'एकूण सर्व्हे / गट संख्या' : 'Total Survey / Gat Parcels'}
              </span>
              {selectedKpiFilter === 'all' && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-blue-600 text-white rounded-md tracking-wider shadow-2xs">
                  {isMarathi ? 'सर्व' : 'ALL'}
                </span>
              )}
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">{stats.totalCount}</div>
            <div className="flex items-center justify-between text-[10px] mt-0.5">
              <span className="text-slate-500 font-medium">
                {isMarathi ? 'तपासणी केलेले ७/१२' : 'Audited 7/12 Records'}
              </span>
              <span className={`text-[9px] font-bold transition flex items-center gap-0.5 ${loading ? 'text-blue-600 animate-pulse' : selectedKpiFilter === 'all' ? 'text-blue-700' : 'text-slate-400 group-hover:text-blue-600'}`}>
                {loading
                  ? (isMarathi ? '● अद्ययावत...' : '● Updating...')
                  : selectedKpiFilter === 'all'
                  ? (isMarathi ? '● सक्रिय' : '● Active')
                  : (isMarathi ? 'सर्व पहा ↴' : 'View all ↴')}
              </span>
            </div>
          </button>

          {/* Card 2: Total Area */}
          <button
            type="button"
            onClick={() => handleKpiCardClick('area')}
            className={`text-left rounded-2xl p-3.5 transition-all duration-200 border cursor-pointer select-none group relative focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
              selectedKpiFilter === 'area'
                ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-2 ring-emerald-400/40'
                : 'bg-white border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className={`text-[11px] font-bold transition ${selectedKpiFilter === 'area' ? 'text-emerald-950 font-extrabold' : 'text-slate-500 group-hover:text-emerald-800'}`}>
                {isMarathi ? 'एकूण क्षेत्र (हेक्टर)' : 'Total Area (Ha)'}
              </span>
              {selectedKpiFilter === 'area' && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-emerald-600 text-white rounded-md tracking-wider shadow-2xs">
                  {isMarathi ? 'सक्रिय' : 'ACTIVE'}
                </span>
              )}
            </div>
            <div className="text-xl font-black text-emerald-800 mt-1">{stats.totalAreaHa}</div>
            <div className="flex items-center justify-between text-[10px] mt-0.5">
              <span className="text-slate-500 font-medium">
                {isMarathi ? 'हेक्टर आर क्षेत्र' : 'Hectare-Are Area'}
              </span>
              <span className={`text-[9px] font-bold transition flex items-center gap-0.5 ${loading ? 'text-emerald-600 animate-pulse' : selectedKpiFilter === 'area' ? 'text-emerald-700' : 'text-slate-400 group-hover:text-emerald-600'}`}>
                {loading
                  ? (isMarathi ? '● अद्ययावत...' : '● Updating...')
                  : selectedKpiFilter === 'area'
                  ? (isMarathi ? '● सक्रिय (उतरता क्रम)' : '● Ranked')
                  : (isMarathi ? 'क्षेत्रनिहाय पहा ↴' : 'By area ↴')}
              </span>
            </div>
          </button>

          {/* Card 3: Class 2 / Govt */}
          <button
            type="button"
            onClick={() => handleKpiCardClick('class2')}
            className={`text-left rounded-2xl p-3.5 transition-all duration-200 border cursor-pointer select-none group relative focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
              selectedKpiFilter === 'class2'
                ? 'bg-amber-50/80 border-amber-500 shadow-sm ring-2 ring-amber-400/40'
                : 'bg-white border-slate-200/80 shadow-xs hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className={`text-[11px] font-bold transition ${selectedKpiFilter === 'class2' ? 'text-amber-950 font-extrabold' : 'text-slate-500 group-hover:text-amber-800'}`}>
                {isMarathi ? 'भोगवटादार वर्ग २ / शासकीय' : 'Class-2 / Govt Land'}
              </span>
              {selectedKpiFilter === 'class2' && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-amber-600 text-white rounded-md tracking-wider shadow-2xs">
                  {isMarathi ? 'सक्रिय' : 'ACTIVE'}
                </span>
              )}
            </div>
            <div className="text-xl font-black text-amber-600 mt-1">{stats.class2Count}</div>
            <div className="flex items-center justify-between text-[10px] mt-0.5">
              <span className="text-slate-500 font-medium">
                {isMarathi ? 'अविभाज्य शर्तीवरील जमिनी' : 'Restricted Tenure Holdings'}
              </span>
              <span className={`text-[9px] font-bold transition flex items-center gap-0.5 ${loading ? 'text-amber-600 animate-pulse' : selectedKpiFilter === 'class2' ? 'text-amber-700' : 'text-slate-400 group-hover:text-amber-600'}`}>
                {loading
                  ? (isMarathi ? '● अद्ययावत...' : '● Updating...')
                  : selectedKpiFilter === 'class2'
                  ? (isMarathi ? '● दाखवत आहे' : '● Filtered')
                  : (isMarathi ? 'फिल्टर करा ↴' : 'Filter ↴')}
              </span>
            </div>
          </button>

          {/* Card 4: Breaches / Violations */}
          <button
            type="button"
            onClick={() => handleKpiCardClick('violations')}
            className={`text-left rounded-2xl p-3.5 transition-all duration-200 border cursor-pointer select-none group relative focus:outline-none focus:ring-2 focus:ring-rose-500/50 ${
              selectedKpiFilter === 'violations'
                ? 'bg-rose-50/80 border-rose-500 shadow-sm ring-2 ring-rose-400/40'
                : 'bg-white border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className={`text-[11px] font-bold transition ${selectedKpiFilter === 'violations' ? 'text-rose-950 font-extrabold' : 'text-slate-500 group-hover:text-rose-800'}`}>
                {isMarathi ? 'शर्तभंग / संशयित बाबी' : 'Breaches / Flagged Issues'}
              </span>
              {selectedKpiFilter === 'violations' && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-rose-600 text-white rounded-md tracking-wider shadow-2xs">
                  {isMarathi ? 'सक्रिय' : 'ACTIVE'}
                </span>
              )}
            </div>
            <div className="text-xl font-black text-rose-600 mt-1">{stats.shartbhangCount}</div>
            <div className="flex items-center justify-between text-[10px] mt-0.5">
              <span className="text-slate-500 font-medium">
                {isMarathi ? 'विशेष चौकशी आवश्यक' : 'Inquiry Required'}
              </span>
              <span className={`text-[9px] font-bold transition flex items-center gap-0.5 ${loading ? 'text-rose-600 animate-pulse' : selectedKpiFilter === 'violations' ? 'text-rose-700' : 'text-slate-400 group-hover:text-rose-600'}`}>
                {loading
                  ? (isMarathi ? '● अद्ययावत...' : '● Updating...')
                  : selectedKpiFilter === 'violations'
                  ? (isMarathi ? '● दाखवत आहे' : '● Filtered')
                  : (isMarathi ? 'फिल्टर करा ↴' : 'Filter ↴')}
              </span>
            </div>
          </button>
        </div>
        )}

        {/* =========================================================
            VIEW SWITCHER & TABLE CARD
        ========================================================= */}
        {activeTab === 'renumbering' ? (
          <RenumberingParchaView
            selectedTaluka={appliedFilters.taluka}
            selectedVillage={appliedFilters.village}
            onRegisterExportHandlers={setRenumberingExportHandlers}
          />
        ) : (
        <div
          ref={tableSectionRef}
          id="records-table-section"
          className={`bg-white border rounded-2xl shadow-xs overflow-hidden scroll-mt-24 transition-all duration-300 relative ${
            tableHighlight
              ? selectedKpiFilter === 'violations'
                ? 'border-rose-500 ring-4 ring-rose-400/40 shadow-lg'
                : selectedKpiFilter === 'class2'
                ? 'border-amber-500 ring-4 ring-amber-400/40 shadow-lg'
                : selectedKpiFilter === 'area'
                ? 'border-emerald-500 ring-4 ring-emerald-400/40 shadow-lg'
                : 'border-blue-500 ring-4 ring-blue-400/40 shadow-lg'
              : 'border-slate-200/80'
          }`}
        >
          {/* Top Sleek Accent Indeterminate Progress Line */}
          <div className={`h-1 w-full bg-slate-100 overflow-hidden transition-opacity duration-200 ${loading ? 'opacity-100' : 'opacity-0'}`}>
            <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500 w-full animate-pulse" />
          </div>
          
          {/* Card Sub-Header & Table View Toggle */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  {activeTab === 'goshwara'
                    ? isMarathi
                      ? '१ ते ४६ मुद्द्यांचा जिल्हा, तालुका व गाव गोषवारा'
                      : '1 to 46 Checkpoint Audit Abstract & Rollup'
                    : activeTab === 'checklist'
                    ? isMarathi
                      ? 'महसूल अधिकार अभिलेख (७/१२) तपासणी सूची (१ ते ४६)'
                      : 'Record-of-Rights (7/12) Audit Checklist (1 to 46)'
                    : activeTab === 'prapatra5'
                    ? isMarathi
                      ? currentPrapatra5.nameMr
                      : currentPrapatra5.nameEn
                    : isMarathi
                    ? `प्रपत्र क्र. ${currentCategory.id}: ${currentCategory.nameMr}`
                    : `Booklet ${currentCategory.id}: ${currentCategory.nameEn}`}
                </h2>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-mono flex items-center gap-1.5 font-bold transition-all ${
                  loading
                    ? 'bg-amber-100 text-amber-900 border border-amber-300/80 shadow-2xs'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {loading ? (
                    <>
                      <RefreshCw className="w-3 h-3 text-amber-700 animate-spin" />
                      <span>{isMarathi ? 'डेटा अद्ययावत होत आहे...' : 'Updating data...'}</span>
                    </>
                  ) : (
                    activeTab === 'goshwara'
                      ? `${processedVillageRows.length + processedTalukaRows.length + processedDistrictRows.length} ${isMarathi ? 'गोषवारा नोंदी' : 'Summary Records'}`
                      : activeTab === 'categories' && activeView === 'categorySummary'
                      ? `${activeCategoryRollupCount} ${isMarathi ? 'गोषवारा नोंदी' : 'Summary Records'}`
                      : selectedKpiFilter !== 'all'
                      ? `${kpiFilteredParcels.length} / ${parcels.length} ${isMarathi ? 'अभिलेख (फिल्टर)' : 'Records (Filtered)'}`
                      : `${serverRollup?.districtTotal?.total712Count ?? parcels.length} ${isMarathi ? 'अभिलेख' : 'Records'}`
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatScopeText(activeScope, isMarathi) || (isMarathi ? 'चंद्रपूर जिल्हा कार्यक्षेत्र' : 'Chandrapur District Jurisdiction')}
              </p>
            </div>

            {/* View Mode Toggle Pill */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {activeTab === 'checklist' && (
                <div className="flex items-center bg-slate-200/80 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveView('timeline')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      activeView === 'timeline'
                        ? 'bg-blue-900 text-white shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <History className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isMarathi ? 'ऐतिहासिक कालक्रम व ४६ सूची' : 'Historical Timeline & 46 Points'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView('parcels')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      activeView === 'parcels'
                        ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TableProperties className="w-3.5 h-3.5" />
                    <span>{isMarathi ? 'संक्षिप्त ७/१२ यादी' : 'Compact 7/12 List'}</span>
                  </button>
                </div>
              )}

              {activeTab === 'prapatra5' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-emerald-950 rounded-lg text-xs font-bold shadow-2xs border border-emerald-300">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isMarathi ? 'सविस्तर प्रपत्र यादी' : 'Detailed Prapatra Register'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 font-mono font-bold">
                    {selectedKpiFilter !== 'all' ? `${kpiFilteredParcels.length} / ${parcels.length}` : parcels.length}
                  </span>
                </div>
              )}

              {activeTab === 'categories' && (
                <div className="flex items-center bg-slate-200/80 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveView('categorySummary')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      activeView === 'categorySummary'
                        ? 'bg-indigo-900 text-white shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-300" />
                    <span>{isMarathi ? 'गोषवारा (Rollup)' : 'Rollup Summary'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-950/60 text-white font-mono font-bold">
                      {activeCategoryRollupCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView('categoryData')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      activeView === 'categoryData' || activeView === 'parcels' || activeView === 'timeline'
                        ? 'bg-white text-indigo-950 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-700" />
                    <span>{isMarathi ? 'सविस्तर ७/१२ यादी' : 'Detailed 7/12 List'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-900 font-mono font-bold">
                      {selectedKpiFilter !== 'all' ? `${kpiFilteredParcels.length} / ${parcels.length}` : (serverRollup?.districtTotal?.total712Count ?? parcels.length)}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* =========================================================
              ACTIVE KPI FILTER NOTIFICATION BANNER
          ========================================================= */}
          {selectedKpiFilter !== 'all' && (
            <div className={`p-3 px-4 border-b flex flex-wrap items-center justify-between gap-2.5 text-xs transition-all duration-300 animate-in fade-in ${
              selectedKpiFilter === 'violations'
                ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                : selectedKpiFilter === 'class2'
                ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  selectedKpiFilter === 'violations' ? 'bg-rose-600 animate-ping' : selectedKpiFilter === 'class2' ? 'bg-amber-600 animate-ping' : 'bg-emerald-600 animate-ping'
                }`} />
                <span className="font-bold text-slate-800">
                  {isMarathi ? 'सक्रिय KPI फिल्टर:' : 'Active KPI Filter:'}
                </span>
                <span className={`px-2.5 py-1 rounded-lg font-bold text-xs shadow-2xs border inline-flex items-center gap-1.5 ${
                  selectedKpiFilter === 'violations'
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : selectedKpiFilter === 'class2'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                }`}>
                  {selectedKpiFilter === 'violations'
                    ? (isMarathi ? '⚠️ शर्तभंग / संशयित बाबी' : '⚠️ Breaches / Flagged Issues')
                    : selectedKpiFilter === 'class2'
                    ? (isMarathi ? '🏛️ भोगवटादार वर्ग २ / शासकीय' : '🏛️ Class-2 / Govt Land')
                    : (isMarathi ? '📐 एकूण क्षेत्रनिहाय (उतरत्या क्रमाने)' : '📐 Total Area (Ranked Highest First)')}
                </span>
                <span className="font-semibold text-slate-700">
                  {isMarathi
                    ? `(एकूण ${parcels.length} पैकी ${kpiFilteredParcels.length} अभिलेख दाखवत आहे)`
                    : `(Showing ${kpiFilteredParcels.length} of ${parcels.length} records)`}
                </span>
                <span className="text-[11px] text-slate-500 italic hidden sm:inline">
                  {selectedKpiFilter === 'violations'
                    ? (isMarathi ? '— विशेष चौकशी व शर्तभंग शेरा असलेले अभिलेख' : '— Condition breach & flagged inquiry records')
                    : selectedKpiFilter === 'class2'
                    ? (isMarathi ? '— वर्ग-२ व शासकीय सत्ताप्रकारातील जमिनी' : '— Restricted tenure & Govt land holdings')
                    : (isMarathi ? '— सर्वोच्च क्षेत्रफळ असलेले गट क्रमांक सर्वप्रथम' : '— Largest land parcel acreage first')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedKpiFilter('all'); setPage(1); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-700 hover:text-blue-900 hover:bg-slate-100 border border-slate-300 text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>{isMarathi ? 'सर्व अभिलेख दाखवा (फिल्टर रद्द)' : 'Show All Records (Clear)'}</span>
              </button>
            </div>
          )}

          {/* =========================================================
              VIEW LOGIC: PRAPATRA 1 TO 5 VS CATEGORIES VS MASTER CHECKLIST
          ========================================================= */}
          {activeTab === 'prapatra5' ? (
            /* =========================================================
                  PRAPATRA 1 TO 5 DETAILED PARCELS TABLE (SHEET 1 FORMAT)
              ========================================================= */
              <div>
                {/* Official Government Table Title Header Banner */}
                <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-b border-emerald-200/80 flex flex-col items-center text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-950 rounded-full text-xs font-bold mb-1 shadow-2xs border border-emerald-200">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      {isMarathi
                        ? `महाराष्ट्र शासन महसूल विभाग — ${currentPrapatra5.nameMr}`
                        : `Govt of Maharashtra Revenue Dept — ${currentPrapatra5.nameEn}`}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {isMarathi
                      ? `${currentPrapatra5.nameMr} — सविस्तर ७/१२ अभिलेख व खातेदार यादी`
                      : `${currentPrapatra5.nameEn} — Detailed 7/12 Land Records & Khatedar Registry`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isMarathi
                      ? `कार्यक्षेत्र: ${formatScopeText(activeScope, true)} | एकूण अभिलेख: ${selectedKpiFilter !== 'all' ? `${kpiFilteredParcels.length} (एकूण ${parcels.length} पैकी)` : (serverRollup?.districtTotal?.total712Count ?? parcels.length)} (डाऊनलोड एक्सेल बुकलेट - शीट १ नमुना)`
                      : `Scope: ${formatScopeText(activeScope, false)} | Total Records: ${selectedKpiFilter !== 'all' ? `${kpiFilteredParcels.length} (of ${parcels.length})` : (serverRollup?.districtTotal?.total712Count ?? parcels.length)} (Downloaded Booklet Sheet 1 Format)`}
                  </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border-b border-slate-200 bg-white relative" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <table className="w-full text-left border-collapse text-xs min-w-[1000px]">
                    <thead>
                      <tr className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-300 text-center">
                        <th className="py-2.5 px-2 border-r border-slate-200 w-12">{isMarathi ? 'अ.क्र.' : 'Sr.'}</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[110px]">{isMarathi ? 'तालुका' : 'Taluka'}</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[130px]">{isMarathi ? 'गाव' : 'Village'}</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 w-24">{isMarathi ? 'गट क्र.' : 'Gat No.'}</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 w-24">{isMarathi ? 'जुना स.नं.' : 'Old Survey'}</th>
                        <th className={`py-2.5 px-2 border-r border-slate-200 w-24 text-right transition ${selectedKpiFilter === 'area' ? 'bg-emerald-100/90 text-emerald-950 font-black ring-1 ring-emerald-400' : ''}`}>{isMarathi ? 'क्षेत्र (हे.)' : 'Area (Ha)'}</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[220px] bg-blue-50/60 text-blue-950 font-black">
                          {isMarathi ? 'सध्याचे खातेदार / भोगवटादाराचे नाव' : 'Current Khatedar / Occupant'}
                        </th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[180px] bg-amber-50/50 text-amber-950">
                          {isMarathi ? 'सन १९५० मधील मूळ नोंद / मालक' : '1950 Baseline Owner'}
                        </th>
                        <th className={`py-2.5 px-2 border-r border-slate-200 w-28 text-center transition ${selectedKpiFilter === 'class2' ? 'bg-amber-100/90 text-amber-950 font-black ring-1 ring-amber-400' : ''}`}>{isMarathi ? 'धारणा प्रकार' : 'Tenure'}</th>
                        <th className={`py-2.5 px-3 border-r border-slate-200 text-left min-w-[180px] transition ${selectedKpiFilter === 'violations' ? 'bg-rose-100/90 text-rose-950 font-black ring-1 ring-rose-400' : ''}`}>{isMarathi ? 'तपासणी निष्कर्ष / सद्यस्थिती' : 'Audit Finding'}</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[130px] font-mono">{isMarathi ? 'फेरफार / आदेश' : 'Order Ref'}</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[140px]">{isMarathi ? 'शेरा व इतर हक्क' : 'Remarks'}</th>
                        <th className="py-2.5 px-2 w-16 text-center">{isMarathi ? 'तपशील' : 'Details'}</th>
                      </tr>
                      <tr className="bg-slate-50 text-[10px] text-slate-400 text-center border-b border-slate-200">
                        <th className="py-1 border-r border-slate-200">१</th>
                        <th className="py-1 border-r border-slate-200">२</th>
                        <th className="py-1 border-r border-slate-200">३</th>
                        <th className="py-1 border-r border-slate-200">४</th>
                        <th className="py-1 border-r border-slate-200">५</th>
                        <th className="py-1 border-r border-slate-200">६</th>
                        <th className="py-1 border-r border-slate-200 bg-blue-50/40">७</th>
                        <th className="py-1 border-r border-slate-200 bg-amber-50/30">८</th>
                        <th className="py-1 border-r border-slate-200">९</th>
                        <th className="py-1 border-r border-slate-200">१०</th>
                        <th className="py-1 border-r border-slate-200">११</th>
                        <th className="py-1 border-r border-slate-200">१२</th>
                        <th className="py-1">-</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y divide-slate-100 transition-opacity duration-200 ${loading ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
                      {loading && paginatedParcels.length === 0 ? (
                        Array.from({ length: 8 }).map((_, sIdx) => (
                          <tr key={`skel-prapatra-data-${sIdx}`} className="animate-pulse border-b border-slate-100">
                            <td className="py-2.5 px-2 text-center border-r border-slate-100"><div className="h-4 w-6 bg-slate-200 rounded mx-auto" /></td>
                            <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-2 text-center border-r border-slate-100"><div className="h-4 w-12 bg-slate-200 rounded mx-auto" /></td>
                            <td className="py-2.5 px-2 text-center border-r border-slate-100"><div className="h-4 w-12 bg-slate-200 rounded mx-auto" /></td>
                            <td className="py-2.5 px-2 text-right border-r border-slate-100"><div className="h-4 w-10 bg-slate-200 rounded ml-auto" /></td>
                            <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-2 text-center border-r border-slate-100"><div className="h-5 w-16 bg-slate-200 rounded mx-auto" /></td>
                            <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-2 text-center"><div className="h-4 w-8 bg-slate-200 rounded mx-auto" /></td>
                          </tr>
                        ))
                      ) : paginatedParcels.length === 0 ? (
                        <tr>
                          <td colSpan={13} className="py-14 text-center">
                            <div className="max-w-md mx-auto flex flex-col items-center">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-2xs border ${
                                selectedKpiFilter === 'violations'
                                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                                  : selectedKpiFilter === 'class2'
                                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                <Filter className="w-6 h-6" />
                              </div>
                              <h4 className="text-sm font-bold text-slate-800 mb-1">
                                {selectedKpiFilter !== 'all'
                                  ? (isMarathi
                                      ? `${selectedKpiFilter === 'class2' ? 'भोगवटादार वर्ग २ / शासकीय' : selectedKpiFilter === 'violations' ? 'शर्तभंग / संशयित बाबी' : 'निवडलेल्या'} निकषात एकही नोंद नाही.`
                                      : 'No records match this KPI filter in current selection.')
                                  : (isMarathi ? 'सदर प्रपत्राकरिता कोणतेही ७/१२ अभिलेख आढळले नाहीत.' : 'No records found for this Prapatra.')}
                              </h4>
                              <p className="text-xs text-slate-500 mb-3.5">
                                {selectedKpiFilter !== 'all'
                                  ? (isMarathi
                                      ? 'निवडलेल्या गावात या विशिष्ट श्रेणीतील अभिलेख निरंक (०) आहेत.'
                                      : 'There are 0 matching records for this KPI filter.')
                                  : (isMarathi ? 'कृपया इतर गाव किंवा तालुका निवडून तपासा.' : 'Please try selecting a different scope.')}
                              </p>
                              {selectedKpiFilter !== 'all' && (
                                <button
                                  type="button"
                                  onClick={() => { setSelectedKpiFilter('all'); setPage(1); }}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition shadow-2xs cursor-pointer active:scale-95"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>{isMarathi ? 'सर्व अभिलेख दाखवा' : 'Show All Records'}</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedParcels.map((p, idx) => {
                          const hasAlert = p.statusFinding?.includes('शर्तभंग') || p.statusFinding?.includes('अवैध') || p.statusFinding?.includes('अतिक्रमण') || p.statusFinding?.includes('वगळण्यास शिल्लक');
                          return (
                            <tr key={p.id || idx} className={`hover:bg-slate-50/80 transition ${hasAlert ? 'bg-rose-50/20' : ''}`}>
                              <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-slate-600">
                                {p.excelSrNo || p.srNo || ((page - 1) * effectivePageSize + idx + 1)}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 text-slate-700 font-medium">
                                {formatTalukaName(p.taluka, isMarathi)}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">
                                {formatVillageName(p.villageName, isMarathi)}
                              </td>
                              <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-slate-800">
                                {p.gatNumber || '-'}
                              </td>
                              <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-slate-600">
                                {p.oldSurveyNo || '-'}
                              </td>
                              <td className="py-2 px-2 text-right border-r border-slate-200 font-mono font-bold text-slate-900">
                                {Number(p.totalAreaHa || 0).toFixed(4)}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 bg-blue-50/20 font-bold text-blue-950">
                                {p.currentOwner || (isMarathi ? 'नोंद उपलब्ध नाही' : 'No record available')}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 bg-amber-50/20 text-slate-700 font-medium">
                                {p.baselineOwner1950 || '-'}
                              </td>
                              <td className="py-2 px-2 text-center border-r border-slate-200">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  p.tenureClass === 'BHOGVATDAR_CLASS_1'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : p.tenureClass === 'BHOGVATDAR_CLASS_2'
                                    ? 'bg-amber-100 text-amber-900'
                                    : p.tenureClass === 'SARKAR_SHASAN'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {p.tenureDisplay || p.tenureClass || '-'}
                                </span>
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200">
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                  hasAlert
                                    ? 'bg-rose-100 text-rose-800 font-bold'
                                    : p.statusFinding?.includes('शासन जमा') || p.statusFinding?.includes('प्रमाणित')
                                    ? 'bg-emerald-100 text-emerald-800 font-bold'
                                    : p.statusFinding?.includes('पोकळीस्त')
                                    ? 'bg-amber-100 text-amber-900 font-bold'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {p.statusFinding || (isMarathi ? 'प्रमाणित' : 'Verified')}
                                </span>
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 font-mono text-[11px] text-slate-600">
                                {p.orderRef || '-'}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 text-slate-600 text-[11px] max-w-[220px]" title={p.remarks}>
                                {p.remarks || '-'}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  onClick={() => setInspectedParcel(p)}
                                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                                  title={isMarathi ? 'तपशील पहा' : 'View details'}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>

                  {loading && paginatedParcels.length > 0 && (
                    <div className="absolute inset-0 bg-white/30 backdrop-blur-[0.5px] z-30 flex items-center justify-center pointer-events-none animate-in fade-in duration-150">
                      <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-900/90 text-white text-xs font-bold rounded-2xl shadow-xl border border-white/20 backdrop-blur-md">
                        <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                        <span>{isMarathi ? 'नवीन डेटा अद्ययावत होत आहे...' : 'Updating records...'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {kpiFilteredParcels.length > 0 && (
                  <div className={`p-3.5 border-t border-slate-200 bg-slate-50/60 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Pagination
                      currentPage={page}
                      totalCount={kpiFilteredParcels.length}
                      pageSize={pageSize}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      onPageSizeChange={(newSize) => {
                        setPageSize(newSize);
                        setPage(1);
                      }}
                      pageSizeOptions={[25, 50, 100, 250, 'all']}
                      embedded={true}
                    />
                  </div>
                )}
              </div>
          ) : activeTab === 'categories' ? (
            activeView === 'categorySummary' ? (
              /* =========================================================
                  17 CATEGORY SUBJECT SUMMARY TABLE
              ========================================================= */
              <div className="space-y-4 p-3.5 sm:p-4">
                <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-50 via-blue-50/50 to-white border border-indigo-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Layers className="w-5 h-5 text-indigo-200" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                        {isMarathi ? currentCategory.nameMr : currentCategory.nameEn} — {isMarathi ? 'विषयनिहाय गोषवारा' : 'Subject Rollup'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isMarathi
                          ? '१ ते १८ विषयनिहाय वैधानिक वर्गीकरण — डाऊनलोड एक्सेल बुकलेट शीट २'
                          : '1 to 18 Subject Statutory Rollup — Downloaded Booklet Sheet 2'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-950 px-3 py-1 rounded-xl shrink-0">
                      {activeCategoryRollupCount} {isMarathi ? 'एकूण गोषवारा नोंदी' : 'Total Rollup Rows'}
                    </span>
                  </div>
                </div>

                {/* Tier Filter Quick Switcher Pills */}
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setCategoryGoshwaraTier('all')}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer',
                      categoryGoshwaraTier === 'all'
                        ? 'bg-slate-900 text-white shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                    )}
                  >
                    {isMarathi ? 'सर्व गोषवारा (गाव, तालुका, जिल्हा)' : 'All Rollups (Village, Taluka, District)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryGoshwaraTier('village')}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
                      categoryGoshwaraTier === 'village'
                        ? 'bg-slate-900 text-white shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                    )}
                  >
                    <span>{isMarathi ? 'गावाचा गोषवारा' : 'Village Goshwara'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-white font-mono">{categoryVillageRows.length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryGoshwaraTier('taluka')}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
                      categoryGoshwaraTier === 'taluka'
                        ? 'bg-slate-900 text-white shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                    )}
                  >
                    <span>{isMarathi ? 'तालुक्याचा गोषवारा' : 'Taluka Goshwara'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-white font-mono">{categoryTalukaRows.length}</span>
                  </button>
                  {(!village || village === 'all' || village === 'सर्व गावे') && categoryDistrictRows.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCategoryGoshwaraTier('district')}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
                        categoryGoshwaraTier === 'district'
                          ? 'bg-slate-900 text-white shadow-2xs font-extrabold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      )}
                    >
                      <span>{isMarathi ? 'जिल्हाचा गोषवारा' : 'District Goshwara'}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-white font-mono">{categoryDistrictRows.length}</span>
                    </button>
                  )}
                </div>

                {/* Render Strictly Formatted Goshwara Tables matching Image 2 */}
                {isTenancyCategory ? (
                  <div className="space-y-6">
                    {/* 1. गावाचा गोषवारा */}
                    {(categoryGoshwaraTier === 'all' || categoryGoshwaraTier === 'village') && categoryVillageRows.length > 0 && (
                      renderCategoryTenancyGoshwaraSection(isMarathi ? 'गावाचा गोषवारा' : 'Village Goshwara', isMarathi ? 'गावाचे नाव' : 'Village Name', categoryVillageRows, 'village')
                    )}
                    {categoryGoshwaraTier === 'village' && categoryVillageRows.length === 0 && (
                      <div className="py-12 px-4 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-200">
                          <Info className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {village && village !== 'all'
                            ? (isMarathi ? `निवडलेल्या '${formatVillageName(village, true)}' गावात या प्रपत्रांतर्गत एकही नोंद उपलब्ध नाही.` : `No records found for village '${formatVillageName(village, false)}' in this category.`)
                            : (isMarathi ? 'या कार्यक्षेत्रात गावनिहाय गोषवारा उपलब्ध नाही.' : 'No village rollup records available.')}
                        </h4>
                        {village && village !== 'all' && (
                          <button
                            type="button"
                            onClick={() => { setVillage('all'); }}
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition shadow-2xs cursor-pointer active:scale-95"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{isMarathi ? 'सर्व गावे निवडा' : 'Select All Villages'}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* 2. तालुक्याचा गोषवारा */}
                    {(categoryGoshwaraTier === 'all' || categoryGoshwaraTier === 'taluka') && categoryTalukaRows.length > 0 && (
                      renderCategoryTenancyGoshwaraSection(isMarathi ? 'तालुक्याचा गोषवारा' : 'Taluka Goshwara', isMarathi ? 'तालुक्याचे नाव' : 'Taluka Name', categoryTalukaRows, 'taluka')
                    )}
                    {categoryGoshwaraTier === 'taluka' && categoryTalukaRows.length === 0 && (
                      <div className="py-12 px-4 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2 border border-slate-200">
                          <Info className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">{isMarathi ? 'तालुक्याचा गोषवारा उपलब्ध नाही.' : 'No taluka rollup available.'}</h4>
                      </div>
                    )}

                    {/* 3. जिल्हाचा गोषवारा */}
                    {(categoryGoshwaraTier === 'all' || categoryGoshwaraTier === 'district') && categoryDistrictRows.length > 0 && (
                      renderCategoryTenancyGoshwaraSection(isMarathi ? 'जिल्हाचा गोषवारा' : 'District Goshwara', isMarathi ? 'जिल्हाचे नाव' : 'District Name', categoryDistrictRows, 'district')
                    )}
                    {categoryGoshwaraTier === 'district' && categoryDistrictRows.length === 0 && (
                      <div className="py-12 px-4 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2 border border-slate-200">
                          <Info className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {village && village !== 'all'
                            ? (isMarathi ? 'विशिष्ट गाव निवडलेले असताना जिल्हा गोषवारा लागू नाही.' : 'District rollup not applicable when specific village is filtered.')
                            : (isMarathi ? 'जिल्हा गोषवारा उपलब्ध नाही.' : 'No district rollup available.')}
                        </h4>
                      </div>
                    )}

                    {categoryVillageRows.length === 0 && categoryTalukaRows.length === 0 && categoryDistrictRows.length === 0 && (
                      <div className="py-16 text-center text-slate-400 border border-slate-200 rounded-xl bg-white shadow-2xs">
                        <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <span className="text-sm font-semibold">{isMarathi ? 'कोणतीही गोषवारा नोंद आढळली नाही.' : 'No summary records found.'}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 1. गावाचा गोषवारा */}
                    {(categoryGoshwaraTier === 'all' || categoryGoshwaraTier === 'village') && categoryVillageRows.length > 0 && (
                      renderCategoryGeneralGoshwaraSection(isMarathi ? 'गावाचा गोषवारा' : 'Village Goshwara', isMarathi ? 'गावाचे नाव' : 'Village Name', categoryVillageRows, 'village')
                    )}
                    {categoryGoshwaraTier === 'village' && categoryVillageRows.length === 0 && (
                      <div className="py-12 px-4 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-200">
                          <Info className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {village && village !== 'all'
                            ? (isMarathi ? `निवडलेल्या '${formatVillageName(village, true)}' गावात या प्रपत्रांतर्गत एकही नोंद उपलब्ध नाही.` : `No records found for village '${formatVillageName(village, false)}' in this category.`)
                            : (isMarathi ? 'या कार्यक्षेत्रात गावनिहाय गोषवारा उपलब्ध नाही.' : 'No village rollup records available.')}
                        </h4>
                        {village && village !== 'all' && (
                          <button
                            type="button"
                            onClick={() => { setVillage('all'); }}
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition shadow-2xs cursor-pointer active:scale-95"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{isMarathi ? 'सर्व गावे निवडा' : 'Select All Villages'}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* 2. तालुक्याचा गोषवारा */}
                    {(categoryGoshwaraTier === 'all' || categoryGoshwaraTier === 'taluka') && categoryTalukaRows.length > 0 && (
                      renderCategoryGeneralGoshwaraSection(isMarathi ? 'तालुक्याचा गोषवारा' : 'Taluka Goshwara', isMarathi ? 'तालुक्याचे नाव' : 'Taluka Name', categoryTalukaRows, 'taluka')
                    )}
                    {categoryGoshwaraTier === 'taluka' && categoryTalukaRows.length === 0 && (
                      <div className="py-12 px-4 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2 border border-slate-200">
                          <Info className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">{isMarathi ? 'तालुक्याचा गोषवारा उपलब्ध नाही.' : 'No taluka rollup available.'}</h4>
                      </div>
                    )}

                    {/* 3. जिल्हाचा गोषवारा */}
                    {(categoryGoshwaraTier === 'all' || categoryGoshwaraTier === 'district') && categoryDistrictRows.length > 0 && (
                      renderCategoryGeneralGoshwaraSection(isMarathi ? 'जिल्हाचा गोषवारा' : 'District Goshwara', isMarathi ? 'जिल्हाचे नाव' : 'District Name', categoryDistrictRows, 'district')
                    )}
                    {categoryGoshwaraTier === 'district' && categoryDistrictRows.length === 0 && (
                      <div className="py-12 px-4 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-2 border border-slate-200">
                          <Info className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {village && village !== 'all'
                            ? (isMarathi ? 'विशिष्ट गाव निवडलेले असताना जिल्हा गोषवारा लागू नाही.' : 'District rollup not applicable when specific village is filtered.')
                            : (isMarathi ? 'जिल्हा गोषवारा उपलब्ध नाही.' : 'No district rollup available.')}
                        </h4>
                      </div>
                    )}

                    {categoryVillageRows.length === 0 && categoryTalukaRows.length === 0 && categoryDistrictRows.length === 0 && (
                      <div className="py-16 text-center text-slate-400 border border-slate-200 rounded-xl bg-white shadow-2xs">
                        <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <span className="text-sm font-semibold">{isMarathi ? 'कोणतीही गोषवारा नोंद आढळली नाही.' : 'No summary records found.'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* =========================================================
                  17 CATEGORY DETAILED PARCELS TABLE
              ========================================================= */
              <div>
                <div className="p-3.5 sm:p-4 bg-gradient-to-r from-indigo-50 via-blue-50/50 to-white border-b border-indigo-200/80 flex flex-col items-center text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-950 rounded-full text-xs font-bold mb-1 shadow-2xs border border-indigo-200">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-700" />
                    <span>
                      {isMarathi
                        ? `महाराष्ट्र शासन महसूल विभाग — ${currentCategory.nameMr}`
                        : `Govt of Maharashtra Revenue Dept — ${currentCategory.nameEn}`}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    {isMarathi
                      ? `${currentCategory.nameMr} — सविस्तर ७/१२ अभिलेख व खातेदार यादी`
                      : `${currentCategory.nameEn} — Detailed 7/12 Land Records & Khatedar Registry`}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isMarathi
                      ? `कार्यक्षेत्र: ${formatScopeText(activeScope, true)} | एकूण अभिलेख: ${selectedKpiFilter !== 'all' ? `${kpiFilteredParcels.length} (एकूण ${parcels.length} पैकी)` : (serverRollup?.districtTotal?.total712Count ?? parcels.length)} (डाऊनलोड एक्सेल बुकलेट - शीट १ नमुना)`
                      : `Scope: ${formatScopeText(activeScope, false)} | Total Records: ${selectedKpiFilter !== 'all' ? `${kpiFilteredParcels.length} (of ${parcels.length})` : (serverRollup?.districtTotal?.total712Count ?? parcels.length)} (Downloaded Booklet Sheet 1 Format)`}
                  </p>
                </div>

                <div className="overflow-x-auto border-b border-slate-200 bg-white relative" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {isTenancyCategory ? (
                    <table className="w-full text-left border-collapse text-xs min-w-[1050px]">
                      <thead>
                        <tr className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-300 text-center">
                          <th className="py-2.5 px-2 border-r border-slate-200 w-12">{isMarathi ? 'अ.क्र.' : 'Sr.'}</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[140px]">{isMarathi ? 'गावाचे नाव' : 'Village Name'}</th>
                          <th className="py-2.5 px-2 border-r border-slate-200 w-28">{isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.'}</th>
                          <th className="py-2.5 px-2 border-r border-slate-200 w-24 text-right">{isMarathi ? 'क्षेत्र (हे.आर.)' : 'Area (Ha)'}</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[200px] bg-blue-50/60 text-blue-950 font-black">{isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name'}</th>
                          <th className="py-2.5 px-2 border-r border-slate-200 w-28 text-center">{isMarathi ? 'भोगवटदार वर्ग' : 'Occupant Class'}</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-center min-w-[150px] bg-emerald-50/60 text-emerald-950 font-bold">{isMarathi ? 'कंपनीने धारण करताना परवानगी घेतलेली आहे काय?' : 'Company Holding Permission Taken?'}</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-center min-w-[150px] bg-amber-50/60 text-amber-950 font-bold">{isMarathi ? 'वापराबाबत शर्तभंग झालेला आहे काय?' : 'Usage Condition Breach Occurred?'}</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-center min-w-[150px] bg-rose-50/60 text-rose-950 font-bold">{isMarathi ? 'हस्तांतरणाबाबत शर्तभंग आहे काय?' : 'Transfer Condition Breach?'}</th>
                          <th className="py-2.5 px-3 border-r border-slate-200 text-center min-w-[140px] bg-indigo-50/60 text-indigo-950 font-bold">{isMarathi ? 'इतर अधिकारात नोंद घेतलेली आहे काय?' : 'Recorded in Other Rights?'}</th>
                          <th className="py-2.5 px-2 w-16 text-center">{isMarathi ? 'तपशील' : 'Details'}</th>
                        </tr>
                        <tr className="bg-slate-50 text-[10px] text-slate-400 text-center border-b border-slate-200">
                          <th className="py-1 border-r border-slate-200">१</th>
                          <th className="py-1 border-r border-slate-200">२</th>
                          <th className="py-1 border-r border-slate-200">३</th>
                          <th className="py-1 border-r border-slate-200">४</th>
                          <th className="py-1 border-r border-slate-200 bg-blue-50/40">५</th>
                          <th className="py-1 border-r border-slate-200">६</th>
                          <th className="py-1 border-r border-slate-200 bg-emerald-50/30">७</th>
                          <th className="py-1 border-r border-slate-200 bg-amber-50/30">८</th>
                          <th className="py-1 border-r border-slate-200 bg-rose-50/30">९</th>
                          <th className="py-1 border-r border-slate-200 bg-indigo-50/30">१०</th>
                          <th className="py-1">-</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y divide-slate-100 font-sans transition-opacity duration-200 ${loading ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
                        {loading && paginatedParcels.length === 0 ? (
                          Array.from({ length: 8 }).map((_, sIdx) => (
                            <tr key={`skel-cat18-data-${sIdx}`} className="animate-pulse border-b border-slate-100">
                              <td className="py-2.5 px-2 text-center border-r border-slate-100"><div className="h-4 w-6 bg-slate-200 rounded mx-auto" /></td>
                              <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                              <td className="py-2.5 px-2 text-center border-r border-slate-100"><div className="h-4 w-12 bg-slate-200 rounded mx-auto" /></td>
                              <td className="py-2.5 px-2 text-right border-r border-slate-100"><div className="h-4 w-10 bg-slate-200 rounded ml-auto" /></td>
                              <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                              <td className="py-2.5 px-2 text-center border-r border-slate-100"><div className="h-5 w-16 bg-slate-200 rounded mx-auto" /></td>
                              <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-16 bg-slate-200 rounded mx-auto" /></td>
                              <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-16 bg-slate-200 rounded mx-auto" /></td>
                              <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-16 bg-slate-200 rounded mx-auto" /></td>
                              <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-16 bg-slate-200 rounded mx-auto" /></td>
                              <td className="py-2.5 px-2 text-center"><div className="h-4 w-8 bg-slate-200 rounded mx-auto" /></td>
                            </tr>
                          ))
                        ) : paginatedParcels.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="py-14 text-center">
                              <div className="max-w-md mx-auto flex flex-col items-center">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-2xs border bg-slate-100 text-slate-500 border-slate-200">
                                  <Filter className="w-6 h-6" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 mb-1">
                                  {isMarathi ? 'कुळ कायदा कलम ८९ व ४७ अंतर्गत कोणतेही ७/१२ अभिलेख आढळले नाहीत.' : 'No records found for Tenancy Act Sec 89 & 47.'}
                                </h4>
                                <p className="text-xs text-slate-500 mb-3.5">
                                  {isMarathi ? 'कृपया इतर गाव किंवा तालुका निवडून तपासा.' : 'Please try selecting a different scope.'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedParcels.map((p, idx) => {
                            const hasPermit = p.auditPoints?.point_41 === 'होय' || p.tenancy89ARecords?.[0]?.isGenuineIndustrialUse || p.metadata?.auditPoints?.point_41 === 'होय';
                            const usageBreach = p.metadata?.auditPoints?.point_44 === 'नाही' || p.metadata?.auditPoints?.point_45_usage === 'होय' || (p.forwardCases?.some(fc => fc.violationType === 'UNAUTHORIZED_NA_CONVERSION'));
                            const transferBreach = p.metadata?.auditPoints?.point_45_transfer === 'होय' || p.tenancy89ARecords?.[0]?.unauthorizedTransfer || (p.forwardCases?.some(fc => fc.violationType === 'SHARTBHANG' || fc.violationType === 'TRIBAL_LAND_VIOLATION'));
                            const otherRightsNoted = p.auditPoints?.point_39 === 'होय' || (p.metadata?.otherRights && p.metadata?.otherRights !== '-' && p.metadata?.otherRights !== '....');

                            return (
                              <tr key={p.id || idx} className={`hover:bg-slate-50/80 transition ${usageBreach || transferBreach ? 'bg-rose-50/25' : ''}`}>
                                <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-slate-600">
                                  {p.excelSrNo || p.srNo || ((page - 1) * effectivePageSize + idx + 1)}
                                </td>
                                <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">{formatVillageName(p.villageName, isMarathi)}</td>
                                <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-slate-800">{p.gatNumber || p.oldSurveyNo || '-'}</td>
                                <td className="py-2 px-2 text-right border-r border-slate-200 font-mono font-bold text-slate-900">{Number(p.totalAreaHa || 0).toFixed(4)}</td>
                                <td className="py-2 px-3 border-r border-slate-200 bg-blue-50/20 font-bold text-blue-950">{p.currentOwner || (isMarathi ? 'नोंद उपलब्ध नाही' : 'No record available')}</td>
                                <td className="py-2 px-2 text-center border-r border-slate-200">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900 font-black'
                                  }`}>
                                    {p.tenureDisplay || (p.tenureClass === 'BHOGVATDAR_CLASS_1' ? 'वर्ग १' : 'वर्ग २')}
                                  </span>
                                </td>
                                <td className="py-2 px-3 border-r border-slate-200 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                    hasPermit ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                                  }`}>
                                    {hasPermit ? (isMarathi ? 'होय' : 'Yes') : (isMarathi ? 'नाही' : 'No')}
                                  </span>
                                </td>
                                <td className="py-2 px-3 border-r border-slate-200 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                    usageBreach ? 'bg-rose-100 text-rose-800 shadow-2xs' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {usageBreach ? (isMarathi ? 'होय' : 'Yes') : (isMarathi ? 'नाही' : 'No')}
                                  </span>
                                </td>
                                <td className="py-2 px-3 border-r border-slate-200 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                    transferBreach ? 'bg-red-100 text-red-800 shadow-2xs' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {transferBreach ? (isMarathi ? 'होय' : 'Yes') : (isMarathi ? 'नाही' : 'No')}
                                  </span>
                                </td>
                                <td className="py-2 px-3 border-r border-slate-200 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                    otherRightsNoted ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-500'
                                  }`}>
                                    {otherRightsNoted ? (isMarathi ? 'होय' : 'Yes') : (isMarathi ? 'नाही' : 'No')}
                                  </span>
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <button
                                    onClick={() => setInspectedParcel(p)}
                                    className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                                    title={isMarathi ? 'तपशील पहा' : 'View details'}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  ) : (
                  <table className="w-full text-left border-collapse text-xs min-w-[1000px]">
                    <thead>
                      <tr className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-300 text-center">
                        <th className="py-2.5 px-2 border-r border-slate-200 w-12">{isMarathi ? 'अ.क्र.' : 'Sr.'}</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[110px]">{isMarathi ? 'तालुका' : 'Taluka'}</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[130px]">{isMarathi ? 'गाव' : 'Village'}</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 w-24">{isMarathi ? 'गट क्र.' : 'Gat No.'}</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 w-24">{isMarathi ? 'जुना स.नं.' : 'Old Survey'}</th>
                        <th className={`py-2.5 px-2 border-r border-slate-200 w-24 text-right transition ${selectedKpiFilter === 'area' ? 'bg-emerald-100/90 text-emerald-950 font-black ring-1 ring-emerald-400' : ''}`}>{isMarathi ? 'क्षेत्र (हे.)' : 'Area (Ha)'}</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[220px] bg-blue-50/60 text-blue-950 font-black">
                          {isMarathi ? 'सध्याचे खातेदार / भोगवटादाराचे नाव' : 'Current Khatedar / Occupant'}
                        </th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[180px] bg-amber-50/50 text-amber-950">
                          {isMarathi ? 'सन १९५० मधील मूळ नोंद / मालक' : '1950 Baseline Owner'}
                        </th>
                        <th className={`py-2.5 px-2 border-r border-slate-200 w-28 text-center transition ${selectedKpiFilter === 'class2' ? 'bg-amber-100/90 text-amber-950 font-black ring-1 ring-amber-400' : ''}`}>{isMarathi ? 'धारणा प्रकार' : 'Tenure'}</th>
                        <th className={`py-2.5 px-3 border-r border-slate-200 text-left min-w-[180px] transition ${selectedKpiFilter === 'violations' ? 'bg-rose-100/90 text-rose-950 font-black ring-1 ring-rose-400' : ''}`}>{isMarathi ? 'तपासणी निष्कर्ष / सद्यस्थिती' : 'Audit Finding'}</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[130px] font-mono">{isMarathi ? 'फेरफार / आदेश' : 'Order Ref'}</th>
                        <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[140px]">{isMarathi ? 'शेरा व इतर हक्क' : 'Remarks'}</th>
                        <th className="py-2.5 px-2 w-16 text-center">{isMarathi ? 'तपशील' : 'Details'}</th>
                      </tr>
                      <tr className="bg-slate-50 text-[10px] text-slate-400 text-center border-b border-slate-200">
                        <th className="py-1 border-r border-slate-200">१</th>
                        <th className="py-1 border-r border-slate-200">२</th>
                        <th className="py-1 border-r border-slate-200">३</th>
                        <th className="py-1 border-r border-slate-200">४</th>
                        <th className="py-1 border-r border-slate-200">५</th>
                        <th className="py-1 border-r border-slate-200">६</th>
                        <th className="py-1 border-r border-slate-200 bg-blue-50/40">७</th>
                        <th className="py-1 border-r border-slate-200 bg-amber-50/30">८</th>
                        <th className="py-1 border-r border-slate-200">९</th>
                        <th className="py-1 border-r border-slate-200">१०</th>
                        <th className="py-1 border-r border-slate-200">११</th>
                        <th className="py-1 border-r border-slate-200">१२</th>
                        <th className="py-1">-</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y divide-slate-100 transition-opacity duration-200 ${loading ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
                      {loading && paginatedParcels.length === 0 ? (
                        Array.from({ length: 8 }).map((_, sIdx) => (
                          <tr key={`skel-cat-data-${sIdx}`} className="animate-pulse border-b border-slate-100">
                            <td className="py-2.5 px-2 text-center border-r border-slate-100"><div className="h-4 w-6 bg-slate-200 rounded mx-auto" /></td>
                            <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-2 text-center border-r border-slate-100"><div className="h-4 w-12 bg-slate-200 rounded mx-auto" /></td>
                            <td className="py-2.5 px-2 text-center border-r border-slate-100"><div className="h-4 w-12 bg-slate-200 rounded mx-auto" /></td>
                            <td className="py-2.5 px-2 text-right border-r border-slate-100"><div className="h-4 w-10 bg-slate-200 rounded ml-auto" /></td>
                            <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-2 text-center border-r border-slate-100"><div className="h-5 w-16 bg-slate-200 rounded mx-auto" /></td>
                            <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                            <td className="py-2.5 px-2 text-center"><div className="h-4 w-8 bg-slate-200 rounded mx-auto" /></td>
                          </tr>
                        ))
                      ) : paginatedParcels.length === 0 ? (
                        <tr>
                          <td colSpan={13} className="py-14 text-center">
                            <div className="max-w-md mx-auto flex flex-col items-center">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-2xs border ${
                                selectedKpiFilter === 'violations'
                                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                                  : selectedKpiFilter === 'class2'
                                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                <Filter className="w-6 h-6" />
                              </div>
                              <h4 className="text-sm font-bold text-slate-800 mb-1">
                                {selectedKpiFilter !== 'all'
                                  ? (isMarathi
                                      ? `${selectedKpiFilter === 'class2' ? 'भोगवटादार वर्ग २ / शासकीय' : selectedKpiFilter === 'violations' ? 'शर्तभंग / संशयित बाबी' : 'निवडलेल्या'} निकषात एकही नोंद नाही.`
                                      : 'No records match this KPI filter in current selection.')
                                  : (isMarathi ? 'सदर विषयाकरिता कोणतेही ७/१२ अभिलेख आढळले नाहीत.' : 'No records found for this category.')}
                              </h4>
                              <p className="text-xs text-slate-500 mb-3.5">
                                {selectedKpiFilter !== 'all'
                                  ? (isMarathi
                                      ? 'निवडलेल्या गावात या विशिष्ट श्रेणीतील अभिलेख निरंक (०) आहेत.'
                                      : 'There are 0 matching records for this KPI filter.')
                                  : (isMarathi ? 'कृपया इतर गाव किंवा तालुका निवडून तपासा.' : 'Please try selecting a different scope.')}
                              </p>
                              {selectedKpiFilter !== 'all' && (
                                <button
                                  type="button"
                                  onClick={() => { setSelectedKpiFilter('all'); setPage(1); }}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition shadow-2xs cursor-pointer active:scale-95"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>{isMarathi ? 'सर्व अभिलेख दाखवा' : 'Show All Records'}</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedParcels.map((p, idx) => {
                          const hasAlert = p.statusFinding?.includes('शर्तभंग') || p.statusFinding?.includes('अवैध') || p.statusFinding?.includes('अतिक्रमण');
                          return (
                            <tr key={p.id || idx} className={`hover:bg-slate-50/80 transition ${hasAlert ? 'bg-rose-50/20' : ''}`}>
                              <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-slate-600">
                                {p.excelSrNo || p.srNo || ((page - 1) * effectivePageSize + idx + 1)}
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 text-slate-700 font-medium">{formatTalukaName(p.taluka, isMarathi)}</td>
                              <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">{formatVillageName(p.villageName, isMarathi)}</td>
                              <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-slate-800">{p.gatNumber || '-'}</td>
                              <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-slate-600">{p.oldSurveyNo || '-'}</td>
                              <td className={`py-2 px-2 text-right border-r border-slate-200 font-mono font-bold transition ${selectedKpiFilter === 'area' ? 'bg-emerald-50 text-emerald-950 font-black ring-1 ring-inset ring-emerald-300' : 'text-slate-900'}`}>{Number(p.totalAreaHa || 0).toFixed(4)}</td>
                              <td className="py-2 px-3 border-r border-slate-200 bg-blue-50/20 font-bold text-blue-950">{p.currentOwner || (isMarathi ? 'नोंद उपलब्ध नाही' : 'No record available')}</td>
                              <td className="py-2 px-3 border-r border-slate-200 bg-amber-50/20 text-slate-700 font-medium">{p.baselineOwner1950 || '-'}</td>
                              <td className={`py-2 px-2 text-center border-r border-slate-200 transition ${selectedKpiFilter === 'class2' ? 'bg-amber-50/80 ring-1 ring-inset ring-amber-300' : ''}`}>
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  p.tenureClass === 'BHOGVATDAR_CLASS_1'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : p.tenureClass === 'BHOGVATDAR_CLASS_2'
                                    ? 'bg-amber-100 text-amber-900 font-black'
                                    : p.tenureClass === 'SARKAR_SHASAN'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {p.tenureDisplay || p.tenureClass || '-'}
                                </span>
                              </td>
                              <td className={`py-2 px-3 border-r border-slate-200 transition ${selectedKpiFilter === 'violations' ? 'bg-rose-50/80 ring-1 ring-inset ring-rose-300' : ''}`}>
                                <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                  hasAlert ? 'bg-rose-100 text-rose-800 font-bold shadow-2xs' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {p.statusFinding || (isMarathi ? 'प्रमाणित' : 'Verified')}
                                </span>
                              </td>
                              <td className="py-2 px-3 border-r border-slate-200 font-mono text-[11px] text-slate-600">{p.orderRef || '-'}</td>
                              <td className="py-2 px-3 border-r border-slate-200 text-slate-600 text-[11px] max-w-[220px]" title={p.remarks}>{p.remarks || '-'}</td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  onClick={() => setInspectedParcel(p)}
                                  className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                                  title={isMarathi ? 'तपशील पहा' : 'View details'}
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                  )}

                  {loading && paginatedParcels.length > 0 && (
                    <div className="absolute inset-0 bg-white/30 backdrop-blur-[0.5px] z-30 flex items-center justify-center pointer-events-none animate-in fade-in duration-150">
                      <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-900/90 text-white text-xs font-bold rounded-2xl shadow-xl border border-white/20 backdrop-blur-md">
                        <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                        <span>{isMarathi ? 'नवीन डेटा अद्ययावत होत आहे...' : 'Updating records...'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {kpiFilteredParcels.length > 0 && (
                  <div className={`p-3.5 border-t border-slate-200 bg-slate-50/60 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Pagination
                      currentPage={page}
                      totalCount={kpiFilteredParcels.length}
                      pageSize={pageSize}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      onPageSizeChange={(newSize) => {
                        setPageSize(newSize);
                        setPage(1);
                      }}
                      pageSizeOptions={[25, 50, 100, 250, 'all']}
                      embedded={true}
                    />
                  </div>
                )}
              </div>
            )
          ) : (
            /* =========================================================
                TAB 1: 1 TO 46 MASTER CHECKLIST AUDIT (TIMELINE OR PARCELS)
            ========================================================= */
            activeView === 'timeline' ? (
            <div>
              {/* Official Government Table Title Header Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-50 via-blue-50/50 to-indigo-50 border-b border-slate-200 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold mb-1 shadow-2xs border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>
                    {isMarathi
                      ? 'महाराष्ट्र शासन महसूल विभाग — ऐतिहासिक भू-अभिलेख कालक्रम पडताळणी'
                      : 'Govt of Maharashtra Revenue Dept — Historical Land Records Audit'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {isMarathi
                    ? 'महसूल अधिकार अभिलेखातील (7/12) ची तपासणी सुची'
                    : 'Record-of-Rights (7/12) Verification Checklist'}
                </h3>
               
                <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-600 mt-2">
                  <span className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    <span className="font-semibold text-amber-950">
                      {isMarathi
                        ? 'रकाने १ ते ९: रिनंबरींग पर्चा (बंदोबस्त १९५० / एकत्रिकरण १९७२ / पुनर्मोजणी १९९५)'
                        : 'Columns 1-9: Renumbering slip (Settlement 1950 / Consolidation 1972 / Resurvey 1995)'}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                    <span className="font-semibold text-rose-950">
                      {isMarathi
                        ? 'रकाने १० ते १९: भोगवटदार सरकार / महाराष्ट्र शासन असल्यास'
                        : 'Columns 10-19: Occupant: Government / Maharashtra State'}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                    <span className="font-semibold text-blue-950">
                      {isMarathi
                        ? 'रकाने २० ते ४६: वैधानिक कायदे व पडताळणी रकाने'
                        : 'Columns 20-46: Statutory acts & audit verification checkpoints'}
                    </span>
                  </span>
                </div>
            
              </div>

              {/* Horizontal Scroll Table */}
              <div className="relative">
                <div className="overflow-x-auto max-h-[70vh] border-b border-slate-300 bg-white">
                <table className="w-full text-left border-collapse text-[11px] whitespace-nowrap">
                  <thead className="sticky top-0 z-30 bg-white shadow-md isolate">
                    {/* Level 1: Major Group Headers */}
                    <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300 text-center">
                      <th colSpan={7} className="py-2.5 px-2 border-r border-slate-300 bg-slate-200 text-slate-900 font-black">
                        {isMarathi ? 'मूलभूत ७/१२ तपशील' : 'Baseline 7/12 Details'}
                      </th>
                      <th colSpan={3} className="py-2.5 px-2 border-r border-amber-300 bg-amber-200 text-amber-950 font-black text-center shadow-xs">
                        <div className="text-xs font-black tracking-wide">
                          {isMarathi ? '१. बंदोबस्त नोंद (१९५०)' : '1. Settlement Record (1950)'}
                        </div>
                        <div className="text-[9px] font-semibold text-amber-900">
                          {isMarathi ? 'सदर गट क्रमांकाचा रिनंबरींग पर्चाप्रमाणे' : 'Renumbering Slip Sequence'}
                        </div>
                      </th>
                      <th colSpan={3} className="py-2.5 px-2 border-r border-amber-300 bg-amber-100 text-amber-950 font-black text-center shadow-xs">
                        <div className="text-xs font-black tracking-wide">
                          {isMarathi ? '२. एकत्रिकरण नोंद (१९७२)' : '2. Consolidation Record (1972)'}
                        </div>
                        <div className="text-[9px] font-semibold text-amber-900">
                          {isMarathi ? 'सदर गट क्रमांकाचा रिनंबरींग पर्चाप्रमाणे' : 'Renumbering Slip Sequence'}
                        </div>
                      </th>
                      <th colSpan={3} className="py-2.5 px-2 border-r border-amber-300 bg-amber-50 text-amber-950 font-black text-center shadow-xs">
                        <div className="text-xs font-black tracking-wide">
                          {isMarathi ? '३. पुनर्मोजणी नोंद (१९९५)' : '3. Resurvey 7/12 Record (1995)'}
                        </div>
                        <div className="text-[9px] font-semibold text-amber-900">
                          {isMarathi ? 'सदर गट क्रमांकाचा रिनंबरींग पर्चाप्रमाणे' : 'Renumbering Slip Sequence'}
                        </div>
                      </th>
                      <th colSpan={10} className="py-2.5 px-2 border-r border-rose-300 bg-rose-100 text-rose-950 font-black">
                        {isMarathi ? 'भोगवटदार सरकार / महाराष्ट्र शासन असल्यास' : 'Occupant: Government / Maharashtra State'}
                      </th>
                      <th colSpan={27} className="py-2.5 px-2 border-r border-blue-300 bg-blue-100 text-blue-950 font-black">
                        {isMarathi
                          ? 'वैधानिक कायदे व पडताळणी रकाने (कुळ, वतन, आदिवासी, कमाल मर्यादा व इतर)'
                          : 'Statutory Acts & Verification (Tenancy, Inam, Tribal, Ceiling, etc.)'}
                      </th>
                      <th className="py-2.5 px-2 bg-slate-200 text-slate-900 font-bold">{isMarathi ? 'कालक्रम' : 'Timeline'}</th>
                    </tr>

                    {/* Level 2: Specific Column Titles */}
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-center">
                      <th className="py-2 px-2 border-r border-slate-300 w-12 bg-slate-100">{isMarathi ? 'अ.क्र.' : 'Sr.'}</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-left min-w-[120px] bg-slate-100">{isMarathi ? 'गावाचे नाव' : 'Village Name'}</th>
                      <th className="py-2 px-2 border-r border-slate-300 w-24 bg-slate-100">{isMarathi ? 'सर्व्हे क्रमांक' : 'Survey No.'}</th>
                      <th className={`py-2 px-2 border-r border-slate-300 w-20 text-right transition-colors ${
                        selectedKpiFilter === 'area' ? 'bg-emerald-200 text-emerald-950 font-black ring-1 ring-emerald-500' : 'bg-slate-100'
                      }`}>
                        {isMarathi ? 'क्षेत्र' : 'Area'}
                      </th>
                      <th className={`py-2 px-2 border-r border-slate-300 w-28 transition-colors ${
                        selectedKpiFilter === 'class2' ? 'bg-amber-200 text-amber-950 font-black ring-1 ring-amber-500' : 'bg-slate-100'
                      }`}>
                        {isMarathi ? (
                          <>भोगवटदार वर्ग<br /><span className="text-[9px] font-normal text-slate-500">(भूधारणा नुसार)</span></>
                        ) : (
                          <>Tenure Class<br /><span className="text-[9px] font-normal text-slate-500">(By Holding)</span></>
                        )}
                      </th>
                      <th className="py-2 px-3 border-r border-slate-300 text-left min-w-[180px] bg-blue-100 text-blue-950 font-black">
                        {isMarathi ? 'भोगवटदाराचे नाव' : 'Occupant Name'}
                      </th>
                      <th className="py-2 px-3 border-r border-slate-300 text-left min-w-[180px] bg-slate-100">
                        {isMarathi ? (
                          <>इतर अधिकारातील नोंद <br /><span className="text-[9px] font-normal text-slate-500">(जी नोंद सदर 7/12 चे इतर अधिकारात असेल, तीच नोंद इथे नमूद करावी. उदा.आदिवासी/कुळ इ.)</span></>
                        ) : (
                          <>Other Rights Entry<br /><span className="text-[9px] font-normal text-slate-500">(Tribal/Tenant etc.)</span></>
                        )}
                      </th>

                      {/* 1 to 46 Columns */}
                      {CHECKLIST_46_COLUMNS.map(col => (
                        <th
                          key={col.num}
                          className={`py-2 px-2.5 border-r border-slate-200 ${col.minW} text-left text-[10px] leading-tight font-bold ${
                            col.group === 'renumbering'
                              ? 'bg-amber-50 text-amber-950'
                              : col.group === 'govt'
                              ? 'bg-rose-50 text-rose-950'
                              : 'bg-slate-50 text-slate-800'
                          }`}
                          title={isMarathi ? col.title : (col.titleEn || col.title)}
                        >
                          <div className="line-clamp-2">{isMarathi ? col.title : (col.titleEn || col.title)}</div>
                        </th>
                      ))}
                      <th className="py-2 px-2 w-16 text-center bg-slate-100 text-slate-800 font-bold">{isMarathi ? 'तपशील' : 'Details'}</th>
                    </tr>

                    {/* Level 3: Official Row Numbering */}
                    <tr className="bg-slate-200 text-[10px] text-slate-600 text-center border-b-2 border-slate-400 font-mono shadow-[0_2px_4px_rgba(0,0,0,0.06)]">
                      <th className="py-1 border-r border-slate-300 bg-slate-200">{isMarathi ? 'अ.क्र.' : 'Sr.'}</th>
                      <th className="py-1 border-r border-slate-300 bg-slate-200">{isMarathi ? 'गाव' : 'Village'}</th>
                      <th className="py-1 border-r border-slate-300 bg-slate-200">{isMarathi ? 'सर्व्हे' : 'Survey'}</th>
                      <th className="py-1 border-r border-slate-300 bg-slate-200">{isMarathi ? 'क्षेत्र' : 'Area'}</th>
                      <th className="py-1 border-r border-slate-300 bg-slate-200">{isMarathi ? 'वर्ग' : 'Class'}</th>
                      <th className="py-1 border-r border-slate-300 bg-slate-200">{isMarathi ? 'नाव' : 'Name'}</th>
                      <th className="py-1 border-r border-slate-300 bg-slate-200">{isMarathi ? 'इतर हक्क' : 'Other'}</th>
                      {CHECKLIST_46_COLUMNS.map(col => (
                        <th
                          key={col.num}
                          className={`py-1 border-r border-slate-200 ${
                            col.group === 'renumbering'
                              ? 'bg-amber-200 text-amber-950 font-bold'
                              : col.group === 'govt'
                              ? 'bg-rose-200 text-rose-950 font-bold'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {col.num}
                        </th>
                      ))}
                      <th className="py-1 bg-slate-200 text-slate-500">-</th>
                    </tr>
                  </thead>

                  <tbody className={`divide-y divide-slate-100 font-sans transition-opacity duration-200 ${loading ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
                    {loading && paginatedParcels.length === 0 ? (
                      <tr>
                        <td colSpan={54} className="py-20 text-center">
                          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                          <span className="text-xs text-slate-500 font-semibold">{isMarathi ? 'डेटा लोड होत आहे...' : 'Loading data...'}</span>
                        </td>
                      </tr>
                    ) : paginatedParcels.length === 0 ? (
                      <tr>
                        <td colSpan={54} className="py-16 text-center">
                          <div className="max-w-md mx-auto flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-2xs border ${
                              selectedKpiFilter === 'violations'
                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                : selectedKpiFilter === 'class2'
                                ? 'bg-amber-50 text-amber-600 border-amber-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              <Filter className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 mb-1">
                              {selectedKpiFilter !== 'all'
                                ? (isMarathi
                                    ? `${selectedKpiFilter === 'class2' ? 'भोगवटादार वर्ग २ / शासकीय' : selectedKpiFilter === 'violations' ? 'शर्तभंग / संशयित बाबी' : 'निवडलेल्या'} निकषात एकही नोंद नाही.`
                                    : 'No records match this KPI filter in current selection.')
                                : (isMarathi ? 'निवडलेल्या निकषांनुसार कोणतेही अभिलेख आढळले नाहीत.' : 'No records found matching selected criteria.')}
                            </h4>
                            <p className="text-xs text-slate-500 mb-3.5">
                              {selectedKpiFilter !== 'all'
                                ? (isMarathi
                                    ? 'निवडलेल्या गावात या विशिष्ट श्रेणीतील अभिलेख निरंक (०) आहेत.'
                                    : 'There are 0 matching records for this KPI filter.')
                                : (isMarathi ? 'कृपया इतर निकष निवडून तपासा.' : 'Please try different filter options.')}
                            </p>
                            {selectedKpiFilter !== 'all' && (
                              <button
                                type="button"
                                onClick={() => { setSelectedKpiFilter('all'); setPage(1); }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition shadow-2xs cursor-pointer active:scale-95"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>{isMarathi ? 'सर्व अभिलेख दाखवा' : 'Show All Records'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedParcels.map((p, idx) => {
                        const pts = p.points || {};
                        const hasViolation =
                          p.statusFinding?.includes('शर्तभंग') ||
                          p.statusFinding?.includes('अवैध') ||
                          pts[36]?.includes('होय') ||
                          pts[37] === 'होय';

                        return (
                          <tr
                            key={p.id || idx}
                            className={`hover:bg-blue-50/30 transition ${
                              hasViolation ? 'bg-rose-50/20' : ''
                            }`}
                          >
                            <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-slate-700 font-medium" title={`Excel Sr: ${p.excelSrNo || p.srNo}`}>
                              {p.excelSrNo || p.srNo || ((page - 1) * effectivePageSize + idx + 1)}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">
                              {formatVillageName(p.villageName, isMarathi)}
                              <span className="block text-[9px] text-slate-400">{formatTalukaName(p.taluka, isMarathi)}</span>
                            </td>
                            <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-slate-800">
                              {p.gatNumber || p.oldSurveyNo || '-'}
                            </td>
                            <td className={`py-2 px-2 text-right border-r border-slate-200 font-mono font-bold transition ${selectedKpiFilter === 'area' ? 'bg-emerald-50 text-emerald-950 font-black ring-1 ring-inset ring-emerald-300' : 'font-medium'}`}>
                              {p.totalAreaHa}
                            </td>
                            <td className={`py-2 px-2 text-center border-r border-slate-200 transition ${selectedKpiFilter === 'class2' ? 'bg-amber-50/80 ring-1 ring-inset ring-amber-300' : ''}`}>
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  p.tenureClass === 'BHOGVATDAR_CLASS_1'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : p.tenureClass === 'BHOGVATDAR_CLASS_2'
                                    ? 'bg-amber-100 text-amber-900 font-black'
                                    : p.tenureClass === 'SARKAR_SHASAN'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {p.tenureDisplay || p.tenureClass || '-'}
                              </span>
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 bg-blue-50/20 font-bold text-blue-950">
                              {p.currentOwner || (isMarathi ? 'नोंद उपलब्ध नाही' : 'No record available')}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 text-slate-600 text-[10px] max-w-[200px]" title={pts[40] || p.otherRights}>
                              {pts[40] || p.otherRights || '-'}
                            </td>

                            {/* Checklist 1 to 46 values */}
                            {CHECKLIST_46_COLUMNS.map(col => {
                              const val = pts[col.num] || '-';
                              const isPositiveAlert =
                                val === 'होय' ||
                                val === 'आहे' ||
                                val.includes('शर्तभंग') ||
                                val.includes('अवैध');

                              return (
                                <td
                                  key={col.num}
                                  className={`py-2 px-2.5 border-r border-slate-100 text-[11px] ${
                                    col.group === 'renumbering'
                                      ? 'bg-amber-50/20 font-medium text-slate-800'
                                      : col.group === 'govt'
                                      ? 'bg-rose-50/10'
                                      : ''
                                  }`}
                                >
                                  {isPositiveAlert ? (
                                    <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                                      {val}
                                    </span>
                                  ) : val === 'नाही' ? (
                                    <span className="text-slate-400">{val}</span>
                                  ) : (
                                    <span className="text-slate-700" title={val}>
                                      {val}
                                    </span>
                                  )}
                                </td>
                              );
                            })}

                            <td className="py-2 px-2 text-center">
                              <button
                                onClick={() => setInspectedParcel(p)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 rounded-lg text-[10px] font-bold transition cursor-pointer"
                                title={isMarathi ? 'संपूर्ण ऐतिहासिक कालक्रम व तपशील पहा' : 'View full historical timeline & audit'}
                              >
                                <History className="w-3.5 h-3.5 text-blue-600" />
                                <span>{isMarathi ? 'कालक्रम' : 'Timeline'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {loading && paginatedParcels.length > 0 && (
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[0.5px] z-30 flex items-center justify-center pointer-events-none animate-in fade-in duration-150">
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-900/90 text-white text-xs font-bold rounded-2xl shadow-xl border border-white/20 backdrop-blur-md">
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                    <span>{isMarathi ? 'नवीन डेटा अद्ययावत होत आहे...' : 'Updating records...'}</span>
                  </div>
                </div>
              )}
            </div>

              {/* Pagination */}
              {kpiFilteredParcels.length > 0 && (
                <div className={`p-3.5 border-t border-slate-200 bg-slate-50/60 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Pagination
                    currentPage={page}
                    totalCount={kpiFilteredParcels.length}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setPage(1);
                    }}
                    pageSizeOptions={[25, 50, 100, 250, 'all']}
                    embedded={true}
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="relative">
                <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <table className="w-full text-left border-collapse text-xs min-w-[840px]">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-center">
                      <th className="py-2.5 px-3 border-r border-slate-200 w-12">{isMarathi ? 'अ.क्र.' : 'Sr.'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[120px]">{isMarathi ? 'गावाचे नाव' : 'Village Name'}</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 w-24">{isMarathi ? 'सर्व्हे / गट क्र.' : 'Survey / Gat No.'}</th>
                      <th className={`py-2.5 px-3 border-r border-slate-200 w-24 text-right transition-colors ${
                        selectedKpiFilter === 'area' ? 'bg-emerald-100 text-emerald-950 font-black border-emerald-300 ring-1 ring-emerald-400' : ''
                      }`}>
                        {isMarathi ? 'क्षेत्र (हे.आर.)' : 'Area (Ha.R)'}
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[220px] bg-blue-50/40 text-blue-950">
                        {isMarathi ? 'सध्याचे खातेदार / भोगवटादार नाव' : 'Current Khatedar / Occupant Name'}
                      </th>
                      <th className={`py-2.5 px-3 border-r border-slate-200 w-28 transition-colors ${
                        selectedKpiFilter === 'class2' ? 'bg-amber-100 text-amber-950 font-black border-amber-300 ring-1 ring-amber-400' : ''
                      }`}>
                        {isMarathi ? 'धारणा प्रकार' : 'Tenure Class'}
                      </th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-left min-w-[150px]">{isMarathi ? '१९५० मूळ नोंद' : '1950 Baseline Entry'}</th>
                      <th className={`py-2.5 px-3 border-r border-slate-200 text-left min-w-[180px] transition-colors ${
                        selectedKpiFilter === 'violations' ? 'bg-rose-100 text-rose-950 font-black border-rose-300 ring-1 ring-rose-400' : ''
                      }`}>
                        {isMarathi ? 'तपासणी निष्कर्ष / सद्यस्थिती' : 'Inspection Finding / Status'}
                      </th>
                      <th className="py-2.5 px-3 text-left min-w-[140px]">{isMarathi ? 'शेरा व इतर हक्क' : 'Remarks & Other Rights'}</th>
                      <th className="py-2.5 px-3 w-16 text-center">{isMarathi ? 'तपशील' : 'Details'}</th>
                    </tr>
                    <tr className="bg-slate-50 text-[10px] text-slate-400 text-center border-b border-slate-200">
                      <th className="py-1 border-r border-slate-200">{isMarathi ? '१' : '1'}</th>
                      <th className="py-1 border-r border-slate-200">{isMarathi ? '२' : '2'}</th>
                      <th className="py-1 border-r border-slate-200">{isMarathi ? '३' : '3'}</th>
                      <th className="py-1 border-r border-slate-200">{isMarathi ? '४' : '4'}</th>
                      <th className="py-1 border-r border-slate-200">{isMarathi ? '५' : '5'}</th>
                      <th className="py-1 border-r border-slate-200">{isMarathi ? '६' : '6'}</th>
                      <th className="py-1 border-r border-slate-200">{isMarathi ? '७' : '7'}</th>
                      <th className="py-1 border-r border-slate-200">{isMarathi ? '८' : '8'}</th>
                      <th className="py-1 border-r border-slate-200">{isMarathi ? '९' : '9'}</th>
                      <th className="py-1">{isMarathi ? '१०' : '10'}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-slate-100 transition-opacity duration-200 ${loading ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
                    {loading && paginatedParcels.length === 0 ? (
                      Array.from({ length: 8 }).map((_, sIdx) => (
                        <tr key={`skel-compact-${sIdx}`} className="animate-pulse border-b border-slate-100">
                          <td className="py-2.5 px-3 text-center border-r border-slate-100"><div className="h-4 w-6 bg-slate-200 rounded mx-auto" /></td>
                          <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                          <td className="py-2.5 px-3 text-center border-r border-slate-100"><div className="h-4 w-12 bg-slate-200 rounded mx-auto" /></td>
                          <td className="py-2.5 px-3 text-right border-r border-slate-100"><div className="h-4 w-12 bg-slate-200 rounded ml-auto" /></td>
                          <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-32 bg-slate-200 rounded" /></td>
                          <td className="py-2.5 px-3 text-center border-r border-slate-100"><div className="h-5 w-16 bg-slate-200 rounded mx-auto" /></td>
                          <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-24 bg-slate-200 rounded" /></td>
                          <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                          <td className="py-2.5 px-3 border-r border-slate-100"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                          <td className="py-2.5 px-3 text-center"><div className="h-4 w-8 bg-slate-200 rounded mx-auto" /></td>
                        </tr>
                      ))
                    ) : paginatedParcels.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-14 text-center">
                          <div className="max-w-md mx-auto flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-2xs border ${
                              selectedKpiFilter === 'violations'
                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                : selectedKpiFilter === 'class2'
                                ? 'bg-amber-50 text-amber-600 border-amber-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}>
                              <Filter className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 mb-1">
                              {selectedKpiFilter !== 'all'
                                ? (isMarathi
                                    ? `${selectedKpiFilter === 'class2' ? 'भोगवटादार वर्ग २ / शासकीय' : selectedKpiFilter === 'violations' ? 'शर्तभंग / संशयित बाबी' : 'निवडलेल्या'} निकषात एकही नोंद नाही.`
                                    : 'No records match this KPI filter in current selection.')
                                : (isMarathi ? 'निवडलेल्या निकषांनुसार कोणतेही अभिलेख आढळले नाहीत.' : 'No records found matching selected criteria.')}
                            </h4>
                            <p className="text-xs text-slate-500 mb-3.5">
                              {selectedKpiFilter !== 'all'
                                ? (isMarathi
                                    ? 'निवडलेल्या गावात या विशिष्ट श्रेणीतील अभिलेख निरंक (०) आहेत.'
                                    : 'There are 0 matching records for this KPI filter.')
                                : (isMarathi ? 'कृपया इतर निकष निवडून तपासा.' : 'Please try different filter options.')}
                            </p>
                            {selectedKpiFilter !== 'all' && (
                              <button
                                type="button"
                                onClick={() => { setSelectedKpiFilter('all'); setPage(1); }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition shadow-2xs cursor-pointer active:scale-95"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>{isMarathi ? 'सर्व अभिलेख दाखवा' : 'Show All Records'}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedParcels.map((p, idx) => (
                        <tr key={p.id || idx} className="hover:bg-blue-50/20 transition">
                          <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono text-slate-400">
                            {(page - 1) * effectivePageSize + idx + 1}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100 font-medium text-slate-900">
                            {formatVillageName(p.villageName, isMarathi)}
                            <span className="block text-[10px] text-slate-400">{formatTalukaName(p.taluka, isMarathi)}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center border-r border-slate-100 font-mono font-bold text-slate-800">
                            {p.gatNumber || p.oldSurveyNo || '-'}
                            {p.oldSurveyNo && p.gatNumber && p.oldSurveyNo !== p.gatNumber && (
                              <span className="block text-[10px] text-slate-400">{isMarathi ? 'जुना:' : 'Old:'} {p.oldSurveyNo}</span>
                            )}
                          </td>
                          <td className={`py-2.5 px-3 text-right border-r border-slate-100 font-mono transition-colors ${
                            selectedKpiFilter === 'area' ? 'bg-emerald-50/80 font-black text-emerald-950 ring-1 ring-inset ring-emerald-300' : 'font-medium'
                          }`}>
                            {p.totalAreaHa}
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100 bg-blue-50/20 font-bold text-blue-900">
                            {p.currentOwner || (isMarathi ? 'नोंद उपलब्ध नाही' : 'No record available')}
                          </td>
                          <td className={`py-2.5 px-3 text-center border-r border-slate-100 transition-colors ${
                            selectedKpiFilter === 'class2' ? 'bg-amber-50/80 ring-1 ring-inset ring-amber-300' : ''
                          }`}>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                selectedKpiFilter === 'class2'
                                  ? 'bg-amber-200 text-amber-950 ring-1 ring-amber-400 font-black'
                                  : p.tenureClass === 'BHOGVATDAR_CLASS_1'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.tenureClass === 'BHOGVATDAR_CLASS_2'
                                  ? 'bg-amber-100 text-amber-900'
                                  : p.tenureClass === 'SARKAR_SHASAN'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {p.tenureDisplay || p.tenureClass || '-'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 border-r border-slate-100 text-slate-600 text-[11px]">
                            {p.baselineOwner1950 || '-'}
                          </td>
                          <td className={`py-2.5 px-3 border-r border-slate-100 text-[11px] transition-colors ${
                            selectedKpiFilter === 'violations' ? 'bg-rose-50/80 ring-1 ring-inset ring-rose-300' : ''
                          }`}>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md ${
                                selectedKpiFilter === 'violations'
                                  ? 'bg-rose-200 text-rose-950 ring-1 ring-rose-400 font-black'
                                  : p.statusFinding?.includes('शर्तभंग') || p.statusFinding?.includes('अवैध')
                                  ? 'bg-rose-100 text-rose-800 font-bold'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {p.statusFinding || (isMarathi ? 'प्रमाणित' : 'Verified')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px]  max-w-[200px]" title={p.remarks}>
                            {p.remarks || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => setInspectedParcel(p)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                              title={isMarathi ? '४६ मुद्द्यांची संपूर्ण तपासणी पहा' : 'View full 46-point audit checklist'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {loading && paginatedParcels.length > 0 && (
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[0.5px] z-30 flex items-center justify-center pointer-events-none animate-in fade-in duration-150">
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-900/90 text-white text-xs font-bold rounded-2xl shadow-xl border border-white/20 backdrop-blur-md">
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                    <span>{isMarathi ? 'नवीन डेटा अद्ययावत होत आहे...' : 'Updating records...'}</span>
                  </div>
                </div>
              )}
            </div>

              {/* Pagination */}
              {kpiFilteredParcels.length > 0 && (
                <div className={`p-3.5 border-t border-slate-200 bg-slate-50/60 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Pagination
                    currentPage={page}
                    totalCount={kpiFilteredParcels.length}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setPage(1);
                    }}
                    pageSizeOptions={[25, 50, 100, 250, 'all']}
                    embedded={true}
                  />
                </div>
              )}
            </div>
          ))}

          {/* =========================================================
              OFFICIAL 3-TIER SIGNATURE BLOCK
          ========================================================= */}
          {/* <div className="p-4 bg-slate-50 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
              {isMarathi ? 'महसूल विभाग तपासणी व प्रमाणीकरण स्वाक्षरी कक्ष' : 'Revenue Department Inspection & Attestation Signature Cell'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-700">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">{isMarathi ? '१. माहिती तयार करणारा:' : '1. Prepared By:'}</span>
                <span className="text-slate-500 block">{isMarathi ? 'तलाठी / महसूल सहाय्यक' : 'Talathi / Revenue Assistant'}</span>
                <span className="text-[11px] text-slate-400 block">{isMarathi ? 'दिनांक: ______________' : 'Date: ______________'}</span>
                <span className="text-[11px] text-slate-400 block">{isMarathi ? 'स्वाक्षरी: ______________' : 'Signature: ______________'}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">{isMarathi ? '२. तपासणी अधिकारी:' : '2. Inspected By:'}</span>
                <span className="text-slate-500 block">{isMarathi ? 'महसूल मंडळ अधिकारी / नायब तहसीलदार' : 'Circle Officer / Naib Tahsildar'}</span>
                <span className="text-[11px] text-slate-400 block">दिनांक: ______________</span>
                <span className="text-[11px] text-slate-400 block">स्वाक्षरी: ______________</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">{isMarathi ? '३. प्रमाणीकरण अधिकारी:' : '3. Certified By:'}</span>
                <span className="text-slate-500 block">{isMarathi ? 'तहसिलदार, चंद्रपूर' : 'Tahsildar, Chandrapur'}</span>
                <span className="text-[11px] text-slate-400 block">दिनांक: ______________</span>
                <span className="text-[11px] text-slate-400 block">स्वाक्षरी: ______________</span>
              </div>
            </div>
          </div> */}
        </div>
        )}

        {/* =========================================================
            HISTORICAL BACKWARD TIMELINE & 46-POINTS AUDIT MODAL
        ========================================================= */}
        {inspectedParcel && mounted && createPortal(
          <div
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setInspectedParcel(null);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="audit-modal-title"
              className="bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[88vh] shadow-2xl shadow-slate-950/30 border border-slate-200/90 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 my-auto"
            >
              
              {/* National Tricolor Micro Accent Line (Portal Theme) */}
              <div className="h-1 sm:h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600 shrink-0" />

              {/* Modal Header - Official Light Portal Theme (Zero Collision) */}
              <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200/90 bg-white shrink-0">
                {/* Top Row: Category Chip on Left + Actions on Right */}
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] sm:text-xs font-bold border border-blue-200/80 shadow-2xs">
                    <History className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{isMarathi ? 'ऐतिहासिक महसूल कालक्रम व अधिकार अभिलेख पडताळणी' : 'Historical Revenue Timeline & Record of Rights Verification'}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                      title={isMarathi ? 'माहिती संपादित करा' : 'Edit Parcel Data'}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{isMarathi ? 'माहिती संपादित करा' : 'Edit Data'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspectedParcel(null)}
                      className="w-8 h-8 rounded-xl bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition flex items-center justify-center cursor-pointer shrink-0 border border-slate-200/60"
                      aria-label="Close modal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Identity Row: Gat No & Location Badges */}
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <h3 id="audit-modal-title" className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                    {isMarathi ? 'गट / सर्व्हे क्र.' : 'Gat / Survey No.'}{' '}
                    <span className="font-black text-blue-700">{inspectedParcel.gatNumber || inspectedParcel.oldSurveyNo}</span>
                  </h3>
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80 font-medium">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    {formatVillageName(inspectedParcel.villageName, isMarathi)}, {isMarathi ? 'ता.' : 'Tal.'} {formatTalukaName(inspectedParcel.taluka, isMarathi)}
                  </span>
                  {inspectedParcel.upi && (
                    <span className="font-mono text-[11px] bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 rounded font-medium">
                      {inspectedParcel.upi}
                    </span>
                  )}
                </div>

                {/* Metadata Row: Clean Structured Divider */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-x-4 sm:gap-x-5 gap-y-1.5 flex-wrap text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-normal">{isMarathi ? 'सध्याचे खातेदार:' : 'Current Khatedar:'}</span>
                    <strong className="text-slate-900 font-bold">{inspectedParcel.currentOwner}</strong>
                  </div>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-normal">{isMarathi ? 'क्षेत्र:' : 'Area:'}</span>
                    <strong className="text-slate-900 font-bold font-mono">{inspectedParcel.totalAreaHa} {isMarathi ? 'हे.आर.' : 'Ha.R'}</strong>
                  </div>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-normal">{isMarathi ? 'धारणा प्रकार:' : 'Tenure Class:'}</span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                      inspectedParcel.tenureClass?.includes('1')
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : inspectedParcel.tenureClass?.includes('SARKAR')
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {inspectedParcel.tenureDisplay || inspectedParcel.tenureClass}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 bg-slate-50/70">
                
                {/* 1. VISUAL 4-PHASE BACKWARD HISTORY TIMELINE */}
                <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3.5 pb-2.5 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{isMarathi ? 'ऐतिहासिक कालक्रम प्रवाह (Backward History Timeline: 1950 ते आजतागायत)' : 'Backward History Timeline Flow (1950 to Present)'}</span>
                    </h4>
                    <span className="self-start sm:self-auto text-[10px] bg-slate-100 text-slate-700 border border-slate-200/80 font-bold px-2 py-0.5 rounded-md font-mono">
                      {isMarathi ? 'रिनंबरींग पर्चा नोंदी (१ ते ९)' : 'Renumbering Slip Entries (1 to 9)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
                    {/* Stage 1: 1950 Settlement */}
                    <div className="p-3.5 rounded-xl border border-amber-200/90 bg-amber-50/30 flex flex-col justify-between space-y-2 hover:border-amber-300 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200/60">
                          {isMarathi ? '१. १९५० बंदोबस्त' : '1. 1950 Settlement'}
                        </span>
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">{isMarathi ? 'बंदोबस्त क्र. (i):' : 'Settlement No. (i):'}</span>
                          <span className="font-mono font-bold text-slate-800">{inspectedParcel.points?.[1] || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">{isMarathi ? 'मूळ भोगवटदार (ii):' : 'Original Holder (ii):'}</span>
                          <span className="font-semibold text-slate-900 line-clamp-2">{inspectedParcel.points?.[2] || inspectedParcel.baselineOwner1950 || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">{isMarathi ? 'मूळ भूधारणा (iii):' : 'Original Tenure (iii):'}</span>
                          <span className="font-medium text-slate-700">{inspectedParcel.points?.[3] || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stage 2: Consolidation */}
                    <div className="p-3.5 rounded-xl border border-sky-200/90 bg-sky-50/30 flex flex-col justify-between space-y-2 hover:border-sky-300 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-sky-900 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200/60">
                          {isMarathi ? '२. एकत्रिकरण' : '2. Consolidation'}
                        </span>
                        <Layers className="w-3.5 h-3.5 text-sky-700" />
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">{isMarathi ? 'एकत्रिकरण क्र. (i):' : 'Consolidation No. (i):'}</span>
                          <span className="font-mono font-bold text-slate-800">{inspectedParcel.points?.[4] || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">{isMarathi ? 'एकत्रिकरण भोगवटदार (ii):' : 'Consolidation Holder (ii):'}</span>
                          <span className="font-semibold text-slate-900 line-clamp-2">{inspectedParcel.points?.[5] || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">{isMarathi ? 'एकत्रिकरण भूधारणा (iii):' : 'Consolidation Tenure (iii):'}</span>
                          <span className="font-medium text-slate-700">{inspectedParcel.points?.[6] || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stage 3: Resurvey */}
                    <div className="p-3.5 rounded-xl border border-indigo-200/90 bg-indigo-50/30 flex flex-col justify-between space-y-2 hover:border-indigo-300 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200/60">
                          {isMarathi ? '३. पुनर्मोजणी (७/१२)' : '3. Resurvey (7/12)'}
                        </span>
                        <LandPlot className="w-3.5 h-3.5 text-indigo-700" />
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">{isMarathi ? 'पुनर्मोजणी क्र. (i):' : 'Resurvey No. (i):'}</span>
                          <span className="font-mono font-bold text-slate-800">{inspectedParcel.points?.[7] || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">{isMarathi ? 'पुनर्मोजणी भोगवटदार (ii):' : 'Resurvey Holder (ii):'}</span>
                          <span className="font-semibold text-slate-900 line-clamp-2">{inspectedParcel.points?.[8] || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">{isMarathi ? 'पुनर्मोजणी भूधारणा (iii):' : 'Resurvey Tenure (iii):'}</span>
                          <span className="font-medium text-slate-700">{inspectedParcel.points?.[9] || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stage 4: Current Status */}
                    <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/30 flex flex-col justify-between space-y-2 hover:border-emerald-400 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200/60">
                          {isMarathi ? '४. सद्यस्थितीतील ७/१२' : '4. Current 7/12'}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">{isMarathi ? 'चालू गट क्र.:' : 'Current Gat No.:'}</span>
                          <span className="font-mono font-bold text-emerald-950">{inspectedParcel.gatNumber || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">{isMarathi ? 'सध्याचे खातेदार:' : 'Current Khatedar:'}</span>
                          <span className="font-bold text-slate-950 line-clamp-2">{inspectedParcel.currentOwner || inspectedParcel.points?.[10] || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">{isMarathi ? 'सध्याची भूधारणा:' : 'Current Tenure:'}</span>
                          <span className="font-bold text-emerald-800">{inspectedParcel.tenureDisplay || inspectedParcel.tenureClass || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. STATUTORY COMPLIANCE & VIOLATION SUMMARY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Card 1: Govt Land & Discrepancies */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
                    <h5 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>{isMarathi ? 'शासकीय जमीन व सद्यस्थिती' : 'Government Land & Current Status'}</span>
                      <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/60">१० ते १९</span>
                    </h5>
                    <div className="divide-y divide-slate-50 text-xs">
                      <div className="flex justify-between items-center py-1.5 gap-2">
                        <span className="text-slate-500 shrink-0">{isMarathi ? 'जमिनीचा दर्जा/प्रकार:' : 'Land Class:'}</span>
                        <span className="font-medium text-slate-800 text-right truncate">{inspectedParcel.points?.[11] || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 gap-2">
                        <span className="text-slate-500 shrink-0">{isMarathi ? 'मूळ ७/१२ शी तफावत:' : 'Discrepancy with 1950:'}</span>
                        <span className="font-medium text-slate-600 text-right">{inspectedParcel.points?.[12] || 'नाही'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 gap-2">
                        <span className="text-slate-500 shrink-0">{isMarathi ? 'वन / झुडपी जंगल:' : 'Forest / Scrub:'}</span>
                        <span className="font-medium text-slate-600 text-right">{inspectedParcel.points?.[13] || 'नाही'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 gap-2">
                        <span className="text-slate-500 shrink-0">{isMarathi ? 'अतिक्रमण क्षेत्र:' : 'Encroached Area:'}</span>
                        <span className={`font-bold text-right ${inspectedParcel.points?.[15] && inspectedParcel.points?.[15] !== 'नाही' ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded' : 'text-slate-600'}`}>
                          {inspectedParcel.points?.[15] || 'नाही'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 gap-2">
                        <span className="text-slate-500 shrink-0">{isMarathi ? 'शासन नोंद कमी केली?:' : 'Govt Entry Removed?:'}</span>
                        <span className={`font-bold text-right ${inspectedParcel.points?.[18] === 'होय' ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded' : 'text-slate-600'}`}>
                          {inspectedParcel.points?.[18] || 'नाही'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Statutory Acts Verification */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
                    <h5 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>{isMarathi ? 'वैधानिक कायदे पडताळणी' : 'Statutory Acts Verification'}</span>
                      <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/60">२० ते ३४</span>
                    </h5>
                    <div className="divide-y divide-slate-50 text-xs">
                      <div className="flex justify-between items-center py-1.5 gap-2">
                        <span className="text-slate-500 shrink-0">{isMarathi ? 'कुळ वहिवाट कायदा:' : 'Tenancy Act:'}</span>
                        <span className="font-medium text-slate-600 text-right">{inspectedParcel.points?.[20] || 'नाही'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 gap-2">
                        <span className="text-slate-500 shrink-0">{isMarathi ? 'इनाम / वतन जमीन:' : 'Inam / Watan Land:'}</span>
                        <span className="font-medium text-slate-600 text-right">{inspectedParcel.points?.[21] || 'नाही'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 gap-2">
                        <span className="text-slate-500 shrink-0">{isMarathi ? 'कमाल धारणा वाटप:' : 'Ceiling Act Grant:'}</span>
                        <span className="font-medium text-slate-600 text-right">{inspectedParcel.points?.[23] || 'नाही'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 gap-2">
                        <span className="text-slate-500 shrink-0">{isMarathi ? 'आदिवासी खातेदार:' : 'Tribal Khatedar:'}</span>
                        <span className={`font-bold text-right ${inspectedParcel.points?.[26] === 'होय' ? 'text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded' : 'text-slate-600'}`}>
                          {inspectedParcel.points?.[26] || 'नाही'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 gap-2">
                        <span className="text-slate-500 shrink-0">{isMarathi ? 'भूदान / ग्रामदान:' : 'Bhoodan / Gramdan:'}</span>
                        <span className="font-medium text-slate-600 text-right">{inspectedParcel.points?.[29] || 'नाही'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Violations & Register Status */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
                    <h5 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>{isMarathi ? 'शर्तभंग, रूपांतरण व नोंदवही' : 'Breach, Conversion & Registers'}</span>
                      <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/60">३५ ते ४६</span>
                    </h5>
                    <div className="divide-y divide-slate-50 text-xs">
                      <div className="flex justify-between items-center py-1.5 gap-2">
                        <span className="text-slate-500 shrink-0">{isMarathi ? 'वर्ग २ ते १ अवैध रूपांतरण:' : 'Illegal Class 2 to 1:'}</span>
                        <span className={`font-bold text-right ${inspectedParcel.points?.[35] && inspectedParcel.points?.[35] !== 'नाही' ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded' : 'text-slate-600'}`}>
                          {inspectedParcel.points?.[35] || 'नाही'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 gap-2">
                        <span className="text-slate-500 shrink-0">{isMarathi ? 'मौका चौकशी शर्तभंग:' : 'Spot Inquiry Breach:'}</span>
                        <span className={`font-bold text-right ${inspectedParcel.points?.[36] && inspectedParcel.points?.[36] !== 'नाही' ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded' : 'text-slate-600'}`}>
                          {inspectedParcel.points?.[36] || 'नाही'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 gap-2">
                        <span className="text-slate-500 shrink-0">{isMarathi ? 'आदिवासी ते गैर-आदिवासी:' : 'Tribal to Non-Tribal:'}</span>
                        <span className={`font-bold text-right ${inspectedParcel.points?.[38] === 'होय' ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded' : 'text-slate-600'}`}>
                          {inspectedParcel.points?.[38] || 'नाही'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 gap-2">
                        <span className="text-slate-500 shrink-0">{isMarathi ? 'इतर नोंदी अवैधरित्या कमी:' : 'Other Rights Deleted:'}</span>
                        <span className={`font-bold text-right ${inspectedParcel.points?.[40] === 'होय' ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded' : 'text-slate-600'}`}>
                          {inspectedParcel.points?.[40] || 'नाही'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 gap-2">
                        <span className="text-slate-500 shrink-0">{isMarathi ? 'गाव नमुना १-क अद्यावत:' : 'VF 1-C Updated:'}</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-right">{inspectedParcel.points?.[46] || 'होय'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. COMPLETE 46 CHECKPOINTS AUDIT TABLE */}
                <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                  <div className="p-3 sm:px-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-800">
                      {isMarathi ? 'संपूर्ण ४६ तपासणी रकाने सविस्तर नोंदी' : 'Complete 46 Audit Columns Detailed Records'}
                    </h5>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">{isMarathi ? '४६ पैकी ४६ मुद्दे प्रमाणित' : '46 of 46 Points Verified'}</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {CHECKLIST_46_COLUMNS.map(col => {
                      const val = inspectedParcel.points?.[col.num] || '-';
                      const isAlert =
                        val === 'होय' ||
                        val === 'आहे' ||
                        val.includes('शर्तभंग') ||
                        val.includes('अवैध');

                      return (
                        <div key={col.num} className="p-2.5 sm:px-4 flex items-center justify-between gap-2 hover:bg-slate-50 transition text-xs">
                          <div className="flex items-center gap-2 min-w-0 max-w-[70%]">
                            <span className="font-mono text-[10px] font-bold text-slate-400 w-6 text-right shrink-0">
                              {col.num}.
                            </span>
                            <span className="text-slate-700 truncate" title={isMarathi ? col.title : (col.titleEn || col.title)}>
                              {isMarathi ? col.title : (col.titleEn || col.title)}
                            </span>
                          </div>
                          <div className="shrink-0">
                            {isAlert ? (
                              <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[11px]">
                                {val}
                              </span>
                            ) : val === 'नाही' ? (
                              <span className="text-slate-400 font-medium">{val}</span>
                            ) : (
                              <span className="font-semibold text-slate-900">{val}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200/90 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isMarathi ? 'सदर माहिती महसूल अधिकार अभिलेख तपासणी कार्यप्रणाली अंतर्गत संकलित केलेली आहे.' : 'This data is compiled under the Revenue Record-of-Rights Verification System.'}</span>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <Edit3 className="w-4 h-4 text-amber-300" />
                    <span>{isMarathi ? 'माहिती संपादित करा' : 'Edit Parcel Record'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectedParcel(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer border border-slate-200/60"
                  >
                    {isMarathi ? 'बंद करा' : 'Close'}
                  </button>
                </div>
              </div>

            </div>
          </div>,
          document.body
        )}

        {/* Edit Parcel Modal Integration */}
        {isEditModalOpen && inspectedParcel && (
          <EditParcelModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            parcel={inspectedParcel}
            onUpdateSuccess={(updatedPayload) => {
              loadData();
              if (updatedPayload) {
                setInspectedParcel((prev) => ({
                  ...prev,
                  currentOwner: updatedPayload.ownerName || prev.currentOwner,
                  tenureClass: updatedPayload.tenureClass || prev.tenureClass,
                  totalAreaHa: updatedPayload.totalAreaHa != null ? Number(updatedPayload.totalAreaHa).toFixed(4) : prev.totalAreaHa,
                  points: {
                    ...prev.points,
                    ...(updatedPayload.ownerName ? { 10: updatedPayload.ownerName } : {}),
                  }
                }));
              }
            }}
          />
        )}

        {/* Floating Download Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{toastMessage.text}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
