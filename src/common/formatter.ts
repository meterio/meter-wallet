import { BigNumber } from "bignumber.js";
import { cry } from "@meterio/devkit";

export namespace Address {
  export function isValid(addr: any): addr is string {
    return cry.isAddress(addr);
  }
  export function abbrev(addr: string) {
    if (!cry.isAddress(addr)) {
      return null;
    }
    return addr.slice(0, 8) + "…" + addr.slice(addr.length - 6);
  }

  export function toChecksum(addr: string) {
    if (!cry.isAddress(addr)) {
      return null;
    }
    return cry.toChecksumAddress(addr);
  }
}

export namespace Bucket {
  export function abbrev(id: string) {
    return id.slice(0, 8) + "…" + id.slice(id.length - 6);
  }
}

export namespace Num {
  const e18 = new BigNumber("1" + "0".repeat(18));
  function toBn(n: string | number | BigNumber) {
    if (BigNumber.isBigNumber(n)) {
      return n as BigNumber;
    }
    return new BigNumber(n);
  }

  export function format(
    n: string | number | BigNumber,
    decimalPlace?: number,
    pack?: boolean // remove trailing zero in decimal part
  ) {
    let bn = toBn(n);
    if (typeof decimalPlace === "number" && pack) {
      bn = bn.dp(decimalPlace);
      return bn.toFormat();
    }
    return bn.toFormat(decimalPlace);
  }

  export function formatBalance(
    n: string | number | BigNumber,
    decimalPlace?: number,
    pack?: boolean // remove trailing zero in decimal part
  ) {
    return format(toBn(n).div(e18), decimalPlace, pack);
  }
}

export function describeClauses(clauses: Flex.Meter.Clause[]) {
  if (clauses.length === 0) {
    return "empty";
  }
  if (clauses.length === 1) {
    if (!clauses[0].to) {
      return "create a contract";
    }
    if (clauses[0].data === "0x") {
      if (clauses[0].token === 1){
      return "transfer MTRG";
      } else if (clauses[0].token === 0){
        return "transfer MTR";
      } else{
        return "transfer";
      }
    }
    return "make contract call";
  }

  return "perform a batch of actions";
}
