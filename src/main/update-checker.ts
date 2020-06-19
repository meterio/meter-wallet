import { autoUpdater, UpdateInfo } from 'electron-updater'
import * as log from 'electron-log'

export function createUpdateChecker() {
    let downloadProgress = 0
    let error: { name: string, message: string } | null = null
    let newVersion: UpdateInfo | null = null
    let status: 'idle' | 'checking' | 'downloading' | 'downloaded' = 'idle'

    autoUpdater.on('error', err => {
        console.log("ERROR HAPPENEND: ", err)
        error = err
        status = 'idle'
        downloadProgress = 0
    })
    autoUpdater.on('checking-for-update', () => {
        console.log("CHECKING FOR UPDATE")
        status = 'checking'
        error = null
        newVersion = null
        downloadProgress = 0
    })
    autoUpdater.on('update-available', info => {
        console.log("UPDATE AVAILABLE")
        newVersion = info
    })
    autoUpdater.on('update-not-available', () => {
        console.log("UPDATE NOT AVAILABLE")
        status = 'idle'
    })
    autoUpdater.on('download-progress', info => {
        console.log("DOWNLOAD PROGRESS", info)
        status = 'downloading'
        downloadProgress = info.percent
    })
    autoUpdater.on('update-downloaded', () => {
        console.log("DOWNLOADED")
        status = 'downloaded'
    })

    autoUpdater.autoInstallOnAppQuit = true
    autoUpdater.autoDownload = true
    autoUpdater.logger = log

    return {
        get downloadProgress() { return downloadProgress },
        get error() { return error },
        get newVersion() { return newVersion },
        get status() { return status },

        check() { autoUpdater.checkForUpdates() },
        quitAndInstall() { autoUpdater.quitAndInstall() }
    }
}
