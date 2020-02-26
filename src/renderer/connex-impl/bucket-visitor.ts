import cloneDeep from "lodash.clonedeep";

export function createBucketVisitor(
  client: Client,
  id: string
): Connex.Meter.BucketVisitor {
  return {
    get id() {
      return id;
    },
    get: () => {
      return client.getBucket(id).then(cloneDeep);
    }
  };
}
