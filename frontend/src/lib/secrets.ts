// frontend/src/lib/secrets.ts
//
// Single source of truth for all runtime secrets.
// Resolution order:
//   1. 1Password SDK (when OP_SERVICE_ACCOUNT_TOKEN is set — production / demo)
//   2. process.env fallback (local dev convenience)
//
// This means: in production, ZERO plaintext secrets are needed anywhere.

const cache = new Map<string, string>();

export async function getSecret(
  opRef: string,
  envFallback: string
): Promise<string> {
  const cacheKey = opRef;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const token = process.env.OP_SERVICE_ACCOUNT_TOKEN;

  if (token) {
    const { createClient } = await import("@1password/sdk");
    const client = await createClient({
      auth: token,
      integrationName: "Alice in Wellnessland",
      integrationVersion: "1.0.0",
    });
    const value = await client.secrets.resolve(opRef);
    cache.set(cacheKey, value);
    return value;
  }

  // Dev fallback
  const value = process.env[envFallback];
  if (!value) {
    throw new Error(
      `Missing secret: set OP_SERVICE_ACCOUNT_TOKEN (1Password) or ${envFallback} (.env)`
    );
  }
  cache.set(cacheKey, value);
  return value;
}

// Pre-named getters — import these instead of calling getSecret directly

export const getGeminiApiKey = () =>
  getSecret("op://Alice-in-Wellnessland/Gemini/api-key", "GEMINI_API_KEY");

export const getMongoUri = () =>
  getSecret(
    "op://Alice-in-Wellnessland/MongoDB/connection-string",
    "MONGODB_URI"
  );

export const getClerkSecretKey = () =>
  getSecret("op://Alice-in-Wellnessland/Clerk/secret-key", "CLERK_SECRET_KEY");
