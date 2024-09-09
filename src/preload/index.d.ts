import { ElectronAPI } from '@electron-toolkit/preload'
import { webUtils } from 'electron'
import { db } from './duckdb.js'
import { readFileSync } from 'fs'

declare global {
  interface Window {
    webUtils: typeof webUtils
    electron: ElectronAPI
    api: unknown
    db: typeof db
    readFile: typeof readFileSync
  }
}
