import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import solid from 'vite-plugin-solid'
import { preload, renderer } from 'unplugin-auto-expose';
import Pages from 'vite-plugin-pages'
import { Traverse } from 'neotraverse/modern';
import Icons from 'unplugin-icons/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin(), preload.vite()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      solid(),
      Icons({compiler: 'solid'}),
      Pages({
        onRoutesGenerated: (routes) =>{
          new Traverse(routes).nodes().forEach(node => {
            if (node.path) node.path = node.path.replace(/\.page/i, '')
            if (node.path && node.path == 'index') node.path = '/'
          })
          return routes
        },
        dirs: [{
          dir:'src/routes',
          filePattern: `**\/*.page.tsx`,
          baseRoute: '/',
        }]
      }),
      renderer.vite({
        preloadEntry: '/src/preload/index.ts'
      })
    ]
  }
})
