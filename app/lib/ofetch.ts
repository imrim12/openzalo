import type { $Fetch } from 'nitropack'
import { useAuthApi } from '~/api/useAuthApi'

declare module 'ofetch' {
  interface FetchOptions {
    silent?: boolean
  }
}

function interpolatePath(path: string, params: Record<string, string>) {
  return path.replace(/:(\w+)/g, (match, key) => {
    if (key in params) {
      const val = params[key]

      delete params[key]

      return String(val)
    }
    return match
  })
}

export const $http = $fetch.create({
  onRequest(context) {
    const { options } = context

    // Handle loading indicator
    if (!options.silent && import.meta.client) {
      useLoadingIndicator().start()
    }

    if (typeof context.request === 'string' && options.query) {
      context.request = interpolatePath(context.request, options.query)
    }

    const headers = new Headers(options.headers)

    if (import.meta.server) {
      const reqHeaders = useRequestHeaders(['cookie'])
      for (const [key, value] of Object.entries(reqHeaders)) {
        if (value) {
          headers.set(key, value)
        }
      }
    }

    if (typeof useCsrf !== 'undefined') {
      const csrfConfig = useCsrf()
      if (csrfConfig.headerName && csrfConfig.csrf) {
        headers.set(csrfConfig.headerName, csrfConfig.csrf)
      }
    }

    options.headers = headers
  },
  onResponse(context) {
    if (!context.options.silent && import.meta.client) {
      useLoadingIndicator().finish()
    }
  },
  async onResponseError(error) {
    if (!error.options.silent && import.meta.client) {
      useLoadingIndicator().finish({ error: true })
    }

    const authApi = useAuthApi()

    const statusCode = error?.response?.status

    const runtimeConfig = useRuntimeConfig()
    const baseDomain = runtimeConfig.public.baseDomain as string
    const baseUrl = (!import.meta.dev || runtimeConfig.public.sslEnabled)
      ? `https://${baseDomain}`
      : `http://${baseDomain}`
    const isRequestFromExternalUrl = !String(error.response.url).startsWith(baseUrl)

    switch (statusCode) {
      case 401: {
        if (error.request.toString().includes('auth') || isRequestFromExternalUrl)
          return
        try {
          await authApi.logout()
        }
        catch {
          //
        }
        finally {
          navigateTo('/auth/login')
        }
        break
      }
      default: {
        //
      }
    }
  },
}) as $Fetch
