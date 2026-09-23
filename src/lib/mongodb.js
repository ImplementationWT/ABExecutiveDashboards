import { MongoClient } from "mongodb";

const dbName = process.env.MONGODB_DB || "executive-dashboards";

function createClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI — set it in .env.local");
  }
  return new MongoClient(uri).connect();
}

/* Reuse a single client (and its connection pool) across every request in
   this process — including Fast Refresh reloads in dev — instead of opening
   a new pool on every call. Cached on `global` rather than a module-level
   variable so it survives Fast Refresh, which re-evaluates this module on
   every file save in dev. If a connection attempt fails (e.g. bad
   credentials), the cache is cleared so the next call retries against
   whatever MONGODB_URI currently holds, instead of replaying the same
   rejected promise forever. */
export async function getDb() {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }

  try {
    const client = await global._mongoClientPromise;
    return client.db(dbName);
  } catch (err) {
    global._mongoClientPromise = undefined;
    throw err;
  }
}