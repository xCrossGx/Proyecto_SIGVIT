import pgp from "pg-promise";
import { POSTGRES_CONFIG } from "./config.js";

const pg = pgp();
export const db = pg(POSTGRES_CONFIG);