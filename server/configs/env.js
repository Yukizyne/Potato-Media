import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverEnvPath = path.join(__dirname, "..", ".env");
const rootEnvPath = path.join(__dirname, "..", "..", ".env");

dotenv.config({ path: fs.existsSync(serverEnvPath) ? serverEnvPath : rootEnvPath });
