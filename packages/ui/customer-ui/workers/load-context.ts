import { type PlatformProxy } from 'wrangler'
import type { IncomingRequestCfProperties } from '@cloudflare/workers-types'

declare module '@remix-run/cloudflare' {
  interface AppLoadContext extends ReturnType<typeof getLoadContext> {
    // This will merge the result of `getLoadContext` into the `AppLoadContext`
  }
}

export function getLoadContext({
  context,
}: {
  request: Request
  context: {
    cloudflare: Omit<PlatformProxy<Env, IncomingRequestCfProperties>, 'dispose' | 'caches'> & {
      caches: PlatformProxy<Env, IncomingRequestCfProperties>['caches'] | CacheStorage
    }
  }
}) {
  return {
    env: context.cloudflare.env,
    cf: context.cloudflare.cf,
    ctx: context.cloudflare.ctx,
    cache: context.cloudflare.caches,
  }
}
