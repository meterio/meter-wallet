const RLP = require("rlp");

export enum OpCode {
  BOUND = 1,
  UNBOUND,
  CANDIDATE,
  UNCANDIDATE,
  DELEGATE,
  UNDELEGATE,
}

export enum AuctionOpCode {
  START = 1,
  END,
  BID
}

const METER_GOV_BYTE = Buffer.from("01", "hex");
const METER_BYTE = Buffer.from("", "hex");

export enum Token {
  METER = 0,
  METER_GOV = 1
}

export enum ModID{
  STAKING = 1000,
  AUCTION = 1001,
}

export enum Option {
  NONE = 0,
  ONE_WEEK_LOCK,
  TWO_WEEK_LOCK,
  THREE_WEEK_LOCK,
  FOUR_WEEK_LOCK
}

const VERSION = 0;

const EMPTY_BYTE32 =
  "0000000000000000000000000000000000000000000000000000000000000000";
const EMPTY_ADDR_STR = "0000000000000000000000000000000000000000";
const DEFAULT_PORT = 8669;

const PREFIX = Buffer.from("ffffffffdeadbeef", "hex");

let randomInt = (low: number, high: number) => {
  return Math.floor(Math.random() * (high - low) + low);
};

let randomInt64 = () => {
  return randomInt(1,9007199254740992);
};

export function generateBoundData(
  option: Option,
  holderAddrStr: string,
  candAddrStr: string,
  amount: number,
  token = Token.METER
) {
  if (candAddrStr == "") {
    candAddrStr = EMPTY_ADDR_STR;
  }
  return genScriptDataForStaking(
    OpCode.BOUND,
    option,
    holderAddrStr,
    candAddrStr,
    "",
    "",
    "",
    0,
    EMPTY_BYTE32,
    amount,
    token
  );
}

export function generateUnboundData(
  holderAddrStr: string,
  stakingIDStr: string,
  amount: number,
  token = Token.METER
) {
  return genScriptDataForStaking(
    OpCode.UNBOUND,
    Option.NONE,
    holderAddrStr,
    EMPTY_ADDR_STR,
    "",
    "",
    "",
    DEFAULT_PORT,
    stakingIDStr,
    amount,
    token
  );
}

export function generateCandidateData(
  holderAddrStr: string,
  candAddrStr: string,
  candName: string,
  candPubKey: string,
  candIP: string,
  candPort: number,
  amount: number,
  token = Token.METER
) {
  // console.log("CANDIDATE NAME:", candName);
  return genScriptDataForStaking(
    OpCode.CANDIDATE,
    Option.FOUR_WEEK_LOCK,
    holderAddrStr,
    candAddrStr,
    candName,
    candPubKey,
    candIP,
    candPort,
    EMPTY_BYTE32,
    amount,
    token
  );
}

export function generateUncandidateData(
  holderAddrStr: string,
  candAddrStr: string
) {
  return genScriptDataForStaking(
    OpCode.UNCANDIDATE,
    Option.NONE,
    holderAddrStr,
    candAddrStr,
    "",
    "",
    "",
    8669,
    EMPTY_BYTE32,
    0,
    0
  );
}

export function generateDelegateData(
  holderAddrStr: string,
  candAddrStr: string,
  stakingIDStr: string,
  amount: number,
  token = Token.METER
) {
  if (candAddrStr == "") {
    candAddrStr = EMPTY_ADDR_STR;
  }
  return genScriptDataForStaking(
    OpCode.DELEGATE,
    Option.NONE,
    holderAddrStr,
    candAddrStr,
    "",
    "",
    "",
    0,
    stakingIDStr,
    amount,
    token
  );
}

export function generateUndelegateData(
  holderAddrStr: string,
  stakingIDStr: string,
  amount: number,
  token = Token.METER
) {
  return genScriptDataForStaking(
    OpCode.UNDELEGATE,
    Option.NONE,
    holderAddrStr,
    EMPTY_ADDR_STR,
    "",
    "",
    "",
    DEFAULT_PORT,
    stakingIDStr,
    amount,
    token
  );
}

let genScriptDataForStaking = (
  opCode: OpCode,
  option: Option,
  holderAddrStr = EMPTY_ADDR_STR,
  candAddrStr = EMPTY_ADDR_STR,
  candName = "",
  candPubKey = "",
  candIP = "",
  candPort = DEFAULT_PORT,
  stakingIDStr = EMPTY_BYTE32,
  amount = 0,
  token: Token
) => {
  if (holderAddrStr.toString().startsWith("0x")) {
    holderAddrStr = holderAddrStr.replace("0x", "");
  }
  if (candAddrStr.toString().startsWith("0x")) {
    candAddrStr = candAddrStr.replace("0x", "");
  }
  if (stakingIDStr.toString().startsWith("0x")) {
    stakingIDStr = stakingIDStr.replace("0x", "");
  }

  var holderAddr = Buffer.from(holderAddrStr, "hex");
  var candAddr = Buffer.from(candAddrStr, "hex");
  var stakingID = Buffer.from(stakingIDStr, "hex");

  var tokenByte = METER_BYTE;
  if (token == Token.METER) {
    tokenByte = METER_BYTE;
  } else if (token == Token.METER_GOV) {
    tokenByte = METER_GOV_BYTE;
  }

  var nonce = randomInt(1, 1e8);
  var body = [
    opCode,
    VERSION,
    option,
    holderAddr,
    candAddr,
    candName,
    candPubKey,
    candIP,
    candPort,
    stakingID,
    Math.round(amount),
    tokenByte,
    Math.round(new Date().getTime() / 1000),
    nonce
  ];
  var payloadBytes = RLP.encode(body);
  var header = [VERSION, ModID.STAKING ];

  var script = [header, payloadBytes];
  var data = RLP.encode(script);
  data = Buffer.concat([PREFIX, data]);
  // console.log(getOpName(opCode), "| Script Data Hex: ", data.toString("hex"));
  // console.log("AMOUNT:", amount, " HEX:", RLP.encode(amount).toString("hex"));
  return data.toString("hex");
};

export function generateAuctionBidData(bidderStr = '', amount = 0) {
  if (bidderStr.startsWith('0x')) {
    bidderStr = bidderStr.replace('0x', '');
  }
  let auctionIDStr = EMPTY_BYTE32;
  if (auctionIDStr.startsWith('0x')) {
    auctionIDStr = auctionIDStr.replace('0x', '');
  }

  const bidder = Buffer.from(bidderStr, 'hex');
  const auctionID = Buffer.from(auctionIDStr, 'hex');

  var nonce = randomInt64();
  var body = [
    AuctionOpCode.BID, // opCode
    VERSION, // version
    0, // option
    0, // start height
    0, // end height
    auctionID,
    bidder,
    amount,
    Token.METER,
    Math.round(new Date().getTime() / 1000),
    nonce
  ];
  var payloadBytes = RLP.encode(body);
  var header = [VERSION, ModID.AUCTION];

  var script = [header, payloadBytes];
  var data = RLP.encode(script);
  data = Buffer.concat([PREFIX, data]);
  return data.toString('hex');
};