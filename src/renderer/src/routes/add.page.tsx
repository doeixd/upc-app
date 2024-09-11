import { currentFileDescription, tanstackTableColumnDefsForCurrentTable } from "@renderer/utils/global"
import { createForm } from "@modular-forms/solid"
import { For } from "solid-js"



export default function AddPage() {
  return (
    <div class="flex flex-col items-center mt-[-0.25rem]  w-full h-full">
      <h1 class="font-bold" style='font-size: 1.6rem; opacity: 0.1; font-weight: 600; letter-spacing: 1px'>Add new item</h1>
      <p style='opacity: 0.7; max-width: 30ch; text-align: center; padding-top: 1px; font-size: 1.1rem'></p>
      <div class="py-[17px]">  </div>
      <Form />
    </div>
  )
}

function determineInput(columnName, field, props) {

  let Label = <label style="display: block;" for={field.name}>{columnName}</label>
  let Input = <input {...props} type="text"  />


  if (field.name == 'notes') {
    Input = <textarea {...props} />
  }


  if (field.name == 'date') {
    const d = new Date()
    const v = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
    console.log(v, props)
    Input =  <input {...props} type="date" value={v} placeholder={v} default={v} />
  }


  return (<>
    {Label}
    {Input}
  </>)
}


function Form () {
  const [ form, { Form, Field, FieldArray }] = createForm()
  let desc = currentFileDescription()

  const defs = tanstackTableColumnDefsForCurrentTable().slice(1)
  console.log('DEFS', tanstackTableColumnDefsForCurrentTable())

  let columnNames = defs.map(v => v?.accessorKey)

  // return (<>
  //   {JSON.stringify(defs, null, 2)} 
  // </>)

  let brands = determineBrands()

  return (
    <div class="form-holder">
      <Form>
        <For each={columnNames}>
          {(columnName) => {
            return (
              <Field name={columnName}>
                {(field, props) => (
                <div class="field">
                  { determineInput(columnName, field, props) }
                </div>)}
              </Field>
            )
          }}
        </For>
        <button type="submit">
          Add item
        </button>
      </Form>
    </div>
  ) 
}