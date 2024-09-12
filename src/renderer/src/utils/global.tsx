import { createSignal, createMemo, createEffect } from "solid-js";
import { DuckDBDataProtocol } from '@duckdb/duckdb-wasm';
import { createAsync, useBeforeLeave, cache } from "@solidjs/router";
import { couldBeGTIN, formatGTIN, parseGTINFormat } from "@chumsinc/gtin-tools";
import {
  flexRender,
  getCoreRowModel,
  ColumnDef,
  createSolidTable,
} from '@tanstack/solid-table'
import { titleCase } from "scule";
import epc from 'epc-tds'
import { extractCompanyPrefix } from "./upc";



export const [ db, setDb ] = createSignal(window.db)


export const conn = createAsync(async () => {
  const currentDB = db()
  if (currentDB) {
    const connection = await currentDB.connect()
    return connection
  }
})

export type UploadFile = {
    source: string;
    name: string;
    size: number;
    file: File;
    path?: String;
}

export const [ currentFile, setCurrentFile ] = createSignal<UploadFile>()

export const registerFile = (uploadedFile: UploadFile | undefined) => {
    if (uploadedFile) db().registerFileHandle(uploadedFile.name, uploadedFile.file, DuckDBDataProtocol.BROWSER_FILEREADER, true)
}

createEffect(() => {
  registerFile(currentFile())
})

type DescriptionObj = {
  column_name: string, 
  column_type: string,
  null: string,
  key: any,
  default: any,
  extra: any,
} 

export const currentFileDescription = createAsync<DescriptionObj[]>(async () => {
  const file = currentFile()
  const connection = conn()
  if (file && connection) {
      let result = (await connection.query(`describe SELECT * FROM '${file.name}'`))
      let arrayResult = result.toArray().map(v => Object.fromEntries(Object.entries(v)))
      // console.log({result, arrayResult})
      return arrayResult
  }
})

export const sample = createAsync(async () => {
  const file = currentFile()
  const connection = conn()
  if (!(file && connection)) return;

  let result = (await connection.query(`SELECT * FROM '${file.name}' USING SAMPLE reservoir(25%)`))
  let arrayResult = result.toArray().map(v => Object.fromEntries(Object.entries(v)))

  return arrayResult
})

export const allData = createAsync(async () => {
  const file = currentFile()
  const connection = conn()
  if (!(file && connection)) return;

  let result = (await connection.query(`SELECT * FROM '${file.name}'`))
  let arrayResult = result.toArray().map(v => Object.fromEntries(Object.entries(v)))

  return arrayResult
})

const example_desc = [
        {
            "column_name": "prefix",
            "column_type": "VARCHAR",
            "null": "YES",
            "key": null,
            "default": null,
            "extra": null
        },
        {
            "column_name": "itemPart",
            "column_type": "VARCHAR",
            "null": "YES",
            "key": null,
            "default": null,
            "extra": null
        },
        {
            "column_name": "brand",
            "column_type": "VARCHAR",
            "null": "YES",
            "key": null,
            "default": null,
            "extra": null
        },
        {
            "column_name": "sku",
            "column_type": "VARCHAR",
            "null": "YES",
            "key": null,
            "default": null,
            "extra": null
        },
        {
            "column_name": "name",
            "column_type": "VARCHAR",
            "null": "YES",
            "key": null,
            "default": null,
            "extra": null
        },
        {
            "column_name": "description",
            "column_type": "VARCHAR",
            "null": "YES",
            "key": null,
            "default": null,
            "extra": null
        },
        {
            "column_name": "img",
            "column_type": "VARCHAR",
            "null": "YES",
            "key": null,
            "default": null,
            "extra": null
        },
        {
            "column_name": "date",
            "column_type": "VARCHAR",
            "null": "YES",
            "key": null,
            "default": null,
            "extra": null
        },
        {
            "column_name": "marketplace",
            "column_type": "VARCHAR",
            "null": "YES",
            "key": null,
            "default": null,
            "extra": null
        },
        {
            "column_name": "notes",
            "column_type": "VARCHAR",
            "null": "YES",
            "key": null,
            "default": null,
            "extra": null
        }
    ]


function* contiguousCombinations<T extends unknown[]>(arr: T, limit = 4) {
  let current = 0
  while (current <= limit) {
    for (let i = 0; i <= arr.length - current; i++) {
      yield arr.slice(i, i + (current + 1)) as typeof arr
    }
    current += 1
  }

}

export const createGetId = createMemo(() => {
  const desc = currentFileDescription()

  const items = sample()

  if (!items || !desc) return;
  const notes_idx =desc.findIndex(c => c.column_name == 'notes') 
  if (notes_idx !== -1) desc.splice(notes_idx, 1);

  const upcColumns: DescriptionObj[] = []

  for (let combo of contiguousCombinations(desc)) {
    const numberPart = () => items.map(item => {
      let result = ''
      for (let descriptor of combo) {
        // console.log({item, columnName: descriptor.column_name, value: item[descriptor.column_name]})
        const number = (String(item?.[descriptor.column_name] || '').match(/\d+/g) || []).join('')

        if (number && !descriptor.column_name.includes('date')) result += number;
      }
      if (result) return result
      return undefined
    }).filter(Boolean);

    // console.log(numberPart())

    const areAllEmptyOrUpc = () => {
      if (!(numberPart().length > 1)) return false
      return numberPart().every(number => {
        if (!number) return false
        console.log({
          number,
          couldBeGTIN: couldBeGTIN(number) && number.length > 10
        })
        try { 
          if (number) console.log("EPC ", epc.valueOf(number), 'number', number, 'numberPart', numberPart())
        } catch(e) {};

        if (couldBeGTIN(number || '') && (number || '').length > 8) return true
        return false
      })
    }
    console.log('areAllEmptyOrUPC', areAllEmptyOrUpc(), combo)

    const gotRightColumns = areAllEmptyOrUpc()

    if (gotRightColumns) {
      console.log({rightColumns: combo})
      upcColumns.push(...combo)
      break;
    }
  }

  const getter = (obj) => {
    let id = ``

    let parts: Part[] = []
    type Part = {
      originalValue: string,
      value: string,
      column: DescriptionObj 
    }
    // console.log('UPC COLUMNs', upcColumns)

    for (let upcColumn of upcColumns) {
      const og = String(obj?.[upcColumn.column_name] || '')
      const part = (og.match(/\d+/g) || []).join('')
      // console.log('og', og, 'part', part, 'parts', parts)

      if (part) {
        parts.push({
          originalValue: og,
          value: part,
          column: upcColumn
        })

        id += part
      }
      
    }

    return {
      raw: id,
      get formatted() {
        return formatGTIN(id)
      },
      get value() {
        return formatGTIN(id)
      },
      get type() {
        return parseGTINFormat(id)
      },
      get parts() {
        return parts
      }
    }
  }

  return getter
})



export const tanstackTableColumnDefsForCurrentTable = createMemo(() => {
  const desc = currentFileDescription()


  const getId = createGetId()

  const items = sample()
  let header = 'UPC'
  let idColumns: DescriptionObj[]  = []

  if (items) {
    for (let item of items) {
      const id = getId?.(item)
      if (id?.type) {
        let format = parseGTINFormat(id.value)
        if (format) header = format
        idColumns = id.parts.map(v => v.column)
      }
      break;
    }
  }

  const tanstackColumnDefs: ColumnDef<unknown>[] = [] 

  tanstackColumnDefs.push({
    accessorFn: info => getId?.(info)?.formatted,
    id: 'id',
    header: getHeader(header)
  })

  for (let description of desc || []) {
    if (idColumns.includes(description)) continue;
    tanstackColumnDefs.push({
      id: description.column_name,
      accessorKey: description.column_name,
      cell: getCell(description),
      header: getHeader(description.column_name)
    })
  }

  return tanstackColumnDefs
})

  


  function getCell(description: DescriptionObj) {
    return (info: unknown) => {
      // console.log({info, description, value: info?.[description?.column_name] || '', getValue: info?.getValue?.()})
      return (<div class="table-cell-content">{info?.getValue() || ''}</div>)
    }
  }

  function getHeader(headerName: string) {
    
    return () => {
      return (<div class="table-header-text">{titleCase(headerName)}</div>)
    }
  }




export const [ lastPage, setLastPage ] = createSignal()

export function createBackButton() {

  useBeforeLeave((e) => {
    setLastPage(e.from)
    // console.log(e.from.pathname, e.from.query, e.from.search)
  })

}



export const determineBrands = createAsync(async function () {
  const connection = conn()
  const file = currentFile()
  const getId = createGetId()

  if (!connection || !file || !getId) return [];

  const data = await connection.query(`SELECT DISTINCT ON (brand) * FROM ${ file.name } ORDER BY brand;`)
  
  let result: {brand: string, companyCode: string}[] = []

  console.log('BRANDS DATA', data.toString())
  for (let item of data.toArray()) {
    let id: any = getId(item)
    console.log('ID before', id)
    id = id.formatted.replace(/\s+/g, '')
    console.log('ID after', id)
    const parent = extractCompanyPrefix(id)

    result.push({
      brand: item.brand,
      companyCode: parent,
    })
  }

  console.log(`result`, result)

  return result
})