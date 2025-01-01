const fs = require('fs');
const dotenv = require('dotenv');

// Membaca file .env
dotenv.config();

// Mendapatkan nilai dari MNEMONICS_EVM di dalam .env
const mnemonicsEvm = process.env.MNEMONICS_EVM ? JSON.parse(process.env.MNEMONICS_EVM) : [];

// Menyusun struktur objek untuk file evm.json
const evmJson = {
  mnemonics: mnemonicsEvm
};

// Menyimpan hasil ke dalam evm.json
fs.writeFileSync('evm.json', JSON.stringify(evmJson, null, 2));

console.log('File evm.json telah dibuat');
