import prisma from '../config/prisma.js';

async function main() {
  // Let's check each of the remaining 23 items from inspect_remaining_20
  const remainingIds = [
    '0c353f39-bd42-4f2a-9650-09f0b90b572e', // Ballarpur
    '1d54552a-5be0-4de2-98a7-f93f55ce9d61', // Bhadravati
    'cf4bc2f4-3315-428c-926d-3e76327ccdd5', // Bhadravati
    '704a1846-c0a7-4faf-a46a-d331ada6f61d', // Chimur
    '4ac38346-2329-4e4d-98d1-b278fdc97421', // Bhadravati
    '6fd046f7-4935-4260-a7c4-a6ae7ecf8588', // Bhadravati
    'f24ec183-892a-4595-9582-17d33a39d679', // Bhadravati
    'e8a42376-fdce-4283-904a-258c0a24ad59', // Bhadravati
    '3e684f16-c739-452c-b451-ef63388c7ca2', // Chimur (0)
    'cdba9ac1-0451-42dd-b8ea-ede8e158e866', // Chimur (0)
    'a6ea7655-1a47-4b53-b496-e3cb3f70649a', // Brahmapuri
    'b4058034-7f37-414c-9cf7-8d9df487b5c3', // Brahmapuri (0)
    'e7794c76-4027-4de8-849e-8e18196a437f', // Pombhurna
    '59e217dd-a3e8-4328-bcbb-e0f87d94f5f4', // Rajura
    'f267a849-d912-4546-8077-3c6c108aed8b', // Korpana
    '0d926480-ea4d-49b2-8523-018411e9606b', // Rajura
    'd924037e-3218-4e50-a67d-0365b9c3dd96', // Rajura
    '4fd067c8-44ee-45c7-8a12-39645e1d7de8', // Rajura
    '20973edd-b13a-4217-af82-0e5af961a723', // Rajura
    'b3684131-7c49-4dba-a028-4d30d49688da', // Rajura
    '3d1a66b3-c0f9-4748-b543-d95ba9edabe8', // Rajura
    '0e14a580-b9c9-4795-a443-8623b4a91969', // Jivati
    '6f41d021-278a-4024-8c2d-f12de890c16c'  // Warora
  ];

  const rollups = await prisma.prapatraRollup.findMany({
    where: { id: { in: remainingIds } }
  });

  console.log(`Found ${rollups.length} rollups to resolve:`);
  for (const r of rollups) {
    console.log(`- [${r.taluka}] ID: ${r.id} | Name: "${r.villageName}" | total712: ${r.total712Count}`);
  }
}

main().finally(() => prisma.$disconnect());
