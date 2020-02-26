import cloneDeep from "lodash.clonedeep";

export function createCandidateVisitor(
  client: Client,
  addr: string
): Connex.Meter.CandidateVisitor {
  return {
    get address() {
      return addr;
    },
    get: () => {
      return client.getCandidate(addr).then(cloneDeep);
    }
  };
}
