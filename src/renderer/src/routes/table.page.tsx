import { allData, createGetId, currentFileDescription, db, getMerchantIds, getMerchantIdUseInfo, sample, tanstackTableColumnDefsForCurrentTable, updateData } from '@renderer/utils/global';
import { useNavigate } from '@solidjs/router';
import { createSolidTable, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState } from '@tanstack/solid-table';
import { createEffect, createMemo, createSignal, For, Suspense } from 'solid-js';
import './tablePage.css'
import HugeiconsAddSquare from '~icons/hugeicons/add-square'
import epc from 'epc-tds'
import RainbowButton from '@renderer/components/RainbowButton';
import HeroiconsBarsArrowDownSolid from '~icons/heroicons/bars-arrow-down-solid'
import HeroiconsBarsArrowUpSolid from '~icons/heroicons/bars-arrow-up-solid'
import HeroiconsChevronRight20Solid from '~icons/heroicons/chevron-right-20-solid'
import HeroiconsChevronDoubleRight20Solid from '~icons/heroicons/chevron-double-right-20-solid'
import HeroiconsChevronLeft20Solid from '~icons/heroicons/chevron-left-20-solid'
import HeroiconsChevronDoubleLeft20Solid from '~icons/heroicons/chevron-double-left-20-solid'

const [globalFilter, setGlobalFilter] = createSignal('')
const debounceSetGlobalFilter = debounce(
  (value: string) => setGlobalFilter(value),
  500
)

export default function TablePage() {
  const navigate = useNavigate()
  // const getId = createGetId()
  // for (let item of sample() || []) {
  //   const number = getId?.(item) || {raw: '', formatted: ''}
  //   var epc_value;
  //   try { 
  //     let n = number?.formatted?.replace(/\s+/g, '')
  //     epc_value = epc.valueOf(n)
  //   } catch(e) {
  //     console.log(e)
  //   };
    
  //   console.log('EPC VALUE', epc_value, 'formatted', number?.formatted?.replace(/\s+/g, ''))
  // }

  // const merchantIdUseInfo = getMerchantIdUseInfo()

  // console.log({merchantIdUseInfo})

  const merchantIds = getMerchantIds()
  console.log({merchantIds})


  return (
    <div class="flex flex-col items-center mt-[-0.25rem]  w-full h-full">
      <h1 class="font-bold" style='font-size: 1.5rem; opacity: 0.05; font-weight: 600; letter-spacing: 0.6px'>Your data</h1>
      <p style='opacity: 0.7; max-width: 30ch; text-align: center; padding-top: 1px; font-size: 1.1rem'></p>
      <div class="py-[17px]">  </div>
      <Toolbar navigate={navigate} ></Toolbar>
      {/* <Suspense fallback={<Loading />}> */}
        <Table />
      {/* </Suspense> */}
    </div>
  )
}

function Loading () {
  return (
    <div class="loading" style="display: grid; width: 100%; height: 100%; place-content: center;">
      <div class="rainbow">
        <div class="lbackground">
          Loading
        </div>
      </div>
    </div>
  )
}

import HeroiconsMagnifyingGlass from '~icons/heroicons/magnifying-glass'
import HeroiconsDocumentDuplicate from '~icons/heroicons/document-duplicate'
import HeroiconsBuildingStorefront from '~icons/heroicons/building-storefront'
import { debounce } from '@solid-primitives/scheduled';
import { createStore } from 'solid-js/store';

function Toolbar (props) {
  return (
    <div class="pb-5 w-full px-[0.5px] flex flex-nowrap gap-5 justify-between">
      <div class="searchBar inputShadow">
        <HeroiconsMagnifyingGlass />
        <input 
          placeholder='Search...' 
          value={globalFilter() ?? ''}
          onInput={e => debounceSetGlobalFilter(e.currentTarget.value)}
        />

      </div>
      <span class='flex flex-nowrap gap-4 '>
        <a href="/add" class="contents">
          <RainbowButton style={'--width: max-content; --padding: 0 1rem'}>
            <HugeiconsAddSquare />
            Add
          </RainbowButton>
        </a>
        <RainbowButton style={'--width: max-content; --padding: 0 1rem;'}>
          <HeroiconsDocumentDuplicate />
          Duplicates
        </RainbowButton>
        <RainbowButton style={'--width: max-content; --padding: 0 1rem;'}>
          <HeroiconsBuildingStorefront />
          Brand Info
        </RainbowButton>
      </span>


    </div>
  )
}

function Table () {
    const size = createMemo(() => Math.max((currentFileDescription()?.length || 0) -1, 0))
  // createEffect(() => {
  //   console.log({desc})
  //   const getId = createGetId()
  //   const items = first100()
  //   if (getId && items?.length) {
  //     for (let item of items) {
  //       console.log('ID: ', getId(item))
  //     }
  //   }

  // })

  const [sorting, setSorting] = createSignal<SortingState>([])
  const [pagination, setPagination] = createSignal<PaginationState>({
    pageIndex: 0,
    pageSize: 500
  })

  const [columnVisibility, setColumnVisibility] = createSignal({})
  const [selectedRows, setSelectedRows] = createSignal({})

  const _d = () => allData() || []
  const [data, setData] = createStore(_d())
  console.log('Data: ', data)
  console.log('COLUMNS!@#: ', tanstackTableColumnDefsForCurrentTable())


  const table = createMemo(() => {
    return createSolidTable({
      get data() {
        return (allData() || [])
      },
      state: {
        get sorting() {
          return sorting()
        },
        get globalFilter() {
          return globalFilter()
        },
        get pagination() {
          return pagination()
        },
        get columnVisibility() {
          return columnVisibility()
        },
        get rowSelection() {
          return selectedRows()
        }
      },
      meta: {
        updateData: (rowIndex, columnId, value) => {
          console.log('META UPDATE', rowIndex, columnId, value?.())
          
          setData(old => {
            return old.map((row, index) => {
              // console.log({row, old, index, rowIndex, value: value?.()})
              if (index === rowIndex) {
                const newRow = {
                  ...old[rowIndex]!,
                  [columnId]: value?.()
                }


                updateData(row, newRow)

                console.log({row, newRow, old, index, rowIndex, value: value?.()})

                return newRow
              }
              return row
            })
          })
        },
      },
      onSortingChange: setSorting,
      columns: tanstackTableColumnDefsForCurrentTable(),
      getCoreRowModel: getCoreRowModel(),
      onPaginationChange: setPagination,
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      globalFilterFn: 'includesString',
      onGlobalFilterChange: setGlobalFilter,
      getPaginationRowModel: getPaginationRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setSelectedRows,
      // debugAll: true,
      enableRowSelection: true,

    })
  }) 

  

  return (<>
    <div class="main-table-holder no-transition">
      <table class="main-table" style={`--columns: ${size() + 1}`}>
        <thead>
          <For each={table().getHeaderGroups()}>
            {headerGroup => (
              <tr>
                <For each={headerGroup.headers}>
                  {header => (
                    <th onClick={(e) => { 
                      const fn =header.column.getToggleSortingHandler()
                      console.log('Clicked', fn)
                      fn?.(e)
                    }}
                    class={header.column.getCanSort() ? 'yesCanSort' : 'noCantSort'}
                    >
                    <div class="table-header-text">

                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        {{
                            asc: <HeroiconsBarsArrowUpSolid />,
                            desc: <HeroiconsBarsArrowDownSolid />,
                          }[header.column.getIsSorted() as string] ?? null}

                      </div>
                    </th>
                  )}
                </For>
              </tr>
            )}
          </For>
        </thead>
        <tbody>
          <For each={table().getRowModel().rows.slice(0, 100)}>
            {row => (
              <tr class="main-table-body-row" classList={{selected: row.getIsSelected()}}>
                <For each={row.getVisibleCells()}>
                  {cell => (
                    <td>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
        <tfoot>
          <For each={table().getFooterGroups()}>
            {footerGroup => (
              <tr>
                <For each={footerGroup.headers}>
                  {header => (
                    <th>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.footer,
                            header.getContext()
                          )}
                    </th>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tfoot>
      </table>
    </div>
      <div class="flex items-center gap-2">
        <button
          class="border rounded p-1"
          onClick={() => table().firstPage()}
          disabled={!table().getCanPreviousPage()}
        >
          <HeroiconsChevronDoubleLeft20Solid />
        </button>
        <button
          class="border rounded p-1"
          onClick={() => table().previousPage()}
          disabled={!table().getCanPreviousPage()}
        >
          <HeroiconsChevronLeft20Solid />
        </button>
        <button
          class="border rounded p-1"
          onClick={() => table().nextPage()}
          disabled={!table().getCanNextPage()}
        >
          <HeroiconsChevronRight20Solid />
        </button>
        <button
          class="border rounded p-1"
          onClick={() => table().lastPage()}
          disabled={!table().getCanNextPage()}
        >
          <HeroiconsChevronDoubleRight20Solid />
        </button>
        <span class="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table().getState().pagination.pageIndex + 1} of{' '}
            {table().getPageCount().toLocaleString()}
          </strong>
        </span>
        <span class="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            min="1"
            max={table().getPageCount()}
            value={table().getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table().setPageIndex(page)
            }}
            className="border p-1 rounded w-16"
          />
        </span>
        <select
          value={table().getState().pagination.pageSize}
          onChange={e => {
            table().setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50, 100, 500, 1000].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div>
        {Object.keys(selectedRows()).length}
        Showing {table().getRowModel().rows.length.toLocaleString()} of{' '}
        {table().getRowCount().toLocaleString()} Rows
      </div>
      <div>
         
      </div>
  </>)

}





// function getDescriptior
// const conn = await db.connect()
// const result = ((await conn.query(`SELECT * FROM '${file.name}'`)).toArray()).map(v => console.log(Object.fromEntries(Object.entries(v))))
