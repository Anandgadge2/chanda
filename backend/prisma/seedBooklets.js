import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding dedicated Booklet records for Ceiling, Bhudan, Tribal, and Tenancy 89-A...');

  // Get existing parcels
  const waroraParcel = await prisma.landParcel.findFirst({ where: { taluka: 'Warora' } });
  const ballarpurParcel = await prisma.landParcel.findFirst({ where: { taluka: 'Ballarpur' } });
  const rajuraParcel = await prisma.landParcel.findFirst({ where: { taluka: 'Rajura' } });
  const chandrapurParcel = await prisma.landParcel.findFirst({ where: { taluka: 'Chandrapur' } });
  const chimurParcel = await prisma.landParcel.findFirst({ where: { taluka: 'Chimur' } });
  const bhadravatiParcel = await prisma.landParcel.findFirst({ where: { taluka: 'Bhadravati' } });

  // 1. Ceiling Records (प्रपत्र - १)
  if (waroraParcel) {
    await prisma.ceilingRecord.upsert({
      where: { id: '11111111-1111-1111-1111-111111111111' },
      update: {},
      create: {
        id: '11111111-1111-1111-1111-111111111111',
        parcelId: waroraParcel.id,
        originalAllotteeName: 'बाबुराव बाळकृष्ण पाटील (Baburao B. Patil)',
        allotmentFerfar: 'F-12',
        currentLandStatus: 'कृषक (Agricultural)',
        isBreachOfCondition: true,
        unauthorizedTransfer: true,
        changeOfUse: false,
        class2ToClass1: false,
        remarks: 'कलम ४४ अन्वये अकृषक विनापरवानगी; शर्तभंग कारवाई सुरू (SDO/REV/WAR/2024/101)',
      },
    });
  }

  if (bhadravatiParcel) {
    await prisma.ceilingRecord.upsert({
      where: { id: '11111111-1111-1111-1111-111111111112' },
      update: {},
      create: {
        id: '11111111-1111-1111-1111-111111111112',
        parcelId: bhadravatiParcel.id,
        originalAllotteeName: 'आनंदराव कृष्णाजी टेकाडे (Anandrao K. Tekade)',
        allotmentFerfar: 'F-05',
        currentLandStatus: 'कृषक (Agricultural)',
        isBreachOfCondition: false,
        unauthorizedTransfer: false,
        changeOfUse: false,
        class2ToClass1: true,
        remarks: 'नियमानुकूल भोगवटा वर्ग-२ चे वर्ग-१ रूपांतरण मंजुरी आदेश क्र. मह/कावि/२२/२०२१',
      },
    });
  }

  // 2. Bhudan Records (प्रपत्र - २)
  if (ballarpurParcel) {
    await prisma.bhudanRecord.upsert({
      where: { id: '22222222-2222-2222-2222-222222222221' },
      update: {},
      create: {
        id: '22222222-2222-2222-2222-222222222221',
        parcelId: ballarpurParcel.id,
        relationshipWithOriginalAllottee: 'मुलगा (वारसदार - Son / Heir)',
        allotmentFerfar: 'F-18',
        currentLandStatus: 'कृषक (Agricultural)',
        isBreachOfCondition: true,
        unauthorizedTransfer: false,
        changeOfUse: false,
        class2ToClass1: false,
        remarks: 'पोकळीस्त नोंद (Pokalist Entry) आढळली; भूदान समिती अभिलेख पडताळणी सुरू',
      },
    });
  }

  if (chimurParcel) {
    await prisma.bhudanRecord.upsert({
      where: { id: '22222222-2222-2222-2222-222222222222' },
      update: {},
      create: {
        id: '22222222-2222-2222-2222-222222222222',
        parcelId: chimurParcel.id,
        relationshipWithOriginalAllottee: 'मूळ वाटपदार (Original Allottee)',
        allotmentFerfar: 'F-02',
        currentLandStatus: 'कृषक',
        isBreachOfCondition: false,
        unauthorizedTransfer: false,
        changeOfUse: false,
        class2ToClass1: false,
        remarks: 'भूदान मंडळाच्या मूळ संमतीनुसार नियमित वहीवाट चालू',
      },
    });
  }

  // 3. Tribal Records (प्रपत्र - ३)
  if (rajuraParcel) {
    await prisma.tribalRecord.upsert({
      where: { id: '33333333-3333-3333-3333-333333333331' },
      update: {},
      create: {
        id: '33333333-3333-3333-3333-333333333331',
        parcelId: rajuraParcel.id,
        originalHolderOrHeir: 'मारोती रामजी आत्राम (Maroti Ramji Atram - गोंड आदिवासी)',
        currentOccupant: 'सुरेश देवराव वानखेडे (गैरआदिवासी खरेदीदार)',
        permissionStatus: 'नाही (विनापरवानगी / Unapproved)',
        tribalToTribal: false,
        tribalToNonTribal: true,
        unauthorizedTransfer: true,
        changeOfUse: false,
        class2ToClass1: false,
        remarks: 'महाराष्ट्र जमीन महसूल संहिता कलम ३६/३६अ चे उल्लंघन; जमीन मूळ आदिवासी मालकास पुनर्सर्पित करण्याची प्रक्रिया प्रलंबित (SDO/RAJ/TRI/2024/45)',
      },
    });
  }

  // 4. Tenancy Sec 89-A Records (प्रपत्र - ४)
  if (chandrapurParcel) {
    await prisma.tenancy89ARecord.upsert({
      where: { id: '44444444-4444-4444-4444-444444444441' },
      update: {},
      create: {
        id: '44444444-4444-4444-4444-444444444441',
        parcelId: chandrapurParcel.id,
        companyName: 'रिलायबल लॉजिस्टिक्स अँड इन्फ्रास्ट्रक्चर प्रा. लि. (Reliable Logistics & Infra Pvt Ltd)',
        purchaseDate: new Date('2018-04-12'),
        isGenuineIndustrialUse: true,
        currentLandStatus: 'औद्योगिक (गोदाम व वेअरहाऊस कार्यान्वित)',
        remarks: 'कलम ८९-अ अंतर्गत खरेदी; मुदतीत औद्योगिक वापर सुरू केल्याचे उद्योग संचालनालय प्रमाणपत्र प्राप्त',
      },
    });
  }

  console.log('✅ Successfully seeded authentic booklet data for all 4 statutory forms!');
}

main()
  .catch((e) => {
    console.error('Error seeding booklets:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
