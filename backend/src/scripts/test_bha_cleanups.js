import prisma from '../config/prisma.js';

async function main() {
  const bhaCleanups = [
    { oldName: 'महसूल अधिकार अभिलेख अंतीमआष्टी (तुकुम )', newName: 'अंतीमआष्टी (तुकुम)' },
    { oldName: 'महसूल अधिकार अभिलेख मासळ विसापुर', newName: 'मासळ विसापुर' },
    { oldName: 'महसूल अधिकार अभिलेख  कार्लिसोनेगाव', newName: 'कार्लिसोनेगाव' },
    { oldName: 'चंदन खेडा मक्ता महसूल अधिकार अभिलेख', newName: 'चंदनखेडा मक्ता' },
    { oldName: 'महादापूर रिठ महसूल अधिकार अभिलेख', newName: 'महादापूर रिठ' },
    { oldName: 'महसूल अधिकार अभिलेख अंतीम  आष्टी(काकडे )', newName: 'अंतीम आष्टी (काकडे)' },
    { oldName: 'महसूल अधिकार अभिलेख अंतीम मांगली रै', newName: 'अंतीम मांगली रै' },
    { oldName: 'महसूल अधिकार अभिलेख Bhatali', newName: 'भटाळी' },
    { oldName: 'महसूल अधिकार अभिले', newName: 'गोवर्धन' },
    { oldName: 'महसूल अधिकार अभिलेख', newName: 'जेना' },
    { oldName: 'मुदयांची माहीती बोरगाव रिठ 2026', newName: 'बोरगाव रिठ (२)' },
    { oldName: 'मुदयांची माहीती सायवन2026', newName: 'सायवन' },
    { oldName: 'खुटवंडा मरार.xls', newName: 'खुटवंडा मरार' },
    { oldName: 'xls bhamdeli रै.xls', newName: 'भामडेली रै' },
    { oldName: 'xls JUNONA.xls', newName: 'जुनाना' },
    { oldName: 'xls टेकडी दि.xls', newName: 'टेकडी दि' },
    { oldName: 'ते 15  किन्हाळा महसूल अधिकार अभिलेख', newName: 'किन्हाळा' },
    { oldName: 'sitarampeth.xls', newName: 'सितारामपेठ' },
    { oldName: 'Ashati Rith 1 te 45', newName: 'आष्टी रिठ' },
    { oldName: 'Gothala rith', newName: 'गोटाळा रिठ' },
    { oldName: 'Hardala Rith 1 te 45', newName: 'हरदाळा रिठ' },
    { oldName: 'Khandala rith 1 te 45', newName: 'खंडाळा रिठ' },
    { oldName: 'Panwadala  1 te 45', newName: 'पानवडाळा' },
    { oldName: 'Takli 1 te 45', newName: 'टाकळी' },
    { oldName: 'Dewada', newName: 'देवाडा' },
    { oldName: 'Thetegaon', newName: 'थेटेगाव' },
    { oldName: 'khapari', newName: 'खापरी' },
    { oldName: 'chak khapari', newName: 'चक खापरी' },
    { oldName: 'sumthana', newName: 'सुमताना' }
  ];

  for (const item of bhaCleanups) {
    const existing = await prisma.prapatraRollup.findFirst({
      where: { taluka: 'Bhadravati', villageName: item.newName }
    });
    if (existing) {
      console.error(`COLLISION in Bhadravati: ${item.newName} already exists!`);
    } else {
      console.log(`OK: Bhadravati -> ${item.newName}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
