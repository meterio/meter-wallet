import Vendor from './Vendor.vue'
import { BridgeAPI } from '../flex-driver/bridge-api'

export default Vendor

declare global {
    interface Window {
        bridge: BridgeAPI,
        VENDOR: {
            signTx(
                msg: Flex.Driver.SignTxArg,
                option: Flex.Driver.SignTxOption,
                caller: {
                    referer: Referer
                    webContentsId: number
                }
            ): Promise<Flex.Driver.SignTxResult>
            signCert(
                msg: Flex.Driver.SignCertArg,
                option: Flex.Driver.SignCertOption,
                caller: {
                    referer: Referer
                    webContentsId: number
                }
            ): Promise<Flex.Driver.SignCertResult>
            isAddressOwned(addr: string): Promise<boolean>
        }
    }
}
