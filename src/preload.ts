import { remote, ipcRenderer } from 'electron'
import {Framework } from "@meterio/flex-framework"
import {Driver} from "@/renderer/connex-driver/driver"

// create connex on demand
const getFlex = (() => {
    let flex: Flex
    return () => {
        if (!flex) {
            flex = new Framework(new Driver())
        }
        return flex
    }
})()

Object.defineProperty(window, 'flex', {
    enumerable: true,
    get() { return getFlex() }
})
window.addEventListener('load', () => {
    const bgColor = window.getComputedStyle(document.body).getPropertyValue('background-color')
    ipcRenderer.sendToHost('bg-color', bgColor)
})
window.addEventListener('wheel', ev => {
    ipcRenderer.sendToHost('wheel', { x: ev.deltaX, y: ev.deltaY })
}, { passive: true })

// workaround to https://github.com/electron/electron/issues/14258
window.addEventListener('keydown', ev => {
    ipcRenderer.sendToHost('keydown', {
        key: ev.key,
        keyCode: ev.keyCode,
        code: ev.code,
        shiftKey: ev.shiftKey,
        altKey: ev.altKey,
        ctrlKey: ev.ctrlKey,
        metaKey: ev.metaKey,
        repeat: ev.repeat
    })
})
