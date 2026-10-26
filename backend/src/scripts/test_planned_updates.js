import prisma from '../config/prisma.js';

async function main() {
  console.log('Testing planned updates for unique constraint collisions...');

  // 1. List of Rollup Updates (id -> newName)
  const rollupUpdates = [
    // Warora
    { id: '6f41d021-278a-4024-8c2d-f12de890c16c', taluka: 'Warora', newName: 'अंतापूर रिठ' },
    // Ballarpur
    { id: '0c353f39-bd42-4f2a-9650-09f0b90b572e', taluka: 'Ballarpur', newName: 'निमगटा चक' },
    { id: 'fccbb71f-966c-4839-b658-e54e34d8309e', taluka: 'Ballarpur', newName: 'दाहेली' },
    { id: 'd2168d8f-4f32-48bd-a411-76b14210c546', taluka: 'Ballarpur', newName: 'दुधोली' },
    { id: 'd2741791-29de-46b2-ad77-27d11e9e5968', taluka: 'Ballarpur', newName: 'केमरीठ' },
    // Jivati
    { id: '0e14a580-b9c9-4795-a443-8623b4a91969', taluka: 'Jivati', newName: 'टेकामांडवा' },
    // Sindewahi
    { taluka: 'Sindewahi', oldName: 'कटगधर', newName: 'काटगधरा' },
    // Korpana
    { id: 'f267a849-d912-4546-8077-3c6c108aed8b', taluka: 'Korpana', newName: 'धुनकी (भाग २)' },
    // Pombhurna
    { id: 'e7794c76-4027-4de8-849e-8e18196a437f', taluka: 'Pombhurna', newName: 'चक फुटाणा (भाग २)' },
    // Brahmapuri
    { id: 'a6ea7655-1a47-4b53-b496-e3cb3f70649a', taluka: 'Brahmapuri', newName: 'गायडोंगरी तुकुम' },
    // Rajura
    { id: '59e217dd-a3e8-4328-bcbb-e0f87d94f5f4', taluka: 'Rajura', newName: 'बोटगाव' },
    { id: '0d926480-ea4d-49b2-8523-018411e9606b', taluka: 'Rajura', newName: 'हरदोना बु' },
    { id: '4fd067c8-44ee-45c7-8a12-39645e1d7de8', taluka: 'Rajura', newName: 'भेंडाळा' },
    { id: '20973edd-b13a-4217-af82-0e5af961a723', taluka: 'Rajura', newName: 'मनगाव' },
    { id: 'b3684131-7c49-4dba-a028-4d30d49688da', taluka: 'Rajura', newName: 'बाबापूर' },
    { id: 'd924037e-3218-4e50-a67d-0365b9c3dd96', taluka: 'Rajura', newName: 'निर्ली' },
    { id: '3d1a66b3-c0f9-4748-b543-d95ba9edabe8', taluka: 'Rajura', newName: 'बाम्बेझरी' },
    // Bhadravati 6 mismatches
    { id: '1d54552a-5be0-4de2-98a7-f93f55ce9d61', taluka: 'Bhadravati', newName: 'तिरुर' },
    { id: '4ac38346-2329-4e4d-98d1-b278fdc97421', taluka: 'Bhadravati', newName: 'आंबेझरी रीठ' },
    { id: 'cf4bc2f4-3315-428c-926d-3e76327ccdd5', taluka: 'Bhadravati', newName: 'चिचोली सरकार' },
    { id: '6fd046f7-4935-4260-a7c4-a6ae7ecf8588', taluka: 'Bhadravati', newName: 'बोटेझरी' },
    { id: 'f24ec183-892a-4595-9582-17d33a39d679', taluka: 'Bhadravati', newName: 'नंदोरी खुर्द' },
    { id: 'e8a42376-fdce-4283-904a-258c0a24ad59', taluka: 'Bhadravati', newName: 'चोपन रिठ' },
  ];

  for (const u of rollupUpdates) {
    const existing = await prisma.prapatraRollup.findFirst({
      where: {
        taluka: u.taluka,
        villageName: u.newName,
        ...(u.id ? { id: { not: u.id } } : {})
      }
    });

    if (existing) {
      console.error(`COLLISION DETECTED for taluka "${u.taluka}": name "${u.newName}" already exists (id: ${existing.id})!`);
    } else {
      console.log(`OK: [${u.taluka}] -> "${u.newName}"`);
    }
  }
}

main().finally(() => prisma.$disconnect());
