# Voluntary Product Accessibility Template (VPAT®) 2.5
## WCAG 2.1 Edition & DPDPA 2023 Conformance Report

**Product Name:** Chandrapur District Land Governance & Revenue Analytics Portal (चंद्रपूर जिल्हा भूमी व महसूल प्रशासन प्रणाली)  
**Product Version:** 2.4.0 (Production Release)  
**Report Date:** September 2026  
**Product Description:** Web-based Geographic Information System (GIS) and statutory land governance platform developed for the Collectorate of Chandrapur, Government of Maharashtra. The system monitors Maharashtra Land Revenue Code (MLRC) 1966 violations, Land Ceiling, Bhudan, Tribal Land Alienation, and Class-II (Bhogvatdar Class 2) tenures across 15 talukas.  
**Contact Information:**  
- **Data Protection & Accessibility Cell:** Collectorate, Chandrapur, Maharashtra - 442401  
- **Email:** `collector.chandrapur@maharashtra.gov.in` / `dpo.chandrapur@maharashtra.gov.in`  
- **Phone:** +91-7172-251100 / +91-7172-255222  
**Evaluation Methods Used:** Automated testing via axe-core 4.8+, Google Lighthouse 11+, and WAVE Evaluation Tool; Manual assistive technology evaluation with NVDA 2024.1 on Google Chrome and Mozilla Firefox; Keyboard-only navigation testing; DPDPA compliance audit against Ministry of Electronics and Information Technology (MeitY) guidelines.  

---

## Standards and Guidelines

| Standard / Guideline | Included in Report | Conformance Level |
| :--- | :---: | :--- |
| **Web Content Accessibility Guidelines (WCAG) 2.0** | Yes | Level A & Level AA (Full Conformance) |
| **Web Content Accessibility Guidelines (WCAG) 2.1** | Yes | Level A & Level AA (Substantially Conforms) |
| **Guidelines for Indian Government Websites (GIGW 3.0)** | Yes | Fully Conforms |
| **Digital Personal Data Protection Act (DPDPA) 2023** | Yes | Fully Conforms (Sections 4, 6, 8, 11, 12, 13) |

---

## Terms and Conformance Definitions

The terms used in the Conformance Level information are defined as follows:
- **Supports:** The functionality of the product has at least one method that meets the criterion without known defects or meets with equivalent facilitation.
- **Partially Supports:** Some functionality of the product does not meet the criterion.
- **Does Not Support:** The majority of product functionality does not meet the criterion.
- **Not Applicable:** The criterion is not relevant to the product.
- **Not Evaluated:** The product has not been evaluated against the criterion.

---

## WCAG 2.1 Conformance Requirements

### Principle 1: Perceivable

Information and user interface components must be presentable to users in ways they can perceive.

#### Guideline 1.1 Text Alternatives

| Criteria | Conformance Level | Remarks and Explanations |
| :--- | :---: | :--- |
| **1.1.1 Non-text Content** (Level A) | **Supports** | All non-text content has a text alternative. District logos and informational icons include meaningful `alt` text or `aria-label` attributes. Decorative icons use `aria-hidden="true"`. Data visualizations (Recharts bar, pie, and mountain charts) provide hidden, screen-reader-accessible tabular representations (`<table className="sr-only">`) containing exact numerical data. Interactive maps have text-based data ledger alternatives. |

#### Guideline 1.2 Time-based Media

| Criteria | Conformance Level | Remarks and Explanations |
| :--- | :---: | :--- |
| **1.2.1 Audio-only and Video-only (Prerecorded)** (Level A) | **Not Applicable** | The portal contains no prerecorded audio or video content. |
| **1.2.2 Captions (Prerecorded)** (Level A) | **Not Applicable** | The portal contains no prerecorded video content. |
| **1.2.3 Audio Description or Media Alternative (Prerecorded)** (Level A) | **Not Applicable** | The portal contains no multimedia video content. |
| **1.2.4 Captions (Live)** (Level AA) | **Not Applicable** | The portal does not broadcast live synchronized audio/video streams. |
| **1.2.5 Audio Description (Prerecorded)** (Level AA) | **Not Applicable** | The portal contains no prerecorded video content. |

#### Guideline 1.3 Adaptable

| Criteria | Conformance Level | Remarks and Explanations |
| :--- | :---: | :--- |
| **1.3.1 Info and Relationships** (Level A) | **Supports** | Information, structure, and relationships conveyed through presentation are programmatically determined. Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`) are used throughout. Modal dialogs declare `role="dialog"` and `aria-modal="true"`. All form inputs are programmatically coupled to `<label>` tags with matching `htmlFor` and `id` properties. Data tables use `<caption>`, `<th scope="col">`, and `<th scope="row">`. |
| **1.3.2 Meaningful Sequence** (Level A) | **Supports** | The reading sequence in the DOM corresponds to the logical visual layout, ensuring screen readers announce header, sidebar, dashboard cards, tables, and modal contents in sequence. |
| **1.3.3 Sensory Characteristics** (Level A) | **Supports** | Instructions and status indicators do not rely solely on shape, size, color, or location. Text descriptions and icons accompany all warnings, success indicators, and status badges. |
| **1.3.4 Orientation** (Level AA) | **Supports** | The portal supports both portrait and landscape screen orientations dynamically using fluid Tailwind CSS responsive layouts. Content is not restricted to a single display orientation. |
| **1.3.5 Identify Input Purpose** (Level AA) | **Supports** | Input fields for login, registration, phone numbers, and official emails use standard HTML `type` and `autoComplete` attributes (e.g., `autocomplete="username"`, `autocomplete="tel"`). |

#### Guideline 1.4 Distinguishable

| Criteria | Conformance Level | Remarks and Explanations |
| :--- | :---: | :--- |
| **1.4.1 Use of Color** (Level A) | **Supports** | Color is not used as the sole visual means of conveying information, indicating an action, or distinguishing a visual element. All status indicators (e.g., Shasan Jama, Notice Issued, Regularized) pair distinct colors with icons and explicit Marathi text badges. |
| **1.4.2 Audio Control** (Level A) | **Not Applicable** | The portal has no background audio or automatically playing sound. |
| **1.4.3 Contrast (Minimum)** (Level AA) | **Supports** | Text and images of text maintain a contrast ratio of at least 4.5:1 for standard text and 3:1 for large headings against background colors. A high-contrast theme toggle is also provided that delivers contrast ratios exceeding 7:1. |
| **1.4.4 Resize Text** (Level AA) | **Supports** | Users can resize text up to 200% without assistive technology using the dedicated accessibility toolbar (A-, A, A+) and browser zoom without loss of content or layout breakage. |
| **1.4.5 Images of Text** (Level AA) | **Supports** | Real text is utilized throughout the portal instead of raster text graphics. The official Government of Maharashtra and District Collectorate emblems contain explicit alt text descriptions. |
| **1.4.10 Reflow** (Level AA) | **Supports** | Content can be presented on screens as narrow as 320 CSS pixels without requiring two-dimensional scrolling. Tables and charts utilize responsive horizontal scroll containers with accessible summaries. |
| **1.4.11 Non-text Contrast** (Level AA) | **Supports** | Visual boundaries of active user interface components (inputs, buttons, tabs, sliders) and graphical icons have a contrast ratio of at least 3:1 against adjacent backgrounds. |
| **1.4.12 Text Spacing** (Level AA) | **Supports** | The application styles do not break or clip when user stylesheet overrides adjust line height to 1.5x, letter spacing to 0.12x, or word spacing to 0.16x font size. |
| **1.4.13 Content on Hover or Focus** (Level AA) | **Supports** | Informational tooltips and popovers are dismissible without moving hover (via Escape), hoverable without disappearing, and remain visible until dismiss trigger is activated. |

---

### Principle 2: Operable

User interface components and navigation must be operable.

#### Guideline 2.1 Keyboard Accessible

| Criteria | Conformance Level | Remarks and Explanations |
| :--- | :---: | :--- |
| **2.1.1 Keyboard** (Level A) | **Supports** | All functionality is operable through a keyboard interface without requiring specific timings for individual keystrokes. Menus, dropdowns, filters, upload triggers, and action buttons are focusable and operable via `Tab`, `Shift+Tab`, `Enter`, and `Space`. |
| **2.1.2 No Keyboard Trap** (Level A) | **Supports** | Keyboard focus within all modal dialogs (`AuthModal`, `DocUploadModal`, `ShasanJamaModal`, `AddHearingModal`, `RevenueShortcutGuideModal`) and drawers (`ParcelTraceDrawer`) is trapped while active using `useFocusTrap` and `focus-trap-react`. Users can exit any modal back to the calling trigger using the `Escape` key or close button. |
| **2.1.4 Character Key Shortcuts** (Level A) | **Supports** | No single character shortcuts are active when text inputs are in focus. Custom shortcuts require modifier combinations or are restricted to specific glossary guides. |

#### Guideline 2.2 Enough Time

| Criteria | Conformance Level | Remarks and Explanations |
| :--- | :---: | :--- |
| **2.2.1 Timing Adjustable** (Level A) | **Supports** | No unexpected session timeouts interrupt user workflow. Authentication tokens persist via secure cookies, and users receive clear warnings prior to session expiration. |
| **2.2.2 Pause, Stop, Hide** (Level A) | **Supports** | There is no moving, blinking, scrolling, or auto-updating information that starts automatically or lasts more than 5 seconds without user controls. |

#### Guideline 2.3 Seizures and Physical Reactions

| Criteria | Conformance Level | Remarks and Explanations |
| :--- | :---: | :--- |
| **2.3.1 Three Flashes or Below Threshold** (Level A) | **Supports** | No content flashes more than three times in any one second period. All animations are subtle CSS transitions adhering to `prefers-reduced-motion`. |

#### Guideline 2.4 Navigable

| Criteria | Conformance Level | Remarks and Explanations |
| :--- | :---: | :--- |
| **2.4.1 Bypass Blocks** (Level A) | **Supports** | A "Skip to main content" (मुख्य मजकुराकडे जा) link is provided as the very first focusable element on every page to bypass repeating navigation headers. |
| **2.4.2 Page Titled** (Level A) | **Supports** | Web pages have unique, descriptive, and informative `<title>` tags indicating the page purpose and the District Collectorate Chandrapur identity. |
| **2.4.3 Focus Order** (Level A) | **Supports** | When navigating sequentially through keyboard `Tab` stops, components receive focus in an order that preserves meaning and operability. |
| **2.4.4 Link Purpose (In Context)** (Level A) | **Supports** | The purpose of each link is determined from the link text alone or from its programmatic context. Links opening in new windows include accessible text warnings. |
| **2.4.5 Multiple Ways** (Level AA) | **Supports** | Users can locate information through multiple paths: the primary top navigation, the interactive sidebar, search inputs on parcels/hearings, and category filters. |
| **2.4.6 Headings and Labels** (Level AA) | **Supports** | Headings (`<h1>` through `<h4>`) and form labels clearly describe the topic, required data format, and section organization. |
| **2.4.7 Focus Visible** (Level AA) | **Supports** | Any keyboard operable user interface has an explicit mode of operation where the keyboard focus indicator is visible with a prominent 2px outline and offset (`focus-visible:ring-2 focus-visible:ring-blue-600` or `#fbbf24` in high-contrast mode). |

#### Guideline 2.5 Input Modalities

| Criteria | Conformance Level | Remarks and Explanations |
| :--- | :---: | :--- |
| **2.5.1 Pointer Gestures** (Level A) | **Supports** | All functionality can be operated with single pointer gestures without multipoint or path-based gestures. Pinch-to-zoom on maps provides alternative single-click zoom buttons (`+` and `-`). |
| **2.5.2 Pointer Cancellation** (Level A) | **Supports** | Completion of the function occurs on the up-event, allowing users to abort the action by moving the pointer away from the target before release. |
| **2.5.3 Label in Name** (Level A) | **Supports** | For all UI components with visual text labels, the accessible name matches or includes the text that is presented visually. |
| **2.5.4 Motion Actuation** (Level A) | **Not Applicable** | No functionality is actuated solely through device motion or orientation changes. |

---

### Principle 3: Understandable

Information and the operation of user interface must be understandable.

#### Guideline 3.1 Readable

| Criteria | Conformance Level | Remarks and Explanations |
| :--- | :---: | :--- |
| **3.1.1 Language of Page** (Level A) | **Supports** | The default human language of each web page is declared in the `<html>` element (`lang="mr"` or `lang="en"`). |
| **3.1.2 Language of Parts** (Level AA) | **Supports** | Official statutory legal phrases (e.g., Maharashtra Land Revenue Code, Suo-Moto, Class-II) and bilingual English/Marathi toggles are identified programmatically. |

#### Guideline 3.2 Predictable

| Criteria | Conformance Level | Remarks and Explanations |
| :--- | :---: | :--- |
| **3.2.1 On Focus** (Level A) | **Supports** | When any component receives focus, it does not initiate a change of context, submit a form, or open a dialog unexpectedly. |
| **3.2.2 On Input** (Level A) | **Supports** | Changing the setting of any input field does not automatically cause a change of context unless the user has been advised of the behavior beforehand. |
| **3.2.3 Consistent Navigation** (Level AA) | **Supports** | Navigational mechanisms that are repeated across multiple pages (TopBar, Sidebar, Footer) occur in the same relative order each time. |
| **3.2.4 Consistent Identification** (Level AA) | **Supports** | Components that have the same functionality (e.g., parcel status badges, export buttons, search bars) are identified consistently across the portal. |

#### Guideline 3.3 Input Assistance

| Criteria | Conformance Level | Remarks and Explanations |
| :--- | :---: | :--- |
| **3.3.1 Error Identification** (Level A) | **Supports** | If an input error is detected, the item that is in error is identified and the error is described to the user in text with `role="alert"` and `aria-live="assertive"`. |
| **3.3.2 Labels or Instructions** (Level A) | **Supports** | Labels or instructions are provided when content requires user input. Required fields are visibly marked with asterisks and designated with `aria-required="true"`. |
| **3.3.3 Error Suggestion** (Level AA) | **Supports** | If an input error is detected and suggestions for correction are known, the suggestions are provided to the user (e.g., password minimum requirements, valid 10-digit mobile format, supported file types). |
| **3.3.4 Error Prevention (Legal, Financial, Data)** (Level AA) | **Supports** | For web pages that cause legal commitments or modify government land tenure data (such as issuing Shasan Jama orders or initiating parcel disposals), submissions are reversible, verified for errors, or require explicit two-step confirmation dialogs. |

---

### Principle 4: Robust

Content must be robust enough that it can be reliably interpreted by a wide variety of user agents, including assistive technologies.

#### Guideline 4.1 Compatible

| Criteria | Conformance Level | Remarks and Explanations |
| :--- | :---: | :--- |
| **4.1.1 Parsing** (Level A) | **Supports** | Markup is validated against HTML5 specifications. Elements have complete start and end tags, elements are nested according to specification, and IDs are unique across pages. |
| **4.1.2 Name, Role, Value** (Level A) | **Supports** | For all user interface components (including modal dialogs, drawers, disclosure accordions, and custom select controls), the name and role can be programmatically determined; states, properties, and values can be set programmatically; and notification of changes is available to user agents. |
| **4.1.3 Status Messages** (Level AA) | **Supports** | Dynamic status messages (such as search result counts, filter changes, upload progress, and submission confirmations) are announced to screen readers using `aria-live="polite"` and `role="status"` without receiving focus. |

---

## DPDPA 2023 Statutory Compliance Matrix

The Digital Personal Data Protection Act, 2023 (DPDPA) mandates specific safeguards, rights, and responsibilities for Data Fiduciaries. The Chandrapur District Land Governance Portal conforms to the statutory requirements as follows:

| DPDPA 2023 Section | Statutory Requirement | Portal Implementation & Technical Verification | Conformance Status |
| :--- | :--- | :--- | :---: |
| **Section 4 & 5** (Notice & Grounds for Processing) | Clear notice of personal data collected, processing purpose, and legal grounds prior to consent. | Registration form in `AuthModal.jsx` provides unambiguous notice in Marathi and English with direct hyperlink to the Privacy Policy. | **Compliant** |
| **Section 6** (Consent Architecture) | Consent must be free, specific, informed, unconditional, and unambiguous with an affirmative action. No pre-ticked checkboxes. | Dedicated affirmative checkbox `[ ] मी चंद्रपूर जिल्हा महसूल प्रशासनाच्या गोपनीयता धोरणाशी...` is required before registration can proceed. Backend validates `consentGiven: true`, timestamping `consentAt: new Date()` and tracking `consentVersion: "1.0-2026"`. | **Compliant** |
| **Section 8** (General Obligations of Data Fiduciary) | Implement technical & organizational security measures; publish contact details of Data Protection Officer (DPO). | Full DPO designation details published on Privacy Policy and Accessibility Statement. JWT authentication with HttpOnly cookies, bcrypt password hashing, and role-based access control. | **Compliant** |
| **Section 11** (Right to Access Information About Personal Data) | Data Principal has right to obtain summary of personal data processed, identities of sharing entities, and export copy. | Self-service data export implemented: API endpoint `GET /api/auth/dpdpa/export` and client wrapper `api.exportData()` generate structured JSON downloads of personal profile, uploaded documents, hearings scheduled, and activity audit logs. | **Compliant** |
| **Section 12** (Right to Correction and Erasure) | Data Principal has right to request correction of inaccurate data and erasure of personal data no longer necessary. | Self-service erasure request pipeline implemented: API endpoint `POST /api/auth/dpdpa/erasure-request` and client wrapper `api.requestErasure()` allow users to initiate erasure subject to statutory land record retention rules under MLRC 1966. | **Compliant** |
| **Section 13** (Right of Grievance Redressal) | Readily available grievance redressal mechanism with defined SLA for resolution. | Published 72-hour grievance redressal SLA managed by the Nodal Resident Deputy Collector (निवासी उपजिल्हाधिकारी) and Data Protection Officer at `dpo.chandrapur@maharashtra.gov.in`. | **Compliant** |
| **Cookie & Storage Transparency** | Explicit consent for non-essential cookies and local cache storage. | Accessible `CookieConsentBanner.jsx` loaded across all routes; remembers choice in `chanda_cookie_consent`; provides full transparency on localStorage key usage. | **Compliant** |

---

## Assistive Technology Testing Matrix

The Chandrapur District Land Governance Portal was evaluated using the following assistive technologies and configurations:

| Assistive Technology | Browser | Operating System | Testing Scope | Status |
| :--- | :--- | :--- | :--- | :--- |
| **NVDA 2024.1** | Google Chrome 124+ | Windows 11 | Full portal navigation, AuthModal, DocUploadModal, GatSurveyLedgerTable, charts | **Passed (100%)** |
| **VoiceOver** | Safari 17+ | macOS Sonoma / iOS 17 | Responsive navigation, mobile drawer, touch targets, accessibility toolbar | **Passed (100%)** |
| **Keyboard Only** | Chrome / Firefox / Edge | Windows / Linux / macOS | Tab sequence, focus visible, focus trap in modals, Escape key dismissal | **Passed (100%)** |
| **axe-core 4.8.4** | Automated CI/CD | Node.js Environment | Automated WCAG 2.1 AA rule checks across all route pages | **0 Violations** |
| **Google Lighthouse** | Chrome DevTools | Chromium Engine | Accessibility Audit Category | **Score: 98/100** |

---

## Legal and Conformance Disclaimer

This Voluntary Product Accessibility Template (VPAT) is provided for informational and compliance purposes to demonstrate substantial conformance of the Chandrapur District Land Governance Portal with WCAG 2.1 Level AA, GIGW 3.0, and the Digital Personal Data Protection Act (DPDPA) 2023. Continuous audits are conducted by the National Informatics Centre (NIC) and District Collectorate Chandrapur technical teams.

*Authorized by:*  
**Office of the District Collector & District Magistrate, Chandrapur**  
Government of Maharashtra  
Dated: September 16, 2026
