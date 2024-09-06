import type { Component, ParentComponent } from 'solid-js'
import Versions from './components/Versions'
import logo from './assets/logo.svg'
import { createAsync, type RouteDefinition } from "@solidjs/router";
import { TextField } from "@kobalte/core/text-field";
import { createSignal, onMount } from "solid-js";
import { clientOnly } from "@solidjs/start";
// import upcs from "../api/upc_data.json"
import { upperFirst } from 'scule'

function handleGo () {
  console.log('clicked')
}

const App: ParentComponent = (props) => {
  return (<>
  <div class="header">
    <div class="icon">
      <img src="/src/assets/icon2.png" />
    </div>
    <div class="header__buttonBox" onClick={() => {
      window.electron.ipcRenderer.send('close-window')
    }}>
      <div class="header__close">&times;</div>
    </div>
    </div>
    <div class="side-padding px-[32px]">
    <div class="container">
      <main class="w-full py-5 px-8">
        {props.children}
      </main>
    </div>
    </div>
  </>)
}

export default App

function Form () {
  const [sku, setSku] = createSignal() 
  const [name, setName] = createSignal() 
  // console.log(globalThis)

  // onMount(() => {
    // if (isServer) return;
document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  console.log(e)
  
  for (const file of e?.dataTransfer?.files ?? []) {
    console.log('File(s) dropped');
    console.log('File: ', file)
    window.postMessage({
      type: 'fileDropped',
      filePath: file.path
    }, '*');
    // Send file information to the main process
  }
});
  // })

  return (
    <div class="pt-5 pl-[0.8px]"> 
      <Input name="SKU"  value={sku} setValue={setSku} />
      <br />
      <Input name="Name" value={sku} setValue={setSku} />
    
    
    </div>
  )
}

function Input(props) {
  
	return (
		<>
			<TextField value={props.value()} onChange={(...args) => props.setValue(...args)}>
				<TextField.Label class="label">{props.name}</TextField.Label>
				<TextField.Input class="textfield"/>
			</TextField>
			<p>Your favorite fruit is: {props.value}.</p>
		</>
	);
}




function Table () {
  const data: {
    prefix: string,
    itemPart: string,
    brand: string,
    sku: string,
    name: string,
    description: string,
    img: string,
    date: string,
    marketplace: string,
    notes: string[]
  }[] = []

  // for (let [prefix, available] of Object.entries(upcs)) {
  //   for (let [itemPart, items] of Object.entries(available)) {
  //     for (let entry of [items].flat()) {
  //       const item = {
  //         prefix,
  //         itemPart,
  //         // @ts-ignore
  //         brand: entry?.brand,
  //         // @ts-ignore
  //         sku: entry?.sku,
  //         // @ts-ignore
  //         name: entry?.name,
  //         // @ts-ignore
  //         description: entry?.description,
  //         // @ts-ignore
  //         img: entry?.data,
  //         // @ts-ignore
  //         date: entry?.date,
  //         // @ts-ignore
  //         marketplace: entry?.marketplace,
  //         // @ts-ignore
  //         notes: [
  //         // @ts-ignore
  //           entry?.['notes 1'],
  //         // @ts-ignore
  //           entry?.['notes 2']
  //         ].map(v => v?.trim?.() ?? v).filter(Boolean)
  //       }
  //       data.push(item)
  //     }
  //   }
  // }

  // const columnDefs = [
  //   {
  //     accessorFn: row => {
  //       const upcNoCheck = `${row.prefix}${row.itemPart}`;
  //       const check = check_digit(upcNoCheck)
  //       return `${upcNoCheck}${check}`
  //     },
  //     header: 'UPC',
  //     id: 'upc'
  //   },
  //   ...[Object.keys(data[0]).map(v => {
  //     if (v != 'notes') return {
  //       accessorKey: v,
  //       header: upperFirst(v),
  //       id: v,
  //     }
  //     return undefined
  //   }).filter(Boolean)]
  //   ,{
  //     accessorFn: row => {
  //       return row.notes.join(' ')
  //     },
  //     header: 'Notes',
  //     id: 'notes'
  //   }
  // ]

    return (
      <table>
        <thead>
          <tr>
            <th scope="col">
              UPC
            </th>
            <th scope="col">
              Name
            </th>
            <th scope="col">
              Description
            </th>
          </tr>
        </thead>
      </table>
    )
}