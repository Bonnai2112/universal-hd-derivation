import * as bitcoin from "bitcoinjs-lib";
import { Keypair } from "@solana/web3.js";
import { keccak256 } from "ethereum-cryptography/keccak";
import { ethers } from "ethers";
import { HDKey } from "@scure/bip32";
import { generateMnemonic, mnemonicToSeed } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";

// 1. Master seed
const SEGWIT_VERSIONS = { private: 0x04B2430C, public: 0x04B24746 };  // segwit seed generation
const mnemonic = generateMnemonic(wordlist);
const seed = await mnemonicToSeed(mnemonic);
console.log("Master seed:", mnemonic);
const rootKey = HDKey.fromMasterSeed(seed, SEGWIT_VERSIONS);

// 2. Bitcoin
const btcPath = "m/84'/0'/0'/0/0";
const opBtcKey = rootKey.derive(btcPath);

const btcAddress = bitcoin.payments.p2wpkh({
  pubkey: opBtcKey.publicKey,
  network: bitcoin.networks.bitcoin
}).address;
console.log("\nBitcoin address:", btcAddress);

// 3. Ethereum
const ethPath = "m/44'/60'/0'/0/0";
const opEthKey = rootKey.derive(ethPath);

const ethPub = opEthKey.publicKey.slice(1);
const hash = keccak256(ethPub);
const raw = ethers.hexlify(hash).slice(-40);
const ethAddress = ethers.getAddress("0x" + raw);
console.log("Ethereum address:", ethAddress);

// 4. Solana
const solPath = "m/44'/501'/0'/0'";
const opSolHD = HDKey.fromMasterSeed(seed).derive(solPath);
const solKeypair = Keypair.fromSeed(opSolHD.privateKey);
console.log("Solana address:", solKeypair.publicKey.toBase58());