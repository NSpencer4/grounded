import type { AppConfig } from '@remix-run/dev'

const config: AppConfig = {
  serverPlatform: 'node',
  appDirectory: 'src',
  assetsBuildDirectory: 'public/build',
  serverBuildPath: 'build/index.js',
  publicPath: '/build/',
}

export default config
