import { allData, createGetId, currentFileDescription, db, first100, tanstackTableColumnDefsForCurrentTable } from '@renderer/utils/global';
import { useNavigate } from '@solidjs/router';
import { createSolidTable, flexRender, getCoreRowModel } from '@tanstack/solid-table';
import { createEffect, createMemo, For } from 'solid-js';
import './tablePage.css'
import HugeiconsAddSquare from '~icons/hugeicons/add-square'

export default function TablePage() {
  const navigate = useNavigate()

  return (
    <div class="flex flex-col items-center place-content-center mt-[-1.8rem]  w-full">
      <h1 class="font-bold" style='font-size: 2.4rem'>Your data</h1>
      <p style='opacity: 0.7; max-width: 30ch; text-align: center; padding-top: 1px; font-size: 1.1rem'></p>
      <div class="py-[17px]">  </div>
      <Toolbar></Toolbar>
      <Table />
    </div>
  )
}


function Toolbar () {
  return (
    <div class="pb-5">
      <button class="add-button">
        Add
        <HugeiconsAddSquare />
      </button>


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
        return first100() || []
      },
      columns: tanstackTableColumnDefsForCurrentTable(),
      getCoreRowModel: getCoreRowModel()
    })
  }) 

  

  return (
    <div class="main-table-holder">
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
