import { createSignal, createMemo, createEffect } from "solid-js";
import { DuckDBDataProtocol } from '@duckdb/duckdb-wasm';
import { createAsync, useBeforeLeave, cache } from "@solidjs/router";
import { couldBeGTIN, formatGTIN, parseCheckDigit, parseGTINFormat } from "@chumsinc/gtin-tools";
import {
  flexRender,
  getCoreRowModel,
  ColumnDef,
  createSolidTable,
} from '@tanstack/solid-table'
import { titleCase } from "scule";
import epc from 'epc-tds'
import { extractCompanyPrefix } from "./upc";
import { createPrefixTree } from "./prefixTree";
import HeroiconsCheck20Solid from '~icons/heroicons/check-16-solid'

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


export function updateData(oldRow, newRow) {
  // const file = currentFile()
  // const connection = await conn()

  // const shouldContinue = connection && file

  // if (!shouldContinue)  return 
  let file = {name: 'data.csv'}

  console.log('old row', oldRow, 'newRow', newRow)

  const diff = detailedDiff(oldRow, newRow)

  console.log({oldRow, newRow, diff})
  const unchanged = Array.from(
    new Set(Object.keys(oldRow)).difference(
      new Set(Object.keys(diff.updated)))
  ).map(column => [column, oldRow[column]])

  const set = `SET ` + Object.entries(diff.updated).map(([column, value]) => `${column} = '${value}'`).join(',\n')
  const where = `WHERE \n` + unchanged.filter(([_, value]) => value).map(([column, value]) => `${column} = ${value}`).join('\n    AND ') + `;`

  const update = `UPDATE ${file.name} ${set} ${where}`

  console.log(update)
  console.log(update)
  // await connection.query(update)


}

type DescriptionObj = {
  column_name: string, 
  column_type: string,
  null: string,
  key: any,
  default: any,
  extra: any,
} 

export const currentFileDescription = createAsync<DescriptionObj[] | undefined>(async (prev) => {
  const file = currentFile()
  const connection = await conn()
  if (file && connection) {
    const result = await connection.query(`DESCRIBE SELECT * FROM '${file.name}'`)
      let arrayResult = result.toArray().map(v => Object.fromEntries(Object.entries(v)))
      // console.log({result, arrayResult})
      return arrayResult as DescriptionObj[]
  }
  return prev
})


export const sample = createAsync(async () => {
  const file = currentFile()
  const connection = await conn()
  if (!(file && connection)) return;

  let result = (await connection.query(`SELECT * FROM '${file.name}' USING SAMPLE reservoir(25%)`))
  let arrayResult = result.toArray().map(v => Object.fromEntries(Object.entries(v)))

  return arrayResult
})

export const allData = createAsync(async () => {
  const file = currentFile()
  const connection = await conn()
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

  const items = allData()

  if (!items || !desc) return;
  // const notes_idx =desc.findIndex(c => c.column_name == 'notes') 
  // if (notes_idx !== -1) desc.splice(notes_idx, 1);

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
        // console.log({
        //   number,
        //   couldBeGTIN: couldBeGTIN(number) && number.length > 10
        // })
        try { 
          // if (number) console.log("EPC ", epc.valueOf(number), 'number', number, 'numberPart', numberPart())
        } catch(e) {};

        if (couldBeGTIN(number || '') && (number || '').length > 8) return true
        return false
      })
    }
    // console.log('areAllEmptyOrUPC', areAllEmptyOrUpc(), combo)

    const gotRightColumns = areAllEmptyOrUpc()

    if (gotRightColumns) {
      // console.log({rightColumns: combo})
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
      const part = (og.match(/\d/g) || []).join('')
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
      },
      get checkDigit () {
        return parseCheckDigit(id)
      },
      get brand() {
        let brand_column = Object.keys(obj).find(k => k.includes('brand'))
        // @ts-ignore
        return obj?.[brand_column]
      }
    }
  }

  return getter
})

const getSubs = function* (str: string) {
  let window = 1
  while (window <= Math.min(str.length, 11)) {
      yield str.slice(0, window)
    window += 1
  }
}

// export const extractMerchantInfoFromListOfIds = (ids: ReturnType<typeof createGetId>[] | undefined) => {
//   const merchantIds = new Set<{id: string, percentage: number, brands: Set<string>}>()
//   const commonStrings = new Map<string, {count: number, brands: Set<string>}>()

//   for (const id of ids || []) {
//     const _id = id?.formatted?.replace(/\s+/g, '') || ''
    
//   }
// }

export const getAllIds = createAsync(async () => {
  try {
    const all = await allData()
    console.log({all})
    const getId = createGetId()

    const ids = (all ?? []).map(item => getId?.(item));
    
    return ids

  } catch (error) {
    console.error("Error fetching all IDs:", error);
    return [];
  }
})

interface MerchantIdInfo {
  brandNames: Set<string>;  // Changed from brandName: string
  merchantId: string;
  used: Set<string>;
  duplicates: Set<string>;
  unused: Set<string>;
  availabilityPercentage: Record<string, number>;
  inferredType: string;
  inferredTypeCapacity: number;
  usedFormats: Set<string>;
  examples: any[],
  prefixTree: ReturnType<typeof createPrefixTree>['bound']['root'],
  tree: ReturnType<typeof createPrefixTree>['bound']
}

export const getMerchantIds = createAsync(async () => {
  const ids = await getAllIds()

  const { bound: tree } = createPrefixTree()
  console.log('IDS BBY', ids)

  for (const id of ids || []) {
    const _id = id?.formatted?.replace(/\s+/g, '') || ''
    // console.log('ID', _id)
    tree.insert(_id, (node) => {
      if (!node || !node.data || !Array.isArray(node.data)) return [id]
      if (node.data) node.data.push(id)

      return node.data
    })
  }

  console.log('TREE', tree.inspect())

  const chains = tree.prefixChains()
  console.log('CHAINS', chains)

  const merchantsInfo =chains.map(chain => {
    const node = tree.getEndingNode(chain.prefix)
    const info: MerchantIdInfo = {
      brandNames: new Set<string>(),
      merchantId: chain.prefix,
      used: new Set<string>(),
      duplicates: new Set<string>(),
      unused: new Set<string>(),
      availabilityPercentage: {},
      inferredType: '',
      inferredTypeCapacity: 0,
      usedFormats: new Set<string>(),
      examples: chain.data,
      prefixTree: node,
      tree: tree,
    }


    for (let kid of tree.traverse([node])) {
      // console.log('KID', kid.char, kid.count, kid.ends)

      const isEnd = kid.ends > 0
      if (isEnd) {
        // console.log('END', kid)
        const upc = formatGTIN(kid.prefix.trim())

        // console.log('USED',upc, info.used.has(upc))

        if (info.used.has(upc) || kid.ends > 1) {
          info.duplicates.add(upc)
        }

        info.used.add(upc)

        ;(kid?.data || []).map(x => x.brand).flat().filter(Boolean).forEach(brand => {
          // console.log('BRAND', brand)
          info.brandNames.add(brand.trim())
          info.usedFormats.add(parseGTINFormat(kid.prefix) || '')
        })
      }
    }
    console.log('INFO USED: ', info, info.used, info.used.size)

    inferMostCommonType(info)
    generateUnusedIds(info)
    calculateAvailabilityPercentage(info)


    let unusedWithoutCheckDigit = new Set<string>()
    info.unused.forEach(id => {
      const itemPart = id.split(/\s+/).at(2)
      // console.log('unused', id, ' | Adding: ', itemPart)
      unusedWithoutCheckDigit.add(itemPart)
    })
    unusedWithoutCheckDigit = [...unusedWithoutCheckDigit].toSorted((a,b) => {
      if (parseInt(a) > parseInt(b)) return 1
      if (parseInt(b) > parseInt(a)) return -1
      return 0
    }).map(a => [ a, 'unused' ])
    console.log('unusedWithoutCheckDigit', unusedWithoutCheckDigit)

    let usedWithoutCheckDigit = new Set<string>()
    info.used.forEach(id => {
      const itemPart = id.split(/\s+/).at(2)
      // console.log('used', id, ' | Adding: ', itemPart)
      usedWithoutCheckDigit.add(itemPart)
    })

    usedWithoutCheckDigit = [...usedWithoutCheckDigit].toSorted((a, b) => {
      if (parseInt(a) > parseInt(b)) return 1
      if (parseInt(b) > parseInt(a)) return -1
      return 0
    }).map(a => {
      return [ a, 'used']
    })

    console.log('usedWithoutCheckDigit', usedWithoutCheckDigit)

    const all = [...usedWithoutCheckDigit, ...unusedWithoutCheckDigit].toSorted((a, b) => {
      if (parseInt(a[0]) > parseInt(b[0])) return 1
      if (parseInt(b[0]) > parseInt(a[0])) return -1
      return 0

    })
    console.log('ALL: ', all)

    const filtered = all.filter((item, index, arr, last = arr[index - 1] || ['', '']) => {
      if (last[0] == item[0]) return true
      return false
    })

    console.log('FIltered: ', filtered)




    // let duplicatesWithoutCheckDigit = new Set<string>()
    // usedWithoutCheckDigit.forEach(id => {
    //   // console.log('CHecking on it: ', id, unusedWithoutCheckDigit.has(id))
    //   if (unusedWithoutCheckDigit.has(id)) {
    //     duplicatesWithoutCheckDigit.add(id)
    //   }
    // })

    // console.log('DUPLICATES WITHOUT CHECK DIGIT', duplicatesWithoutCheckDigit)
    // console.log('DUPLICATES WITHOUT CHECK DIGIT', duplicatesWithoutCheckDigit)

    // info.unused = unusedWithoutCheckDigit
    // info.used.forEach(id => {
    //   const unusedHas = info.unused.has(id) 
    //   if (unusedHas) console.log('UNUSED HAS', id)
    //   if (unusedHas) {
    //     info.unused.delete(id)
    //   }
    // })

    console.log('INFO', info)
    return info
  })

  console.log('CHAINS CHAINS CHAINS', chains)

  console.log('MERCHANTS INFO', merchantsInfo)


  return merchantsInfo
})

export const getMerchantId = (id: string): string => {
  // Remove all whitespace and ensure we're working with raw digits
  const rawGTIN = id.replace(/\s+/g, '');
  
  // Determine the GTIN type based on the raw digits
  const gtinType = parseGTINFormat(rawGTIN);
  
  if (!gtinType) {
    console.warn(`Invalid GTIN format: ${rawGTIN}`);
    return '';
  }

  // Extract the merchant ID based on GTIN type
  switch (gtinType) {
    case 'GTIN-8':
      return rawGTIN.slice(3, 7);
    case 'GTIN-12':
      return rawGTIN.slice(0, 6);
    case 'GTIN-13':
      return rawGTIN.slice(1, 7);
    case 'GTIN-14':
      return rawGTIN.slice(1, 7);
    default:
      console.warn(`Unexpected GTIN type: ${gtinType}`);
      return '';
  }
};


const isDate = (val) => {
  let d = (new Date(val)).getTime()
  return d === d && val
}


export const tanstackTableColumnDefsForCurrentTable = createMemo(() => {
  const desc = currentFileDescription()
  console.log('DESC: ', desc)

  const getId = createGetId()

  const items = allData()
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
    id: 'selection',
    header: ({table}) => {
      return (
      <label class="checkbox-label" for={'table' + 'select'} onChange={table.getToggleAllRowsSelectedHandler()}>
        <input type="checkbox" name={'table' + 'select'} checked={table.getIsAllRowsSelected()}/>
        <HeroiconsCheck20Solid />
      </label>
      ) 
    },
    cell: ({row, table}) => {
      const isChecked = createMemo(() => {
        return row.getIsSelected()
      })
      const [checked, setChecked] = createSignal(isChecked())

      createEffect(() => {
        console.log(table)
        console.log('IS CHecked: ', isChecked())
      })
     return (<>
      <Checkbox name={row.id + 'select'} checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()}/> 
     </>)   
    }

  })

  tanstackColumnDefs.push({
    accessorFn: info => getId?.(info)?.formatted,
    id: 'id',
    header: getHeader(header)
  })

  console.log({desc})

  for (let description of desc || []) {
    if (idColumns.includes(description)) continue;
    tanstackColumnDefs.push({
      id: description.column_name,
      accessorKey: description.column_name,
      // cell: getCell(description),
      cell: ({getValue, row: { index }, column: { id }, table}) => {
        const initialValue = getValue()

        const [value, setValue] = createSignal(initialValue)
        const isValueADate = createMemo(() => {
          const c = description.column_name.toLowerCase()
          return isDate(value()) && c.includes('date') || c.includes('at')
        })

        const onBlur = () => {
          table.options.meta?.updateData(index, id, value)
        }

        createEffect(() => {
          setValue(initialValue)
        })

        if (isValueADate()) {
          let d = new Date(value())
          d = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`

          return (
            <>
              <input type="date" name="" id="" value={d} onChange={e => setValue(e.target.valueAsDate)} onBlur={onBlur}/>
            </>
          )
        }

        return (
          <input 
            value={value() as string} 
            onChange={e => setValue(e.target.value)}
            onBlur={onBlur}
          />
        )


      },
      header: getHeader(description.column_name),
      enableSorting: true,
      // sortingFn: (...args) => {
      //   console.log('SORTING FN CALLED', args)
      //   return 0
      // }
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

import HeroiconsBarsArrowDownSolid from '~icons/heroicons/bars-arrow-down-solid'
import { detailedDiff, updatedDiff } from "deep-object-diff";
import { Checkbox } from "@renderer/components/inputs/Checkbox";


function getHeader(headerName: string) {
  
  return () => {
    return (
      // <div class="table-header-text">
        titleCase(headerName)
      // </div>
    )
  }
}


export const [ lastPage, setLastPage ] = createSignal()

export function createBackButton() {

  useBeforeLeave((e) => {
    setLastPage(e.from)
    // console.log(e.from.pathname, e.from.query, e.from.search)
  })

}



function getGTINCapacity(gtinType: string): number {
  switch (gtinType) {
    case 'GTIN-8': return 10000;
    case 'GTIN-12': return 100000;
    case 'GTIN-13': return 100000;
    case 'GTIN-14': return 1000000;
    default: return 0;
  }
}

function inferMostCommonType(info: MerchantIdInfo) {
  const typeCounts = Array.from(info.used).reduce((counts, id) => {
    const type = parseGTINFormat(id);
    if (type) {
      counts[type] = (counts[type] || 0) + 1;
    }
    return counts;
  }, {} as Record<string, number>);

  const [inferredType] = Object.entries(typeCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0]);
  info.inferredType = inferredType;
  info.inferredTypeCapacity = getGTINCapacity(inferredType);
}

export const getMerchantIdUseInfo = createAsync(async () => {
  const ids = await getAllIds();
  // console.log("All IDs:", ids);

  const merchants: Record<string, MerchantIdInfo> = {};

  for (let id of ids || []) {
    // console.log("Processing ID:", id);

    if (typeof id === 'function') {
      // console.log("Skipping function ID");
      continue;
    }

    if (!id || typeof id !== 'object') {
      // console.log("Skipping non-object ID:", id);
      continue;
    }

    const { merchantId, formatted, parts } = id;
    const type = parseGTINFormat(formatted);

    // console.log("Extracted data:", { merchantId, type, formatted, parts });

    if (!merchantId) {
      // console.log("Skipping due to missing merchantId");
      continue;
    }

    if (!merchants[merchantId]) {
      merchants[merchantId] = {
        brandNames: new Set<string>(),
        usedFormats: new Set<string>(),
        merchantId,
        used: new Set<string>(),
        duplicates: new Set<string>(),
        unused: new Set<string>(),
        availabilityPercentage: {},
        inferredType: '',
        inferredTypeCapacity: 0
      };
    }

    const info = merchants[merchantId];

    if (type) {
      info.usedFormats.add(type);
    }

    if (info.used.has(formatted)) {
      info.duplicates.add(formatted);
    } else {
      info.used.add(formatted);
    }
    // Add brand name to the Set of brand names
    const curBrand = id.brand
    if (curBrand) {
      info.brandNames.add(curBrand);
    }
  }

  console.log("Processed merchants:", merchants);

  for (const info of Object.values(merchants)) {
    generateUnusedIds(info);
    calculateAvailabilityPercentage(info);
    inferMostCommonType(info);
  }

  const result = Object.values(merchants).map(info => ({
    ...info,
    brandNames: Array.from(info.brandNames),
    usedFormats: Array.from(info.usedFormats),
    used: Array.from(info.used),
    duplicates: Array.from(info.duplicates),
    unused: info.unused,
    availabilityPercentage: info.availabilityPercentage,
    inferredType: info.inferredType,
    inferredTypeCapacity: info.inferredTypeCapacity
  }));

  console.log("Final result:", result);

  return result;
});

function generateUnusedIds(info: MerchantIdInfo) {
  for (const idType of info.usedFormats) {
    const maxDigits = getMaxDigits(idType);
    console.log('MAX DIGITS', maxDigits)
    if (!maxDigits) continue;

    const prefix = info.merchantId.replace(/\D/g, '')
    console.log('PREFIX', prefix.length, typeof prefix, prefix, info.merchantId)
    const suffixLength = maxDigits - prefix.length - 1; // -1 for check digit


    console.log('SUFFIX LENGTH', suffixLength, 10 ** (suffixLength))
    for (let i = 0; i <= 10 ** (suffixLength); i++) {
      const suffix = i.toString().padStart(suffixLength, '0')
      const potentialId = prefix + suffix
      const formattedId = formatGTIN(potentialId)
      const normalizedId = formattedId.replace(/\s+/g, '')
      
      const hasId = Boolean(info.used.has(formattedId) || info.used.has(potentialId) || info.used.has(normalizedId))
      // console.log('HAS ID', hasId, `[ ${prefix} ${suffix} ]`, 'formattedId', formattedId, ' | ', 'potentialId', potentialId, ' | ', 'normalizedId', normalizedId)
      // if (hasId) console.log('HAS ID: ', formattedId, ' ||| ', info.used.has(formattedId), info.used.has(potentialId), info.used.has(normalizedId))
      if (!hasId && couldBeGTIN(normalizedId)) {
        // console.log('DOESNT HAVE ID: ', formattedId)
        info.unused.add(formattedId)
      }
      // console.log('\n')
    }
  }
}

function calculateAvailabilityPercentage(info: MerchantIdInfo) {
  for (const idType of info.usedFormats) {
    const maxDigits = getMaxDigits(idType)
    if (!maxDigits) continue

    const totalPossible = 10 ** (maxDigits - info.merchantId.length - 1)
    console.log('Total possible: ', totalPossible)
    const used = Array.from(info.used).filter(id => parseGTINFormat(id) === idType).length
    console.log('calculated used: ', used)
    console.log('total possible - used', totalPossible - used)
    
    const availablePercentage = ((totalPossible - used) / totalPossible) * 100


    info.availabilityPercentage[idType] = parseFloat(availablePercentage.toFixed(2))
    console.log('AVAILABILITY PERCENTAGE', idType, info.availabilityPercentage[idType])
  }
}

function getMaxDigits(idType: string): number | null {
  switch (idType) {
    case 'GTIN-8': return 8;
    case 'GTIN-12': return 12;
    case 'GTIN-13': return 13;
    case 'GTIN-14': return 14;
    default: return null;
  }
}

export const determineBrands = createAsync(async function () {
  const connection = conn()
  const file = currentFile()
  const getId = createGetId()

  if (!connection || !file || !getId) return [];

  const data = await connection.query(`SELECT DISTINCT ON (brand) * FROM ${ file.name } ORDER BY brand;`)
  
  let result: {brand: string, companyCode: string}[] = []

  // console.log('BRANDS DATA', data.toString())
  for (let item of data.toArray()) {
    let id: any = getId(item)
    // console.log('ID before', id)
    id = id.formatted.replace(/\s+/g, '')
    // console.log('ID after', id)
    const parent = extractCompanyPrefix(id)

    result.push({
      brand: item.brand,
      companyCode: parent,
    })
  }

  console.log(`result`, result)

  return result
})

export const determineMarketplaces = createAsync(async function () {
  const connection = conn()
  const file = currentFile()
  const getId = createGetId()

  if (!connection || !file || !getId) return [];

  const data = await connection.query(`SELECT DISTINCT ON (marketplace) * FROM ${ file.name } ORDER BY marketplace;`)
  
  let result: { marketplace: string }[] = []

  // console.log('Marketplace DATA', data.toString())
  for (let item of data.toArray()) {
    let id: any = getId(item)
    // console.log('ID before', id)
    id = id.formatted.replace(/\s+/g, '')
    // console.log('ID after', id)

    result.push({
      marketplace: item.marketplace,
    })
  }

  // console.log(`marketplace`, result)

  return result
})












