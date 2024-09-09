import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import solid from 'vite-plugin-solid'
import { preload, renderer } from 'unplugin-auto-expose';
import Pages from 'vite-plugin-pages'
import Icons from 'unplugin-icons/vite'
import { Traverse } from 'neotraverse/modern';
import { lazy } from "solid-js";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    optimizeDeps: {
      exclude: ['@duckdb/duckdb-wasm'],
    },
    plugins: [
      externalizeDepsPlugin(), 
      // preload.vite()
    ]
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
            // if (node.component && typeof node.component == 'string') {
            //   console.log('before: ', node.component)
            //   const without = node.component.replace(/\..+$/, '')
            //   console.log('after: ', without)
            //   node.component = lazy(() => import(without))
            // }
          })
          console.log({routes})
          return routes
        },
        dirs: [{
          dir:'src/routes',
          filePattern: `**\/*.page.tsx`,
          baseRoute: '/',
        }]
      }),
      // renderer.vite({
      //   preloadEntry: 'src/preload/index.mjs'
      // })
    ]
  }
})
