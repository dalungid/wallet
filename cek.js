import axios from 'axios';
import { Wallet } from 'ethers';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';
import pLimit from 'p-limit';  // Perubahan di sini untuk p-limit

dotenv.config();

// Membaca mnemonics dari file evm.json
const mnemonicsFile = join(__dirname, 'evm.json');
const mnemonics = JSON.parse(readFileSync(mnemonicsFile, 'utf8'));

// API untuk berbagai blockchain
const APIs = {
  eth: 'https://api.etherscan.io/api?module=account&action=balance&address=',
  bnb: 'https://api.bscscan.com/api?module=account&action=balance&address=',
  poly: 'https://api.polygonscan.com/api?module=account&action=balance&address=',
  sol: 'https://api.solscan.io/account?address=',
  arb: 'https://api.arbiscan.io/api?module=account&action=balance&address=',
  base: 'https://api.base.org/api?module=account&action=balance&address=',
};

const checkBalance = async (mnemonic) => {
  try {
    const wallet = Wallet.fromMnemonic(mnemonic);
    const address = wallet.address;

    const balances = {};

    // Memeriksa saldo untuk Ethereum (ETH)
    const ethBalance = await axios.get(`${APIs.eth}${address}`);
    if (ethBalance.data.result !== '0') {
      balances.eth = parseFloat(ethBalance.data.result) / 10 ** 18;
    }

    // Memeriksa saldo untuk Binance Smart Chain (BNB)
    const bnbBalance = await axios.get(`${APIs.bnb}${address}`);
    if (bnbBalance.data.result !== '0') {
      balances.bnb = parseFloat(bnbBalance.data.result) / 10 ** 18;
    }

    // Memeriksa saldo untuk Polygon (POLY)
    const polyBalance = await axios.get(`${APIs.poly}${address}`);
    if (polyBalance.data.result !== '0') {
      balances.poly = parseFloat(polyBalance.data.result) / 10 ** 18;
    }

    // Memeriksa saldo untuk Solana (SOL)
    const solBalance = await axios.get(`${APIs.sol}${address}`);
    if (solBalance.data.data) {
      balances.sol = parseFloat(solBalance.data.data.balance) / 10 ** 9;
    }

    // Memeriksa saldo untuk Arbitrum (ARB)
    const arbBalance = await axios.get(`${APIs.arb}${address}`);
    if (arbBalance.data.result !== '0') {
      balances.arb = parseFloat(arbBalance.data.result) / 10 ** 18;
    }

    // Memeriksa saldo untuk Base (BASE)
    const baseBalance = await axios.get(`${APIs.base}${address}`);
    if (baseBalance.data.result !== '0') {
      balances.base = parseFloat(baseBalance.data.result) / 10 ** 18;
    }

    return { address, balances };
  } catch (error) {
    console.error(`Error checking balance for mnemonic: ${mnemonic}`, error);
    return null;
  }
};

const saveResults = (results) => {
  const outputFile = join(__dirname, 'res.json');
  let data = {};

  try {
    data = JSON.parse(readFileSync(outputFile, 'utf8'));
  } catch (err) {
    console.log('No previous results found, starting fresh.');
  }

  results.forEach(({ address, balances }) => {
    if (Object.keys(balances).length > 0) {
      data[address] = {
        mnemonic: address,
        saldo: balances,
      };
    }
  });

  writeFileSync(outputFile, JSON.stringify(data, null, 2));
  console.log('Results saved to res.json');
};

const checkAllWallets = async () => {
  const results = [];

  for (let mnemonic of mnemonics) {
    const result = await checkBalance(mnemonic);
    if (result) {
      results.push(result);
    }
  }

  saveResults(results);
};

checkAllWallets();
