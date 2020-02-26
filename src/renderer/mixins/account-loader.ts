import { Vue, Component, Watch } from "vue-property-decorator";

@Component
export default class AccountLoader extends Vue {
  public account: Connex.Meter.Account | null = null;
  // override it to set address
  get address() {
    return "";
  }

  public created() {
    this._reload();
  }

  @Watch("$store.state.chainHead")
  private async _reload() {
    const addr = this.address;
    if (addr) {
      try {
        const acc = await connex.meter.account(addr).get();
        if (addr === this.address) {
          this.account = acc;
        }
      } catch (err) {
        // tslint:disable-next-line:no-console
        console.warn(err);
      }
    }
  }

  @Watch("address")
  private _addrChanged() {
    this.account = null;
    this._reload();
  }
}
