import Vendor from './Vendor.vue'

export default Vendor

declare global {
    interface Window {
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
