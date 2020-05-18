import electron from 'electron'
import { Application } from 'spectron'

export default {
  afterEach () {
    this.timeout(10000)

    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  },
  beforeEach () {
    this.timeout(10000)
    this.app = new Application({
      path: electron,
      args: ['dist/electron/main.js'],
      startTimeout: 10000,
      waitTimeout: 10000,
    })
    this.app.commandLine.appendSwitch('disable-web-security'); // disable web security

    return this.app.start()
  }
}
