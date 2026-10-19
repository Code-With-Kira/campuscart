/** Frontend API router. Default: local Nuxt /api/v1 mock routes.
 * An agreed backend can be selected with NUXT_PUBLIC_API_BASE.
 * This helper changes transport paths, not the existing API contract.
 */
export function resolveApiUrl(configuredBase: string, path: string): string {
  const base = (configuredBase || '/api/v1').replace(/\/+$/, '')
  const suffix = path === '/api/v1' ? '' : path.startsWith('/api/v1/') ? path.slice('/api/v1'.length) : path
  return `${base}${suffix}`
}

export function apiUrl(path: string): string {
  return resolveApiUrl(String(useRuntimeConfig().public.apiBase || '/api/v1'), path)
}
