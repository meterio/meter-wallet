import BigNumber from 'bignumber.js'
import { Transaction } from '@meterio/devkit'
import { randomBytes } from 'crypto'
import { cry } from '@meterio/devkit'

namespace contracts {
    export namespace params {
        const address = '0x0000000000000000000000000000506172616d73'
        const abiGet = {
            constant: true,
            inputs: [{ name: '_key', type: 'bytes32' }],
            name: 'get',
            outputs: [{ name: '', type: 'uint256' }],
            payable: false,
            stateMutability: 'view',
            type: 'function'
        }

        export async function get(key: string) {
            const result = await flex.meter
                .account(address)
                .method(abiGet)
                .call(key)
            return result.data
        }
    }
}

let cachedBaseGasPrice: BigNumber | undefined
async function getBaseGasPrice() {
    if (cachedBaseGasPrice) {
        return cachedBaseGasPrice
    }
    const data = await contracts.params.get(
        '0x000000000000000000000000000000000000626173652d6761732d7072696365')

    cachedBaseGasPrice = new BigNumber(data)
    return cachedBaseGasPrice
}

export type EstimateGasResult = {
    gas: number,
    reverted: boolean
    vmError: string
    baseGasPrice: BigNumber
}

export async function estimateGas(
    clauses: Flex.Meter.Clause[],
    suggestedGas: number,
    caller: string): Promise<EstimateGasResult> {
    
    const outputs = await flex.meter.explain()
        .caller(caller)
        .gas(16000)
        .execute(clauses)

    if (!suggestedGas) {
        const execGas = outputs.reduce((sum, out) => sum + out.gasUsed, 0)
        suggestedGas = Math.round(execGas * 1.2 + Transaction.intrinsicGas(clauses))
    }
    const bgp = await getBaseGasPrice()
    const lastOutput = outputs.slice().pop()
    const result = {
        gas: suggestedGas,
        reverted: lastOutput ? lastOutput.reverted : false,
        vmError: lastOutput ? lastOutput.vmError : '',
        baseGasPrice: bgp,
    }
    console.log("")
    return result;
}

export function buildTx(
    clauses: Flex.Meter.Transaction['clauses'],
    gasPriceCoef: number,
    gas: number,
    dependsOn: string | null) {

    const genesis = flex.meter.genesis
    const bestId = flex.meter.status.head.id

    console.log("genesis:", genesis.id)
    console.log("chaintag:", Number.parseInt(genesis.id.slice(genesis.id.length - 2), 16))
    const txBody: Transaction.Body = {
        chainTag: Number.parseInt(genesis.id.slice(genesis.id.length - 2), 16),
        blockRef: bestId.slice(0, 18),
        expiration: 18, // about 3 mins
        clauses,
        gasPriceCoef,
        gas,
        dependsOn,
        nonce: '0x' + randomBytes(8).toString('hex')
    }
    return {
        unsignedTx: (features?: boolean) => {
            let reserved = {}
            if (features) {
                reserved = {
                    reserved: {
                        features: 1
                    }
                }
            }
            return new Transaction({...txBody, ...reserved})
        },
        signTx: (privateKey: Buffer, delegatorSig?: string) => {
            let tx
            if (delegatorSig) {
                tx = new Transaction({ ...txBody, reserved: { features: 1 } })
                const originSig = cry.secp256k1.sign(cry.blake2b256(tx.encode()), privateKey)
                tx.signature = Buffer.concat([originSig, Buffer.from(delegatorSig.slice(2), 'hex')])
            } else {
                tx = new Transaction(txBody)
                tx.signature = cry.secp256k1.sign(cry.blake2b256(tx.encode()), privateKey)
            }
            return tx
        }
    }
}
