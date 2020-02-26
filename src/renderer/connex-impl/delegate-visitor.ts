import cloneDeep from "lodash.clonedeep";

export function createDelegateVisitor(
  client: Client,
  addr: string
): Connex.Meter.DelegateVisitor {
  return {
    get address() {
      return addr;
    },
    get: () => {
      return client.getDelegate(addr).then(cloneDeep);
    }
  };
}
