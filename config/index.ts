import { defineConfig } from '@tarojs/cli'
import path from 'path'
import devConfig from './dev'
import prodConfig from './prod'

export default defineConfig(async (merge, { command: _command, mode: _mode }) => {
  const baseConfig = {
    projectName: 'money-ledger-miniprogram',
    date: '2026-06-16',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: ['@tarojs/plugin-framework-react', '@tarojs/plugin-platform-weapp'],
    defineConstants: {},
    alias: {
      '@': path.resolve(__dirname, '..', 'src')
    },
    copy: {
      patterns: [],
      options: {}
    },
    framework: 'react',
    compiler: 'webpack5',
    cache: {
      enable: false
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {}
        },
        url: {
          enable: true,
          config: {
            limit: 1024
          }
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
    },
    h5: {}
  }

  if (process.env.NODE_ENV === 'production') {
    return merge({}, baseConfig, prodConfig)
  }

  return merge({}, baseConfig, devConfig)
})
