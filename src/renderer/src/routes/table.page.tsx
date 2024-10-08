import { allData, createGetId, currentFileDescription, db, sample, tanstackTableColumnDefsForCurrentTable } from '@renderer/utils/global';
import { useNavigate } from '@solidjs/router';
import { createSolidTable, flexRender, getCoreRowModel } from '@tanstack/solid-table';
import { createEffect, createMemo, For, Suspense } from 'solid-js';
import './tablePage.css'
import HugeiconsAddSquare from '~icons/hugeicons/add-square'
import epc from 'epc-tds'

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

  return (
    <div class="flex flex-col items-center mt-[-0.25rem]  w-full h-full">
      <h1 class="font-bold" style='font-size: 1.6rem; opacity: 0.1; font-weight: 600; letter-spacing: 1px'>Your data</h1>
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

function Toolbar (props) {
  return (
    <div class="pb-5">
      <a href="/add" class="contents">
        <button class="add-button">
          <div class="add-button__content">
            Add
            <HugeiconsAddSquare />
          </div>
          <div class="add-button__rainbow"></div>
          <div class="add-button__background"></div>
        </button>
      </a>


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
  const table = createMemo(() => {
    return createSolidTable({
      get data() {
        return (sample() || []).slice(100) || []
      },
      columns: tanstackTableColumnDefsForCurrentTable(),
      getCoreRowModel: getCoreRowModel()
    })
  }) 

  

  return (
    <div class="main-table-holder no-transition">
      <table class="main-table" style={`--columns: ${size()}`}>
        <thead>
          <For each={table().getHeaderGroups()}>
            {headerGroup => (
              <tr>
                <For each={headerGroup.headers}>
                  {header => (
                    <th>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  )}
                </For>
              </tr>
            )}
          </For>
        </thead>
        <tbody>
          <For each={table().getRowModel().rows}>
            {row => (
              <tr>
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
  )

}





// function getDescriptior
// const conn = await db.connect()
// const result = ((await conn.query(`SELECT * FROM '${file.name}'`)).toArray()).map(v => console.log(Object.fromEntries(Object.entries(v))))
