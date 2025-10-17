// Access import.meta.env in a way that won't break Jest/CommonJS
function getImportMetaEnv(): Record<string, string> | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const im: any = (0, eval)("import.meta")
    return im?.env as Record<string, string>
  } catch {
    return undefined
  }
}

export function getEnv(key: string): string {
  const viteEnv = getImportMetaEnv()
  const value = (viteEnv && viteEnv[key]) || process.env[key]
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

export function getEnvOptional(key: string): string | undefined {
  const viteEnv = getImportMetaEnv()
  const value = (viteEnv && viteEnv[key]) || process.env[key]
  return typeof value === "string" && value.length > 0 ? value : undefined
}

