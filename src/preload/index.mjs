import { contextBridge, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { readFileSync } from 'node:fs'
// import { db } from './duckdb'

// // Custom APIs for renderer
const api = {}

// // Use `contextBridge` APIs to expose Electron APIs to
// // renderer only if context isolation is enabled, otherwise
// // just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('webUtils', webUtils)
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('readFile', readFileSync)
    
    // contextBridge.exposeInMainWorld('db', db)

  } catch (error) {
    console.error(error)
  }
} else {
  window.readFile = readFileSync
  // @ts-ignore (define in dts)
  window.webUtils = webUtils
  // @ts-ignore (define in dts)
  // window.db = db
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
