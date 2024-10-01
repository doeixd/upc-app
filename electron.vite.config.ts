import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import solid from 'vite-plugin-solid'
import { preload, renderer } from 'unplugin-auto-expose';
import Pages from 'vite-plugin-pages'
import Icons from 'unplugin-icons/vite'
import { Traverse } from 'neotraverse/modern';
import { lazy } from "solid-js";
import { patchCssModules } from 'vite-css-modules';

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
        '@renderer': resolve('src/renderer/src'),
        '@components': resolve('src/renderer/src/components'),
      }
    },
    build: {
      target: 'esnext'
    },    
    css: {
      modules: {
        localsConvention: 'camelCase',
        exportGlobals: true,
      },
    },
    plugins: [
      solid(),
      patchCssModules(),
      Icons({compiler: 'solid'}),
      Pages({
        onRoutesGenerated: (routes) =>{

          let last;
          new Traverse(routes).nodes().forEach(node => {
            if (node.path) node.path = node.path.replace(/\.page/i, '')
            if (node.path && node.path == 'index') node.path = '/'
            let cur = (node?.path || '')?.match(/\w+(?=$|\.page\.[tj]sx?)/)?.at(0)?.trim()
            // console.log({cur, last, path: node?.path, _new: ('/' + (node?.path || '').replace(/\w+(?=$|\.page\.[tj]sx?)/, '/')).trim().replace(/\/\/+/g, '/') })
            if (cur == last && node?.path) { node.path = ('/' + node.path.replace(/\w+(?=$|\.page\.[tj]sx?)/, '/')).trim().replace(/\/\/+/g, '/')}
            if (cur) last = cur
            // if (node.component && typeof node.component == 'string') {
            //   console.log('before: ', node.component)
            //   const without = node.component.replace(/\..+$/, '')
            //   console.log('after: ', without)
            //   node.component = lazy(() => import(without))
            // }
          })
          console.log({routes, add: routes?.[2]?.children})
          return routes
        },
        // onClientGenerated(str) {


        // },
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
