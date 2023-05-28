import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '5cfaedad88a86907d6599d3ed72939b87999072d', queries });
export default client;
  