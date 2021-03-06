import { app, CertificateVerifyProcRequest, BrowserWindow } from "electron";
import { setupMenu } from "./menu";
import WindowManager from "./window-manager";
import { MQ } from "./mq";
import { createUpdateChecker } from './update-checker'
import {Txer} from "./txer";
import env from "@/env";

declare module "electron" {
  interface App {
    EXTENSION: {
      mq: MQ;
      // map window id to known head
      knownHeads: Map<string, Flex.Meter.Status['head']>;
      txer: Txer

      // mainSettings: MainSettings
      updateChecker: ReturnType<typeof createUpdateChecker>;

      createWindow(
        config?: NodeConfig,
        options?: BrowserWindowConstructorOptions
      ): BrowserWindow;
      showAbout(): void;
      getCertificate(
        hostname: string
      ): CertificateVerifyProcRequest | undefined;

      registerBrowserWindowEvent(windowId: number, event: string[]): void;

      dispatchDbEvent(event: DbEvent): void;
    };
  }
}

// tslint:disable-next-line:no-var-requires
require("electron-unhandled")({
  //    logger: console.error,
  showDialog: false
});

app.setName("Sync");

if (env.devMode || app.requestSingleInstanceLock()) {
  if (!env.devMode) {
    if (!app.isDefaultProtocolClient("meter-app")) {
      app.setAsDefaultProtocolClient("meter-app");
    }
  }

  // tslint:disable-next-line:no-var-requires
  const contextMenu = require("electron-context-menu");
  // for all browserWindow
  contextMenu();

  const updateChecker = createUpdateChecker();
  const mq = new MQ();
  const winMgr = new WindowManager();
  const certs = new Map<string, CertificateVerifyProcRequest>();

  let initExternalUrl = (env.devMode ? "" : process.argv[1]) || "";

  const certVerifyProc = (
    req: CertificateVerifyProcRequest,
    callback: (verificationResult: number) => void
  ) => {
    certs.set(req.hostname, req);
    if (req.verificationResult === "net::OK") {
      callback(0);
    } else {
      callback(-3);
    }
  };

  app.EXTENSION = {
    mq,
    knownHeads: new Map(),
    txer: new Txer(),
    updateChecker,
    createWindow: (config, options) => winMgr.create(config, options),
    showAbout: () => winMgr.showAbout(),
    getCertificate: hostname => certs.get(hostname),
    registerBrowserWindowEvent: (windowId, events) => {
      winMgr.registerWindowEvent(windowId, events);
    },
    dispatchDbEvent: event => winMgr.dispatchDbEvent(event)
  };

  app
    .on("web-contents-created", (_, contents) => {
      contents.on("did-attach-webview", (__, wc) => {
        wc.session.setCertificateVerifyProc(certVerifyProc);
        // for all webview
        contextMenu({
          window: wc,
          showInspectElement: true
        });
      });
    })
    .on("ready", () => {
      setupMenu();
      if (initExternalUrl) {
        if (!winMgr.openUrl(initExternalUrl)) {
          winMgr.create();
        }
      } else {
        winMgr.create();
      }
      if (process.env.NODE_ENV === 'production') {
        updateChecker.check()
        setInterval(() => updateChecker.check(), 12 * 3600 * 1000)
      }
    })
    .on("open-url", (ev, externalUrl) => {
      // TODO windows/linux
      ev.preventDefault();
      if (app.isReady()) {
        winMgr.openUrl(externalUrl);
      } else {
        initExternalUrl = externalUrl;
      }
    })
    .on("activate", () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (winMgr.activeCount === 0) {
        winMgr.create();
      }
    })
    .on("second-instance", (ev, argv) => {
      const externalUrl = argv[1];
      if (externalUrl) {
        if (winMgr.openUrl(externalUrl)) {
          return;
        }
      }
      winMgr.focus();
    })
    .on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });
} else {
  app.quit();
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
