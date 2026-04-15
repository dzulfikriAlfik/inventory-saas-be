import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  // Keep startup logging simple for local development and test runs.
  console.log(`Inventory SaaS API listening on port ${env.PORT}`);
});
