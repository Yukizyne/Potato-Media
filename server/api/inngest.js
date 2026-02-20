import { serve } from "inngest/express";
import { inngest, functions } from "../Inggest/index.js";

export default serve({ client: inngest, functions });
