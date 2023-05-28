import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '950f3a05a9237130c5beffc60965d54754f93cc9', queries });
export default client;
  