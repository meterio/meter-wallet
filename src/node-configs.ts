export const presets: NodeConfig[] = [
  
  {
    name: "Warringstakes",
    url: "https://warringstakes.meter.io:8667",
    genesis: {
      number: 0,
      id: "0x00000000ed77a5a4cc2cb585ed7fba4200b89751142cd6fe124aecc3d3350e58",
      size: 280,
      parentID:
        "0xffffffff00000000000000000000000000000000000000000000000000000000",
      timestamp: 1530014400,
      gasLimit: 200000000,
      beneficiary: "0x0000000000000000000000000000000000000000",
      gasUsed: 0,
      totalScore: 0,
      txsRoot:
        "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
      stateRoot:
        "0x978ff5d68fb51e5fa1de610a8fa4f5d410f72f199f536ee06098ff35e404dcb0",
      receiptsRoot:
        "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
      signer: "0x0000000000000000000000000000000000000000",
      transactions: [],
      lastKBlockHeight:0,
      committee: [],
      qc: {qcHeight:0, qcRound:0, voterBitArrayStr:"", epochID:0},
      nonce: 0,
    }
  },
  {
    name: "Tetra",
    url: "http://tetra.meter.io:8669",
    genesis: {
      number: 0,
      id: "0x00000000ed77a5a4cc2cb585ed7fba4200b89751142cd6fe124aecc3d3350e58",
      size: 280,
      parentID:
        "0xffffffff00000000000000000000000000000000000000000000000000000000",
      timestamp: 1530014400,
      gasLimit: 200000000,
      beneficiary: "0x0000000000000000000000000000000000000000",
      gasUsed: 0,
      totalScore: 0,
      txsRoot:
        "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
      stateRoot:
        "0x978ff5d68fb51e5fa1de610a8fa4f5d410f72f199f536ee06098ff35e404dcb0",
      receiptsRoot:
        "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
      signer: "0x0000000000000000000000000000000000000000",
      transactions: [],
      lastKBlockHeight:0,
      committee: [],
      qc: {qcHeight:0, qcRound:0, voterBitArrayStr:"", epochID:0},
      nonce: 0,
    }
  },
  {
    name: "mainnet",
    url: "https://mainnet.meter.io",
    genesis: {
      number: 0,
      id: "0x00000000ed77a5a4cc2cb585ed7fba4200b89751142cd6fe124aecc3d3350e58",
      size: 280,
      parentID:
        "0xffffffff00000000000000000000000000000000000000000000000000000000",
      timestamp: 1530014400,
      gasLimit: 200000000,
      beneficiary: "0x0000000000000000000000000000000000000000",
      gasUsed: 0,
      totalScore: 0,
      txsRoot:
        "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
      stateRoot:
        "0x978ff5d68fb51e5fa1de610a8fa4f5d410f72f199f536ee06098ff35e404dcb0",
      receiptsRoot:
        "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
      signer: "0x0000000000000000000000000000000000000000",
      transactions: [],
      lastKBlockHeight:0,
      committee: [],
      qc: {qcHeight:0, qcRound:0, voterBitArrayStr:"", epochID:0},
      nonce: 0,
    }
  },
  {
    name: "Herd",
    url: "http://test.meter.io:8669",
    genesis: {
      number: 0,
      id: "0x000000006fc6a7f3571f22424ffc395e40db2a46dd7e18059eeef4f05bf08063",
      size: 234,
      parentID:
        "0xffffffff00000000000000000000000000000000000000000000000000000000",
      timestamp: 1530014400,
      gasLimit: 200000000,
      beneficiary: "0x0000000000000000000000000000000000000000",
      gasUsed: 0,
      totalScore: 0,
      txsRoot:
        "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
      stateRoot:
        "0x6562c40f9960f0cccc67a6b76924108989c2c687c1ae56d6e2178c7facca1ebb",
      receiptsRoot:
        "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
      signer: "0x0000000000000000000000000000000000000000",
      transactions: [],
      lastKBlockHeight:0,
      committee: [],
      qc: {qcHeight:0, qcRound:0, voterBitArrayStr:"", epochID:0},
      nonce: 0,
    }
  }
];

export function nameOfNetwork(genesisId: string) {
  switch (genesisId) {
    case "0x000000006fc6a7f3571f22424ffc395e40db2a46dd7e18059eeef4f05bf08063":
      return "testnet";
      
   case "0x00000000ed77a5a4cc2cb585ed7fba4200b89751142cd6fe124aecc3d3350e58":
      return "testnet";

   case "0x00000000ed77a5a4cc2cb585ed7fba4200b89751142cd6fe124aecc3d3350e58":
      return "mainnet";
 
    default:
      return "unknown";
  }
}
