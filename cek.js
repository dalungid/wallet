import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import axios from 'axios';
import { Connection, PublicKey } from '@solana/web3.js'; // Import Solana SDK

// Menyusun path ke evm.json dengan menggunakan import.meta.url
const __dirname = dirname(new URL(import.meta.url).pathname);
const mnemonicsFile = join(__dirname, 'evm.json');

// Membaca dan mem-parsing file JSON
const mnemonics = JSON.parse(readFileSync(mnemonicsFile, 'utf8'));

// Verifikasi apakah mnemonics adalah array
if (!Array.isArray(mnemonics)) {
  console.error('Mnemonics data is not an array');
  process.exit(1);
}

console.log('Mnemonics:', mnemonics); // Verifikasi isi mnemonics

// API Keys untuk berbagai jaringan
const apiKeys = {
  eth: 'XYT8F3HGNSR9E8SES984P26TG1RPET1CHD',
  bsc: 'XSH4MTS8NBZU4ZRE85YV29K7CDXVVYCAAH',
  polygon: 'P4FSB7PA6WABXFNTYBXADT7C71YJIEGP7I',
  arb: '7QXIKYWD29Z1TZR7ANSCBF1MBCDWG9RIJP',
  base: 'X6KQDS4DJYNH7D65RRHXV3IS945TADEPKJ',
};

// Fungsi untuk mendapatkan saldo dari API (misalnya Ethereum)
const getBalanceFromAPI = async (mnemonic, chain) => {
  let apiUrl;
  let params = { address: mnemonic };  // Asumsi mnemonic adalah alamat wallet

  switch (chain) {
    case 'eth':
      apiUrl = `https://api.etherscan.io/api?module=account&action=balance&address=${mnemonic}&tag=latest&apikey=${apiKeys.eth}`;
      break;
    case 'bsc':
      apiUrl = `https://api.bscscan.com/api?module=account&action=balance&address=${mnemonic}&tag=latest&apikey=${apiKeys.bsc}`;
      break;
    case 'polygon':
      apiUrl = `https://api.polygonscan.com/api?module=account&action=balance&address=${mnemonic}&tag=latest&apikey=${apiKeys.polygon}`;
      break;
    case 'arb':
      apiUrl = `https://api.arbiscan.io/api?module=account&action=balance&address=${mnemonic}&tag=latest&apikey=${apiKeys.arb}`;
      break;
    case 'base':
      apiUrl = `https://api.basescan.org/api?module=account&action=balance&address=${mnemonic}&tag=latest&apikey=${apiKeys.base}`;
      break;
    case 'sol':  // Menambahkan kasus untuk Solana
      const solConnection = new Connection('https://api.mainnet-beta.solana.com'); // Endpoint RPC Solana
      try {
        const publicKey = new PublicKey(mnemonic); // Menggunakan mnemonic sebagai public key
        const balance = await solConnection.getBalance(publicKey);
        return balance / 1000000000;  // Mengonversi saldo dari lamports ke SOL (1 SOL = 10^9 lamports)
      } catch (error) {
        console.error(`Error fetching Solana balance for ${mnemonic}:`, error);
        return '0';
      }
    default:
      console.error('Chain not supported');
      return '0';
  }

  try {
    const response = await axios.get(apiUrl, { params });
    return response.data.result || '0';
  } catch (error) {
    console.error(`Error fetching balance for ${chain}:`, error);
    return '0';
  }
};

// Fungsi untuk menyimpan hasil ke file res.json
const saveResults = async (mnemonics) => {
  const results = {};

  for (let mnemonic of mnemonics) {
    const balances = {};

    // Periksa saldo untuk setiap jaringan
    const ethBalance = await getBalanceFromAPI(mnemonic, 'eth');
    if (ethBalance !== '0') balances.eth = ethBalance;

    const bnbBalance = await getBalanceFromAPI(mnemonic, 'bsc');
    if (bnbBalance !== '0') balances.bnb = bnbBalance;

    const polyBalance = await getBalanceFromAPI(mnemonic, 'polygon');
    if (polyBalance !== '0') balances.poly = polyBalance;

    const arbBalance = await getBalanceFromAPI(mnemonic, 'arb');
    if (arbBalance !== '0') balances.arb = arbBalance;

    const baseBalance = await getBalanceFromAPI(mnemonic, 'base');
    if (baseBalance !== '0') balances.base = baseBalance;

    const solBalance = await getBalanceFromAPI(mnemonic, 'sol');
    if (solBalance !== '0') balances.sol = solBalance;  // Menambahkan Solana

    // Simpan hasil hanya jika ada saldo yang ditemukan
    if (Object.keys(balances).length > 0) {
      results[mnemonic] = { saldo: balances };
    }
  }

  // Simpan hasil ke file JSON
  try {
    const fs = require('fs');
    fs.writeFileSync('res.json', JSON.stringify(results, null, 2));
    console.log('Hasil disimpan ke res.json');
  } catch (error) {
    console.error('Error writing results to file:', error);
  }
};

// Jalankan fungsi untuk memeriksa saldo semua wallet dan simpan hasilnya
saveResults(mnemonics);
