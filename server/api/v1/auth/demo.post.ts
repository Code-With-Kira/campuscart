import { beginSession, getDemoPersona } from '../../../utils/mockAccounts'
export default defineEventHandler(async (event) => {
  // Opt-in legacy test aid; disabled in every build unless explicitly enabled locally.
  if (process.env.NODE_ENV !== 'development' || String(useRuntimeConfig(event).public.enableDemoPreview) !== 'true') {
    throw createError({ statusCode: 404, statusMessage: 'Demo preview is disabled' })
  }
  const body = await readBody(event)
  if (body?.role !== 'CUSTOMER' && body?.role !== 'ADMIN') throw createError({ statusCode: 422, statusMessage: 'Invalid demo persona' })
  return { success: true, data: beginSession(event, getDemoPersona(body.role)), message: 'Development-only demo preview session' }
})
