# 🏛️ Chandrapur Land Records & Governance Platform (chanda)
### जमीन अभिलेख व्यवस्थापन व महसूल चौकशी प्रणाली (जिल्हाधिकारी कार्यालय, चंद्रपूर)

The **Chandrapur Land Records & Governance Platform** is a statutory land intelligence and quasi-judicial enforcement system for the **District Collectorate, Chandrapur (Government of Maharashtra)**. Built under the framework of the **Maharashtra Land Revenue Code (MLRC) 1966**, the platform automates village Excel ingestion, establishes historical ownership title chains (**Backward Linkage** to 1950 baseline), manages quasi-judicial enforcement pipelines (**Forward Linkage** for Shartbhang, tribal land alienations, and Gairan encroachment), links physical Collectorate record room coordinates to digital Cloudinary archives (**DMS**), and exports standardized audit booklets (**प्रपत्र १ ते ६, प्रपत्र ३**).

---

## 1. Statutory Context & Legal Terminology

| Statutory Term | Marathi Term | Legal Definition & Significance under MLRC 1966 |
|---|---|---|
| **MLRC 1966** | महाराष्ट्र जमीन महसूल संहिता १९६६ | The statutory foundation governing ownership, classification, survey, and tenancy across all parcels in Maharashtra. |
| **Bhogvatdar Class-1** | भोगवटादार वर्ग-१ | Absolute freehold rights; alienable and inheritable without prior administrative permission. |
| **Bhogvatdar Class-2** | भोगवटादार वर्ग-२ | Conditional / restricted tenure (government-granted, ceiling surplus, tribal allotments). Requires Collector/SDO sanction before sale, mortgage, partition, or NA conversion. |
| **Sarkar / Shasan** | शासकीय जमीन / शासन | Lands vested exclusively in the State (Gairan pasture lands under Sec 50-54, riverbeds, public utility lands). |
| **Devasthan / Inam** | देवस्थान / इनाम | Lands assigned to support temples, religious trusts, or traditional village service grants; transfers strictly barred. |
| **Shartbhang** | शर्तभंग | Breach of allotment conditions (e.g. unauthorized transfer, unapproved lease, or commercial use of Class-2 land). |
| **Adivasi Land Transfer** | आदिवासी जमीन हस्तांतरण | Restrictions under MLRC Sections 36 & 36A barring transfer of tribal land to non-tribals without prior sanction of the Collector / State Government. |
| **Pokalist Nondi** | पोकळीस्त नोंदी | Defunct, unauthorized, or "hollow" historical remarks (e.g., Bu.Ga.De., Ta.Ga.De.) entered without supporting mutation orders. |
| **Shasan Jama** | शासन जमा | Resumption or confiscation order by the District Collector returning illegally alienated or encroached land back to state ownership. |
| **Prapatra-3** | प्रपत्र-३ अहवाल | Official statutory 13-column reporting format prescribed by the Revenue and Forest Department for field verification of Class-2 conditions, tribal lands, and recovery of state lands. |

---

## 2. Project Architecture & Folder Structure

```
d:\chanda\
├── backend/                         # Node.js + Express.js API Backend
│   ├── prisma/
│   │   ├── schema.prisma            # Neon PostgreSQL schema with pgcrypto & enums
│   │   └── seed.js                  # Realistic Chandrapur revenue seed data
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js        # Cloudinary SDK with native stream upload
│   │   │   └── prisma.js            # Prisma client instance
│   │   ├── controllers/
│   │   │   ├── parcelController.js  # Bulk Excel upload, 360 trace & sample template
│   │   │   ├── reportController.js  # 13-Column statutory Prapatra-3 Excel export
│   │   │   ├── documentController.js# Cloudinary DMS + physical rack coordinates
│   │   │   ├── caseController.js    # Quasi-judicial cases, hearings & Shasan Jama
│   │   │   └── analyticsController.js # District/taluka rollups & violation metrics
│   │   ├── middleware/
│   │   │   └── uploadMiddleware.js  # Multer memory storage
│   │   ├── routes/
│   │   │   ├── parcelRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   ├── documentRoutes.js
│   │   │   ├── caseRoutes.js
│   │   │   └── analyticsRoutes.js
│   │   ├── utils/
│   │   │   └── excelGenerator.js    # Statutory Prapatra-3 workbook & template
│   │   └── app.js                   # Express app configuration & BigInt serialization
│   ├── server.js                    # Server bootstrap on PORT 5000
│   ├── package.json
│   └── .env
│
├── frontend/                        # Next.js 14 App Router + Tailwind CSS
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.jsx           # Root layout with bilingual header & sidebar
│   │   │   ├── page.jsx             # Executive Revenue Dashboard & Key Metrics
│   │   │   ├── parcels/page.jsx     # Parcel Explorer & 360° Trace Drawer trigger
│   │   │   ├── cases/page.jsx       # Forward Enforcement, Shartbhang & Hearings
│   │   │   ├── documents/page.jsx   # Collectorate DMS Digital Vault & Rack Coordinates
│   │   │   ├── bulk-upload/page.jsx # Village Excel Ingestion with sample template
│   │   │   ├── reports/page.jsx     # Prapatra-3 Statutory 13-Column Export Center
│   │   │   └── globals.css          # Glassmorphism, Google Fonts & Gov branding
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Collectorate Header & Live Service Indicators
│   │   │   ├── Sidebar.jsx          # Collapsible navigation
│   │   │   ├── MetricCard.jsx       # Reusable stat card with trend badges
│   │   │   ├── ParcelTraceDrawer.jsx# 360° Historical Timeline & Enforcement View
│   │   │   ├── DocUploadModal.jsx   # DMS upload modal (Cloudinary + physical rack/bundle)
│   │   │   └── AddHearingModal.jsx  # Schedule SDO / Tehsildar hearing modal
│   │   └── lib/
│   │       ├── api.js               # Centralized fetch client
│   │       └── constants.js         # Talukas, Marathi mappings & status badges
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.local
│
└── README.md
```

---

## 3. Database Specification & Models

The database is deployed on **Neon PostgreSQL** using **Prisma ORM**:

- **`LandParcel`**: Master registry storing District, Taluka, Revenue Circle, Village Code/Name, Old Survey No, Gat No, Hissa No, Total Area (Ha), Potkharaba Area, Tenure Class, Dispute Flag, and unique Parcel Identifier (UPI e.g., `MH-CHA-WAR-042-0019-01`).
- **`BackwardHistory`**: Historical ownership epochs (1950 baseline, 1974, 1988, 2010), Ferfar Number, Titleholder Name, Khata Number, Mutation Type (*Varas, Watap, Kharedikhat*), and `wasGovtLand` flag.
- **`ForwardEnforcementCase`**: Quasi-judicial proceedings for violations (`SHARTBHANG`, `TRIBAL_LAND_VIOLATION`, `UNAUTHORIZED_NA_CONVERSION`, `ENCROACHMENT`, `POKALIST_NONDI`), Investigating Officer, Show-Cause Notice Date, and `isRepossessedToGovt` (*शासन जमा*).
- **`CaseHearing`**: Hearing logs conducted by SDO Warora, Tehsildar, or District Collector with proceedings summary and next hearing schedule.
- **`DmsDocument`**: Document archive streaming to **Cloudinary** (`storageUrl`, `cloudinaryPublicId`) coupled with physical Collectorate coordinates:
  - **रॅक क्र. (Rack No)**
  - **गठ्ठा क्र. (Bundle No)**
  - **फाईल क्र. (File No)**

---

## 4. Prapatra-3 (प्रपत्र-३) Government Compliance Mapping

The automated export engine (`GET /api/reports/prapatra-3`) outputs a fully styled Microsoft Excel booklet mapping database entities directly to the 13 statutory columns prescribed by the Maharashtra Revenue & Forest Department:

1. **अ.क्र. (Sr. No.)**
2. **उपविभाग / तालुका (Sub-Division / Taluka)**: `LandParcel.district` / `LandParcel.taluka`
3. **महसूल मंडळ व गाव (Revenue Circle & Village)**: `LandParcel.revenueCircle` - `LandParcel.villageName`
4. **जुना स.नं. / नवा गट क्र. (Old Survey / New Gat No.)**: `LandParcel.oldSurveyNo` / `LandParcel.gatNumber`
5. **हिस्सा क्र. (Hissa No.)**: `LandParcel.hissaNumber`
6. **एकूण क्षेत्र (हे./आर) (Total Area Ha)**: `LandParcel.totalAreaHa`
7. **मूळ खातेदार सन १९५० (Original 1950 Titleholder)**: `BackwardHistory.ownerName` where `epochYear == 1950`
8. **धारणा प्रकार (Statutory Land Tenure)**: `LandParcel.tenureClass`
9. **सद्यस्थितीतील कब्जेदार (Present Occupant)**: `ForwardEnforcementCase.occupantName`
10. **उल्लंघनाचे स्वरूप / शर्तभंग (Nature of Irregularity)**: `ForwardEnforcementCase.violationType`
11. **सक्षम प्राधिकारी परवानगी स्थिती (Sanction Verification Status)**: `ForwardEnforcementCase.status`
12. **आदेश क्रमांक व दिनांक (Quasi-Judicial Order)**: `ForwardEnforcementCase.caseNumber` + `orderDate`
13. **शेरा व दस्तऐवज संदर्भ (Audit Remarks & DMS Reference)**: `DmsDocument.fileNumber` + Rack / Bundle Coordinates

---

## 5. Quickstart & Execution Guide

### Backend Service (Port 5000)

```bash
cd d:\chanda\backend

# 1. Install dependencies
npm install

# 2. Push Prisma schema to Neon PostgreSQL
npx prisma db push

# 3. Seed database with Chandrapur revenue records
node prisma/seed.js

# 4. Start backend server
node server.js
# API running at http://localhost:5000
```

### Frontend Portal (Port 3000)

```bash
cd d:\chanda\frontend

# 1. Install dependencies
npm install

# 2. Start Next.js development server
npm run dev
# Web Portal accessible at http://localhost:3000
```

---

## 6. Primary API Endpoints

- `GET /api/health`: Service health check.
- `GET /api/analytics/summary`: Dashboard KPIs and violation rollup.
- `GET /api/parcels`: Filterable, paginated parcel registry.
- `GET /api/parcels/:upi/trace`: 360° Trace (Backward 1950 epochs + Forward cases + DMS docs).
- `POST /api/parcels/bulk-upload`: Streaming ingestion of raw village Excel sheets.
- `GET /api/parcels/sample-template`: Download pre-formatted sample Excel template.
- `GET /api/reports/prapatra-3`: Stream download official 13-column Prapatra-3 Excel booklet.
- `GET /api/reports/prapatra-3/preview`: JSON preview of Prapatra-3 columns for UI tables.
- `POST /api/documents/upload`: Stream upload document to Cloudinary and catalog rack coordinates.
- `GET /api/documents`: List DMS documents with physical coordinates.
- `GET /api/cases`: Quasi-judicial cases and hearings.
- `POST /api/cases/:id/hearings`: Log hearing proceedings and next date.
- `PATCH /api/cases/:id/status`: Update case status or mark *Shasan Jama* (शासन जमा).
