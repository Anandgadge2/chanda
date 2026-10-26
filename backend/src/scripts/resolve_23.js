import fs from 'fs';

const master = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_master_filelist.json', 'utf8'));
const parcels = JSON.parse(fs.readFileSync('d:/chanda/data/all_talukas_parcels.json', 'utf8'));

const targets = [
  { taluka: 'Ballarpur', name: 'नवनिर्मित चक १ (Navnirmit Chak 1)' },
  { taluka: 'Bhadravati', name: 'बरगव रठ' },
  { taluka: 'Bhadravati', name: 'चर .' },
  { taluka: 'Bhadravati', name: 'परड रठ' },
  { taluka: 'Bhadravati', name: 'खटवड मरर.xls' },
  { taluka: 'Bhadravati', name: 'नदर खरद xlsx' },
  { taluka: 'Bhadravati', name: 'नदर ब xlsx' },
  { taluka: 'Chimur', name: 'रीमतमजरा' },
  { taluka: 'Brahmapuri', name: 'तुलान चक' },
  { taluka: 'Pombhurna', name: 'चक फटण FINAL सतबर' },
  { taluka: 'Korpana', name: 'धुनकी 54  final' },
  { taluka: 'Rajura', name: 'आरव' },
  { taluka: 'Rajura', name: '1 त 45 मदद तपसण भडळ' },
  { taluka: 'Rajura', name: '1 त 45 मदद तपसण मनगव' },
  { taluka: 'Rajura', name: '1 त 45 मदद तपसण मज बबपर' },
  { taluka: 'Rajura', name: '1 त 45 मदद तपसण रमपर' },
  { taluka: 'Warora', name: 'अंतापूर रिठ १ ते ४५' }
];

console.log('Resolving targets:');
for (const t of targets) {
  const pMatch = parcels.find(p => p.taluka === t.taluka && (p.villageName === t.name || p.villageName.includes(t.name.split(' ')[0])));
  console.log(`[${t.taluka}] "${t.name}" -> Parcel Village: "${pMatch?.villageName}", Code: "${pMatch?.villageCode}"`);
}
