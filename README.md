install
```bash
pip install mnemonic
```
```bash
npm init -y
npm install axios web3 @solana/web3.js bip39 @ethersproject/hdnode dotenv ethers
```
run
```bash
py memogen.py
```
run
```bash
py getwallet.py
```
configurasi:
```bash
npm init -y
```
Contoh .env dari py getwallet.py :
```bash
MNEMONICS_EVM=["MNEMONICS_EVM1", "MNEMONICS_EVM2", "MNEMONICS_EVM3"]
```
run:
```bash
node filter.js
```
hasil filter.js .env:
```bash
MNEMONICS_EVM=["MNEMONICS_EVM1-valid", "MNEMONICS_EVM2-valid", "MNEMONICS_EVM3-valid"]
``` 
run:
```bash
node ubah.js
```
hasil filter.js .env:
```bash
{
  "mnemonics": [
    "MNEMONICS_EVM",
    "MNEMONICS_EVM1",
    "MNEMONICS_EVM2",
    "MNEMONICS_EVM3",
    "..."
  ]
}

```
run:
```bash
node cek.js
```
hasil dari cek.json adalah res.json:
```bash
[
  {
    "mnemonic": "mnemonic1",
    "saldo": {
      "eth": "0.5",
      "bnb": "1.0"
    }
  },
  {
    "mnemonic": "mnemonic2",
    "saldo": {
      "eth": "2.0",
      "poly": "10.0"
    }
  }
]

```