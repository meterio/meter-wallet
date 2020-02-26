import { create as createMeter } from "./meter";
import { create as createVendor } from "./vendor";
import { throttle } from "./throttle";

// tslint:disable-next-line:no-var-requires
const connexVersion = require("meter-connex/package.json").version;

export function create(client: Client, concurrent: number): Connex {
  client = throttle(client, concurrent);
  return {
    version: connexVersion,
    meter: createMeter(client),
    vendor: createVendor()
  };
}
