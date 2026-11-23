import pdfmake from 'pdfmake';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure pdfmake security policies
pdfmake.setUrlAccessPolicy(() => false);
pdfmake.setLocalAccessPolicy(() => true);

const fontRegular = path.resolve(__dirname, '../../fonts/Nirmala.ttf');
const fontBold = path.resolve(__dirname, '../../fonts/NirmalaB.ttf');

pdfmake.setFonts({
  Nirmala: {
    normal: fontRegular,
    bold: fontBold,
    italics: fontRegular,
    bolditalics: fontBold,
  },
});

const docDefinition = {
  pageSize: 'A4',
  pageOrientation: 'portrait',
  pageMargins: [36, 40, 36, 45],
  defaultStyle: {
    font: 'Nirmala',
    fontSize: 9,
    lineHeight: 1.25,
    color: '#1e293b'
  },
  header: function(currentPage, pageCount) {
    if (currentPage === 1) return null;
    return {
      margin: [36, 15, 36, 0],
      columns: [
        { text: 'महाराष्ट्र शासन - जिल्हाधिकारी कार्यालय, चंद्रपूर (महसूल शाखा)', fontSize: 7.5, color: '#64748b' },
        { text: 'Portal Algorithm & Calculation Verification Specification', fontSize: 7.5, alignment: 'right', color: '#64748b' }
      ]
    };
  },
  footer: function(currentPage, pageCount) {
    return {
      margin: [36, 0, 36, 15],
      columns: [
        { text: 'अधिकृत तांत्रिक व महसूल प्रमाणीकरण अहवाल - चंद्रपूर जिल्हा', fontSize: 7.5, color: '#94a3b8' },
        { text: `पृष्ठ क्रमांक ${currentPage} / ${pageCount}`, fontSize: 7.5, alignment: 'right', color: '#64748b' }
      ]
    };
  },
  content: [
    // Header Banner
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              fillColor: '#1e3a8a',
              margin: [10, 10, 10, 10],
              stack: [
                { text: 'महाराष्ट्र शासन - महसूल व वन विभाग', alignment: 'center', fontSize: 11, bold: true, color: '#ffffff' },
                { text: 'जिल्हाधिकारी कार्यालय, चंद्रपूर', alignment: 'center', fontSize: 14, bold: true, color: '#ffffff', margin: [0, 2, 0, 2] },
                { text: 'जमीन महसूल अधिकार अभिलेख (७/१२) व १८ विषय पुस्तिका संगणकीय पडताळणी प्रणाली', alignment: 'center', fontSize: 9.5, bold: true, color: '#fbbf24' },
                { text: 'TECHNICAL AUDIT & ALGORITHM SPECIFICATION FOR VERIFICATION OFFICERS', alignment: 'center', fontSize: 8, color: '#e2e8f0', margin: [0, 3, 0, 0] }
              ]
            }
          ]
        ]
      },
      layout: 'noBorders'
    },
    { text: '', margin: [0, 5, 0, 5] },

    // Meta Details Box
    {
      table: {
        widths: ['25%', '25%', '25%', '25%'],
        body: [
          [
            { text: 'जिल्हा / कार्यक्षेत्र:', bold: true, fillColor: '#f1f5f9', fontSize: 8 },
            { text: 'चंद्रपूर (सर्व १५ तालुके)', fontSize: 8 },
            { text: 'दिनांक व वेळ:', bold: true, fillColor: '#f1f5f9', fontSize: 8 },
            { text: new Date().toLocaleDateString('mr-IN', { year: 'numeric', month: 'long', day: 'numeric' }), fontSize: 8 }
          ],
          [
            { text: 'एकूण भूखंड / ७/१२ संख्या:', bold: true, fillColor: '#f1f5f9', fontSize: 8 },
            { text: '४३,५४५+ भूखंड (थेट डेटाबेस)', fontSize: 8 },
            { text: 'प्रमाणीकरण उद्देश:', bold: true, fillColor: '#f1f5f9', fontSize: 8 },
            { text: 'महसूल अधिकारी तपासणी व खातरजमा', fontSize: 8 }
          ]
        ]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#cbd5e1',
        vLineColor: () => '#cbd5e1'
      }
    },

    { text: '', margin: [0, 6, 0, 6] },

    // Section 1
    { text: '१. प्रस्तावना व कायदेशीर अधिष्ठान (Legal & Statutory Framework)', style: 'secHeader' },
    {
      text: [
        'सदर प्रणाली चंद्रपूर जिल्ह्यातील १५ ही तालुक्यांमधील महसूल अधिकार अभिलेख (१९५० बंदोबस्त, एकत्रिकरण, चालू ७/१२) यांची ',
        { text: '४६ वैधानिक तपासणी मुद्द्यांनुसार (46 Checkpoints) ', bold: true },
        'पडताळणी करून शासन राजपत्रातील विहित १८ विषय पुस्तिका (Booklets) व बहुस्तरीय गोषवारा (Village, Taluka & District Ghoshwara) तयार करण्यासाठी विकसित करण्यात आलेली आहे. प्रणालीमधील सर्व आकडेमोड व निष्कर्ष खालील अधिनियमांवर आधारित आहेत:'
      ],
      style: 'bodyText'
    },
    {
      ul: [
        'महाराष्ट्र जमीन महसूल अधिनियम, १९६६ (MLRC 1966) - कलम ३६, ३६अ, व विविध योजना.',
        'मुंबई कुळवहिवाट व शेतजमीन (विदर्भ प्रदेश) अधिनियम, १९५८ - कलम २०, ८९ व ८९-अ.',
        'महाराष्ट्र शेतजमीन (जमीन धारणेची कमाल मर्यादा) अधिनियम, १९६१ (Agricultural Land Ceiling Act).',
        'महाराष्ट्र खाजगी वने (संपादन) अधिनियम, १९७५ व महाराष्ट्र पुनर्वसन अधिनियम, १९९९.'
      ],
      fontSize: 8.2,
      margin: [10, 2, 0, 6]
    },

    // Section 2
    { text: '२. डेटा निष्कर्षण व पार्सिंग अल्गोरिदम (Data Extraction & Ingestion Engine)', style: 'secHeader' },
    {
      text: [
        { text: 'अंमलबजावणी फाईल: ', bold: true },
        'backend/src/parsers/prapatraParserJs.js (Functions: parsePrapatraBuffer, cleanArea, normalizeTenure)'
      ],
      style: 'codeRef'
    },
    {
      text: 'तलाठी व मंडळ अधिकाऱ्यांनी भरलेल्या एक्सेल फाइल्समधून डेटा अचूक वाचण्यासाठी खालील पायऱ्या राबविल्या जातात:',
      style: 'bodyText'
    },
    {
      table: {
        widths: ['5%', '30%', '65%'],
        body: [
          [
            { text: 'क्र.', style: 'th' },
            { text: 'पायरी / घटक', style: 'th' },
            { text: 'अल्गोरिदम व अंमलबजावणी सूत्र', style: 'th' }
          ],
          [
            { text: '१', alignment: 'center' },
            { text: 'Dynamic Checkpoint Locator\n(तपासणी मुद्दे स्तंभ शोधणे)', bold: true },
            { text: 'एक्सेलच्या पहिल्या ८ ओळी तपासून ज्या ओळीत ५ व्या स्तंभापासून पुढे १ ते ४६ अंक आढळतात ती ओळ "Checkpoint Row" म्हणून निश्चित केली जाते व प्रत्येक मुद्द्याचा स्तंभ (Column Index Map) तयार केला जातो.' }
          ],
          [
            { text: '२', alignment: 'center' },
            { text: 'Landmark Column Anchoring\n(स्तंभ निश्चिती)', bold: true },
            { text: 'गावाचे नाव, सर्व्हे/गट क्र., भोगवटदार वर्ग, भोगवटदाराचे नाव, इतर अधिकार हे मुख्य स्तंभ स्वयंचलित भाषिक (Marathi regex) शोध तंत्राने शोधले जातात.' }
          ],
          [
            { text: '३', alignment: 'center' },
            { text: 'Dual-Area Calculation\n(क्षेत्रफळ रूपांतरण सूत्र)', bold: true },
            { text: 'कृषक क्षेत्र (हे.आर.) व अकृषक क्षेत्र (चौ.मी.) असल्यास एकूण क्षेत्र हेक्टरमध्ये काढण्याचे सूत्र:\nएकूण क्षेत्र (हे.) = कृषक क्षेत्र + (अकृषक क्षेत्र / १०,०००)\nTotal Area (Ha) = AgriArea + (NA_Area_SqM / 10000.0) [४ दशांशात राउंडऑफ]' }
          ],
          [
            { text: '४', alignment: 'center' },
            { text: 'Tenure Normalization\n(भोगवटदार वर्ग वर्गीकरण)', bold: true },
            { text: 'भोगवटदाराचे नाव, भूधारणा व इतर अधिकारातील नोंदींच्या आधारे मानकीकरण:\n• शासन/गायरान/पहाड/खडक -> SARKAR_SHASAN\n• वन/झुडपी -> FOREST_JANGAL | देवस्थान/इनाम -> DEVASTHAN_INAM\n• आदिवासी/शर्तभंग/३६अ -> BHOGVATDAR_CLASS_2\n• नियमित/भूमिस्वामी -> BHOGVATDAR_CLASS_1' }
          ],
          [
            { text: '५', alignment: 'center' },
            { text: 'Footer Signatures Detection\n(शेरा व स्वाक्षरी मर्यादा)', bold: true },
            { text: '"माहिती तयार करणारा तलाठी", "मंडळ अधिकारी स्वाक्षरी", "तहसीलदार स्वाक्षरी" हे शब्द आढळताच डेटा ओळींची मर्यादा संपवून सुरक्षितपणे डेटा बंद केला जातो.' }
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 3, 0, 8]
    },

    // Section 3
    { text: '३. ४६-मुद्दे तपासणी व १८ विषय पुस्तिका वर्गीकरण (Checklist & Booklet Logic)', style: 'secHeader' },
    {
      text: [
        { text: 'अंमलबजावणी फाईल: ', bold: true },
        'backend/src/utils/masterBookletGenerator.js (resolveParcel46Points) व backend/src/utils/booklet18Definitions.js'
      ],
      style: 'codeRef'
    },
    {
      text: 'प्रत्येक भूखंडाची (Land Parcel) तपासणी करून त्यास १८ पैकी योग्य विषय पुस्तिकेत समाविष्ट केले जाते:',
      style: 'bodyText'
    },
    {
      ul: [
        'मुद्दा क्र. १ ते ३ (१९५० बंदोबस्त): बंदोबस्त नंबर, मूळ खातेदाराचे नाव व मूळ भूधारणा.',
        'मुद्दा क्र. ४ ते ६ (१९७२ एकत्रिकरण): एकत्रिकरण नंबर, तत्कालीन भोगवटदार व भूधारणा.',
        'मुद्दा क्र. ७ ते ९ (१९९५ पुनर्मोजणी ७/१२): पुनर्मोजणी गट नंबर, सद्य भोगवटदार व भूधारणा.',
        'मुद्दा क्र. १० ते १९ (शासकीय जमिनी): गायरान, वन, पहाड, अतिक्रमण, वाटप व अवैध शासन नोंद कमी असणे.',
        'मुद्दा क्र. २० ते ३५ (१८ वैधानिक विषय): कुळ जमीन, इनाम/वतन, भूमिहीन वाटप, सिलिंग, गुरचरण, आदिवासी (मुद्दा २७), पुनर्वसन, भूदान (मुद्दा ३०), खाजगी वने, वक्फ, भूसंपादन इत्यादी.',
        'मुद्दा क्र. ३६ ते ४६ (शर्तभंग व अवैध बदल): सक्षम परवानगीशिवाय वर्ग २ मधून १ मध्ये बदल (मुद्दा ३६), शर्तभंग (मुद्दा ३७), आदिवासी ते गैर-आदिवासी बेकायदेशीर हस्तांतरण (मुद्दा ३९), कंपनी कलम ८९/८९-अ परवानगी व वापर पडताळणी (मुद्दा ४१ ते ४५).'
      ],
      fontSize: 8.2,
      margin: [10, 2, 0, 6]
    },

    // Section 4
    { text: '४. डायनॅमिक गोषवारा गणना अल्गोरिदम (Dynamic Ghoshwara Rollup Engine)', style: 'secHeader' },
    {
      text: [
        { text: 'अंमलबजावणी फाईल: ', bold: true },
        'backend/src/controllers/prapatraController.js (calculateDynamicGoshwaraRollup - Lines 290-630)'
      ],
      style: 'codeRef'
    },
    {
      text: 'गोषवारा (Ghoshwara) हा ३ पातळ्यांवर (Village, Taluka, District) अचूक आकडेमोड करतो. यात डेटाबेस लेव्हलवर सिंगल-पास पॅरामीटराइज्ड SQL Aggregation वापरले जाते:',
      style: 'bodyText'
    },
    {
      table: {
        widths: ['25%', '35%', '40%'],
        body: [
          [
            { text: 'गोषवारा स्तंभ (Column)', style: 'th' },
            { text: 'संख्या गणना (Count SQL)', style: 'th' },
            { text: 'क्षेत्रफळ गणना (Area SQL)', style: 'th' }
          ],
          [
            { text: 'एकूण ७/१२ व क्षेत्रफळ', bold: true },
            { text: 'COUNT(*)::int' },
            { text: 'COALESCE(SUM(total_area_ha), 0)::float' }
          ],
          [
            { text: 'भोगवटदार वर्ग - १', bold: true },
            { text: "COUNT(CASE WHEN tenure_class = 'BHOGVATDAR_CLASS_1' THEN 1 END)" },
            { text: "SUM(CASE WHEN tenure_class = 'BHOGVATDAR_CLASS_1' THEN total_area_ha ELSE 0 END)" }
          ],
          [
            { text: 'भोगवटदार वर्ग - २', bold: true },
            { text: "COUNT(CASE WHEN tenure_class = 'BHOGVATDAR_CLASS_2' THEN 1 END)" },
            { text: "SUM(CASE WHEN tenure_class = 'BHOGVATDAR_CLASS_2' THEN total_area_ha ELSE 0 END)" }
          ],
          [
            { text: 'अवैध वर्ग २ मधून वर्ग १ रूपांतर', bold: true },
            { text: "COUNT(CASE WHEN (metadata->'flags'->>'isShartbhang' = 'true' AND tenure_class = 'BHOGVATDAR_CLASS_1') OR otherRights LIKE '%रूपांतर%' THEN 1 END)" },
            { text: 'SUM(रूपांतरित क्षेत्रफळ हे.आर.)' }
          ],
          [
            { text: 'इतर अधिकारात नोंद नसलेल्या', bold: true },
            { text: "COUNT(CASE WHEN otherRights IS NULL OR otherRights = '' OR otherRights = '-' THEN 1 END)" },
            { text: 'SUM(नोंद नसलेल्या जमिनींचे क्षेत्र)' }
          ],
          [
            { text: 'अवैधरित्या नोंद कमी केलेल्या', bold: true },
            { text: "COUNT(CASE WHEN isIllegalDeletion = 'true' OR point_40 = 'होय' THEN 1 END)" },
            { text: 'SUM(नोंद कमी केलेल्या जमिनींचे क्षेत्र)' }
          ],
          [
            { text: 'आदिवासी ते गैर-आदिवासी हस्तांतरण (पुस्तिका ९)', bold: true },
            { text: "COUNT(CASE WHEN isTribal = 'true' AND (point_39 = 'होय' OR violation_type = 'TRIBAL_LAND_VIOLATION') THEN 1 END)" },
            { text: 'SUM(हस्तांतरित आदिवासी क्षेत्र)' }
          ],
          [
            { text: 'कंपनी कलम ८९/८९-अ शर्तभंग (पुस्तिका १८)', bold: true },
            { text: "COUNT(CASE WHEN point_44 = 'नाही' OR point_45_usage = 'होय' OR point_45_transfer = 'होय' THEN 1 END)" },
            { text: 'SUM(शर्तभंग झालेले औद्योगिक क्षेत्र)' }
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 3, 0, 8]
    },

    // Section 5
    { text: '५. विषय पुस्तिकेनुसार गोषवारा स्वरूप (Ghoshwara Architecture)', style: 'secHeader' },
    {
      text: [
        { text: 'अंमलबजावणी फाईल: ', bold: true },
        'backend/src/utils/booklet18Definitions.js (getGoshwaraConfigForBooklet - Lines 351-450)'
      ],
      style: 'codeRef'
    },
    {
      text: 'सर्व १८ पुस्तिकांमध्ये पहिले ४ स्तंभ स्थिर (Fixed Standalone) असतात: (१) अ.क्र. (२) गाव/तालुका नाव (३) एकूण सर्व्हे/गट संख्या (४) एकूण क्षेत्र (हे.आर.). यानंतर विषयानुसार खालीलप्रमाणे स्तंभ जोडले जातात:',
      style: 'bodyText'
    },
    {
      table: {
        widths: ['18%', '14%', '68%'],
        body: [
          [
            { text: 'पुस्तिका प्रकार', style: 'th' },
            { text: 'एकूण स्तंभ', style: 'th' },
            { text: 'वैधानिक जोडलेले दुहेरी स्तंभ (प्रत्येकी संख्या + क्षेत्र)', style: 'th' }
          ],
          [
            { text: 'STANDARD\n(पुस्तिका १-६, ८, १०, ११, १३)', bold: true },
            { text: '१४ स्तंभ', alignment: 'center' },
            { text: '• वर्ग १ जमिनी • वर्ग २ जमिनी • अवैध वर्ग २ मधून वर्ग १ • इतर अधिकारात नोंद नसलेल्या • अवैध नोंद कमी केलेल्या' }
          ],
          [
            { text: 'TRIBAL\n(पुस्तिका ९ - आदिवासी)', bold: true },
            { text: '१८ स्तंभ', alignment: 'center' },
            { text: '• वर्ग १ • वर्ग २ • वर्ग २ ते १ रूपांतरण • नोंद नसलेल्या • नोंद कमी केलेल्या • आदिवासी ते आदिवासी हस्तांतरण • आदिवासी ते गैर-आदिवासी अवैध हस्तांतरण' }
          ],
          [
            { text: 'BHUDAN\n(पुस्तिका १२ - भूदान)', bold: true },
            { text: '१६ स्तंभ', alignment: 'center' },
            { text: '• वर्ग १ • वर्ग २ • वर्ग २ ते १ रूपांतरण • नोंद नसलेल्या • नोंद कमी केलेल्या • अनधिकृत हस्तांतरण झालेल्या जमिनी' }
          ],
          [
            { text: 'BREACH\n(पुस्तिका १४ ते १७)', bold: true },
            { text: '१६ स्तंभ', alignment: 'center' },
            { text: '• वर्ग १ • वर्ग २ • वर्ग २ ते १ रूपांतरण • नोंद नसलेल्या • नोंद कमी केलेल्या • शर्तभंग झालेल्या जमिनी' }
          ],
          [
            { text: 'COMPANY HOLDING\n(पुस्तिका १८ - कलम ८९/८९-अ)', bold: true },
            { text: '१४ स्तंभ', alignment: 'center' },
            { text: '• कंपनीने परवानगी घेतलेली • कंपनी विनापरवानगी धारण • वापराबाबत शर्तभंग • हस्तांतरणाबाबत शर्तभंग • इतर अधिकारात नोंद' }
          ],
          [
            { text: 'DP / GURCHARAN\n(पुस्तिका ७ - गुरचरण)', bold: true },
            { text: '८ स्तंभ', alignment: 'center' },
            { text: '• इतर अधिकारात नोंद नसलेल्या जमिनी • अवैधरित्या इतर अधिकारामधून नोंद कमी केलेल्या जमिनी' }
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 3, 0, 8]
    },

    // Section 6
    { text: '६. एक्सेल व पीडीएफ अहवाल निर्मिती पद्धती (Dual-Sheet Export Engine)', style: 'secHeader' },
    {
      text: [
        { text: 'अंमलबजावणी फाईल: ', bold: true },
        'backend/src/utils/masterBookletGenerator.js (generateCategoryBookletExcel & generateCategoryBookletPdf)'
      ],
      style: 'codeRef'
    },
    {
      text: 'पोर्टलवरून डाऊनलोड होणाऱ्या प्रत्येक विषय पुस्तिकेत खालीलप्रमाणे २ शीट्स विहित शासकीय रचनेनुसार तयार होतात:',
      style: 'bodyText'
    },
    {
      ul: [
        { text: 'शीट १ (सविस्तर यादी - Actual Data): यात निवडलेल्या गाव/तालुक्यातील सर्व संबंधित गट क्रमांकांची सविस्तर माहिती, चालू खातेदार, मूळ १९५० नोंद, क्षेत्र, व शर्तभंग शेरा असतो. क्षेत्राच्या रकान्याखाली स्वयंचलित एक्सेल सूत्र (=SUM(...)) जोडलेले असते.', fontSize: 8.2 },
        { text: 'शीट २ (गोषवारा - Rollup Summary): यात ३ स्वतंत्र सारण्या (Tables) समाविष्ट असतात: (१) गावाचा गोषवारा (२) तालुक्याचा गोषवारा (३) संपूर्ण चंद्रपूर जिल्हा एकत्रित गोषवारा.', fontSize: 8.2 },
        { text: 'शासकीय स्वाक्षरी विभाग: तलाठी (माहिती तयार करणारा), मंडळ अधिकारी (माहिती तपासणी अधिकारी) व तहसीलदार यांच्या विहित स्वाक्षरी रकान्यांची रचना समाविष्ट आहे.', fontSize: 8.2 }
      ],
      margin: [10, 2, 0, 8]
    },

    // Sign-off verification block
    { text: '', margin: [0, 10, 0, 0] },
    {
      table: {
        widths: ['33%', '34%', '33%'],
        body: [
          [
            { text: 'माहिती व अल्गोरिदम तयार करणारा:\n\n\n___________________________\nप्रणाली विश्लेषक / तांत्रिक पथक\nजिल्हाधिकारी कार्यालय, चंद्रपूर', alignment: 'center', fontSize: 8 },
            { text: 'पडताळणी व तांत्रिक तपासणी:\n\n\n___________________________\nनायब तहसीलदार / मंडळ अधिकारी\nमहसूल शाखा, चंद्रपूर', alignment: 'center', fontSize: 8 },
            { text: 'प्रमाणीकरण व अंतिम मंजुरी:\n\n\n___________________________\nउपविभागीय अधिकारी / तहसीलदार\nजिल्हा चंद्रपूर', alignment: 'center', fontSize: 8 }
          ]
        ]
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#94a3b8',
        vLineColor: () => '#94a3b8'
      }
    }
  ],
  styles: {
    secHeader: {
      fontSize: 10,
      bold: true,
      color: '#1e3a8a',
      margin: [0, 6, 0, 3],
      decoration: 'underline'
    },
    bodyText: {
      fontSize: 8.3,
      lineHeight: 1.25,
      margin: [0, 1, 0, 3]
    },
    codeRef: {
      fontSize: 7.5,
      color: '#0f766e',
      margin: [0, 0, 0, 3]
    },
    th: {
      fontSize: 8,
      bold: true,
      fillColor: '#1e3a8a',
      color: '#ffffff',
      alignment: 'center',
      margin: [2, 3, 2, 3]
    }
  }
};

async function generatePdf() {
  console.log('Generating PDF verification document...');
  const printer = pdfmake.createPdf(docDefinition);
  const buffer = await printer.getBuffer();

  // 1. Save to root directory
  const rootPath = path.resolve(__dirname, '../../../CHANDRAPUR_LAND_RECORDS_PORTAL_ALGORITHM_VERIFICATION_REPORT.pdf');
  fs.writeFileSync(rootPath, buffer);
  console.log('Saved to root:', rootPath);

  // 2. Save to frontend public directory for instant web download
  const publicPath = path.resolve(__dirname, '../../../frontend/public/CHANDRAPUR_LAND_RECORDS_PORTAL_ALGORITHM_VERIFICATION_REPORT.pdf');
  fs.writeFileSync(publicPath, buffer);
  console.log('Saved to frontend/public:', publicPath);

  console.log('PDF generation complete. Total size:', buffer.length, 'bytes');
}

generatePdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
