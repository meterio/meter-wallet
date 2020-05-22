export const presets: NodeConfig[] = [
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
  },
  {
    name: "Warringstakes",
    url: "http://warringstakes.meter.io:8669",
    genesis: {
      number: 0,
      id: "0x00000000f109b12aa5a80770631e804b84648c926ad1a8b54817aaa01d054786",
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
        "0xab5d20d980331d3e675f18af03e6e208ac5b942f26091810dd823963705fae33",
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
      id: "0x00000000f109b12aa5a80770631e804b84648c926ad1a8b54817aaa01d054786",
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
        "0xab5d20d980331d3e675f18af03e6e208ac5b942f26091810dd823963705fae33",
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
    name: "meter.io",
    url: "https://mainnet.meter.io",
    genesis: {
      number: 0,
      id: "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a",
      size: 170,
      parentID:
        "0xffffffff00000000000000000000000000000000000000000000000000000000",
      timestamp: 1530316800,
      gasLimit: 10000000,
      beneficiary: "0x0000000000000000000000000000000000000000",
      gasUsed: 0,
      totalScore: 0,
      txsRoot:
        "0x45b0cfc220ceec5b7c1c62c4d4193d38e4eba48e8815729ce75f9c0ab0e4c1c0",
      stateRoot:
        "0x09bfdf9e24dd5cd5b63f3c1b5d58b97ff02ca0490214a021ed7d99b93867839c",
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
    case "0x00000000f109b12aa5a80770631e804b84648c926ad1a8b54817aaa01d054786":
      return "testnet"
    case "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a":
      return "mainnet";
    case "0x00000000973ceb7f343a58b08f0693d6701a5fd354ff73d7058af3fba222aea4":
      return "devnet";
    default:
      return "unknown";
  }
}
