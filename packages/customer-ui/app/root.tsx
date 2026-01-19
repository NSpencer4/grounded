import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import stylesUrl from '~/styles.css?url'

import './index.css'
import React from 'react'

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }]
}
export const meta: MetaFunction = () => {
  return [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { title: 'remix-cloudlfare-template' },
  ]
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:image" content="https://bolt.new/static/og_default.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://bolt.new/static/og_default.png" />
        <title>Customer Service Chat App</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
