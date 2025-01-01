const fs = require('fs');
const axios = require('axios');
const Web3 = require('web3');
const { HDNode } = require('@ethersproject/hdnode');
const { mnemonicToSeedSync } = require('bip39');
const { Connection, PublicKey } = require('@solana/web3.js'); // Library Solana
const pLimit = require('p-limit'); // Import p-limit

// API Key untuk berbagai jaringan blockchain
const ETHERSCAN_API_KEY = 'XYT8F3HGNSR9E8SES984P26TG1RPET1CHD';
const BSCSCAN_API_KEY = 'XSH4MTS8NBZU4ZRE85YV29K7CDXVVYCAAH';
const POLYGONSCAN_API_KEY = 'P4FSB7PA6WABXFNTYBXADT7C71YJIEGP7I';
const ARBSCAN_API_KEY = 'XYT8F3HGNSR9E8SES984P26TG1RPET1CHD'; // API Key untuk Arbitrum dari Etherscan
const BASESCAN_API_KEY = 'X6KQDS4DJYNH7D65RRHXV3IS945TADEPKJ'; // API Key untuk Base

// URL untuk berbagai blockchain
const ethBaseURL = "https://api.etherscan.io/api";
const bscBaseURL = "https://api.bscscan.com/api";
const polygonBaseURL = "https://api.polygonscan.com/api";
const arbBaseURL = "https://api.arbiscan.io/api";  // URL untuk Arbitrum
const baseBaseURL = "https://base.blockscout.com/api"; // URL untuk Base
const solanaConnection = new Connection('https://api.mainnet-beta.solana.com'); // Koneksi Solana ke jaringan utama

// Fungsi untuk mendapatkan saldo dari Ethereum
async function getEthBalance(address) {
    try {
        const response = await axios.get(ethBaseURL, {
            params: {
                module: "account",
                action: "balance",
                address: address,
                tag: "latest",
                apiKey: ETHERSCAN_API_KEY
            }
        });

        if (response.data.status === "1") {
            const balanceInWei = response.data.result;
            const balanceInEth = Web3.utils.fromWei(balanceInWei, 'ether');
            return balanceInEth;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error saat memeriksa saldo ETH untuk ${address}: ${error.message}`);
        return null;
    }
}

// Fungsi untuk mendapatkan saldo dari Binance Smart Chain (BSC)
async function getBscBalance(address) {
    try {
        const response = await axios.get(bscBaseURL, {
            params: {
                module: "account",
                action: "balance",
                address: address,
                tag: "latest",
                apiKey: BSCSCAN_API_KEY
            }
        });

        if (response.data.status === "1") {
            const balanceInWei = response.data.result;
            const balanceInBnb = Web3.utils.fromWei(balanceInWei, 'ether');
            return balanceInBnb;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error saat memeriksa saldo BNB untuk ${address}: ${error.message}`);
        return null;
    }
}

// Fungsi untuk mendapatkan saldo dari Polygon (MATIC)
async function getPolygonBalance(address) {
    try {
        const response = await axios.get(polygonBaseURL, {
            params: {
                module: "account",
                action: "balance",
                address: address,
                tag: "latest",
                apiKey: POLYGONSCAN_API_KEY
            }
        });

        if (response.data.status === "1") {
            const balanceInWei = response.data.result;
            const balanceInMatic = Web3.utils.fromWei(balanceInWei, 'ether');
            return balanceInMatic;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error saat memeriksa saldo MATIC untuk ${address}: ${error.message}`);
        return null;
    }
}

// Fungsi untuk mendapatkan saldo dari Arbitrum (ARB)
async function getArbBalance(address) {
    try {
        const response = await axios.get(arbBaseURL, {
            params: {
                module: "account",
                action: "balance",
                address: address,
                tag: "latest",
                apiKey: ARBSCAN_API_KEY
            }
        });

        if (response.data.status === "1") {
            const balanceInWei = response.data.result;
            const balanceInEth = Web3.utils.fromWei(balanceInWei, 'ether'); // Arbitrum menggunakan format yang sama dengan Ethereum
            return balanceInEth;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error saat memeriksa saldo ARB untuk ${address}: ${error.message}`);
        return null;
    }
}

// Fungsi untuk mendapatkan saldo dari Base (Layer 2)
async function getBaseBalance(address) {
    try {
        const response = await axios.get(baseBaseURL, {
            params: {
                module: "account",
                action: "balance",
                address: address,
                tag: "latest",
                apiKey: BASESCAN_API_KEY
            }
        });

        if (response.data.status === "1") {
            const balanceInWei = response.data.result;
            const balanceInEth = Web3.utils.fromWei(balanceInWei, 'ether'); // Base menggunakan format yang sama dengan Ethereum
            return balanceInEth;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Error saat memeriksa saldo Base untuk ${address}: ${error.message}`);
        return null;
    }
}

// Fungsi untuk mendapatkan saldo dari Solana (SOL)
async function getSolBalance(address) {
    try {
        const publicKey = new PublicKey(address); // Mengonversi address menjadi public key Solana
        const balance = await solanaConnection.getBalance(publicKey); // Mendapatkan saldo dalam lamports
        const balanceInSol = balance / 1000000000; // Mengonversi lamports ke SOL
        return balanceInSol;
    } catch (error) {
        console.error(`Error saat memeriksa saldo SOL untuk ${address}: ${error.message}`);
        return null;
    }
}

// Fungsi untuk mendapatkan address dari mnemonic
async function getAddressFromMnemonic(mnemonic) {
    try {
        const seed = mnemonicToSeedSync(mnemonic);
        const hdNode = HDNode.fromSeed(seed);
        const wallet = hdNode.derivePath("m/44'/60'/0'/0/0");
        const address = wallet.address;
        return address;
    } catch (error) {
        console.error(`Error saat memproses mnemonic: ${error.message}`);
        return null;
    }
}

// Membaca file `res.json` dan menambah data baru tanpa menghapus data lama
function readAndUpdateJson(newData) {
    try {
        const filePath = 'res.json';
        let existingData = [];

        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            existingData = JSON.parse(fileContent);
        }

        existingData.push(newData);

        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    } catch (error) {
        console.error(`Error saat menyimpan data ke res.json: ${error.message}`);
    }
}

// Fungsi untuk memeriksa saldo semua wallet
async function checkAllWallets() {
    const data = fs.readFileSync('evm.json');
    const json = JSON.parse(data);
    const mnemonics = json.mnemonics;

    for (const mnemonic of mnemonics) {
        const address = await getAddressFromMnemonic(mnemonic);
        if (address) {
            console.log(`Memeriksa saldo untuk mnemonic: ${mnemonic}`);

            // Menyimpan hasil
            const result = {
                mnemonic: mnemonic,
                saldo: {}
            };

            // Memeriksa saldo untuk setiap blockchain dan menambahkannya ke result
            const ethBalance = await getEthBalance(address);
            if (ethBalance) result.saldo.eth = ethBalance;

            const bnbBalance = await getBscBalance(address);
            if (bnbBalance) result.saldo.bnb = bnbBalance;

            const polyBalance = await getPolygonBalance(address);
            if (polyBalance) result.saldo.poly = polyBalance;

            const arbBalance = await getArbBalance(address);
            if (arbBalance) result.saldo.arb = arbBalance;

            const baseBalance = await getBaseBalance(address);
            if (baseBalance) result.saldo.base = baseBalance;

            const solBalance = await getSolBalance(address);
            if (solBalance) result.saldo.sol = solBalance;

            // Menambahkan hasil pemeriksaan saldo ke file res.json
            readAndUpdateJson(result);
        } else {
            console.log(`Alamat tidak ditemukan untuk mnemonic: ${mnemonic}`);
        }
    }
}

// Menjalankan pemeriksaan semua wallet
checkAllWallets();
