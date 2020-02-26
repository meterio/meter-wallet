import cloneDeep from "lodash.clonedeep";

export function createStakeholderVisitor(
  client: Client,
  addr: string
): Connex.Meter.StakeholderVisitor {
  return {
    get address() {
      return addr;
    },
    get: () => {
      return client.getStakeholder(addr).then(cloneDeep);
    }
  };
}
