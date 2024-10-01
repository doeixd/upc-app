import { createForm } from "@modular-forms/solid"
import { currentFileDescription, tanstackTableColumnDefsForCurrentTable } from "@renderer/utils/global"
import { createEffect } from "solid-js"
import { unwrap } from "solid-js/store"
import { AddForm } from "./AddForm"
import { Checkbox } from "@renderer/components/inputs/Checkbox"


export default function VariantsPage() {
  return (
    <div class="flex flex-col items-center mt-[-0.25rem]  w-full h-full variants-page" style='overflow-y: scroll'>
      <h1 class="font-bold" style='font-size: 1.6rem; opacity: 0.1; font-weight: 600; letter-spacing: 0.5px'>Variants</h1>
      <p style='opacity: 0.7; max-width: 30ch; text-align: center; padding-top: 1px; font-size: 1.1rem'></p>
      <div class="py-[17px]">  </div>
      {/* <Form navigate={navigate} /> */}
      <VariantsPageForm />
    </div>
  )
}


function VariantsPageForm (formProps) {
  const [ form, { Form, Field, FieldArray }] = createForm()
  let desc = currentFileDescription()

  const defs = tanstackTableColumnDefsForCurrentTable().slice(1)
  console.log('DEFS', tanstackTableColumnDefsForCurrentTable())
  createEffect(() => {
    console.log('FORM: ', unwrap(form))
  })

  let columnNames = defs.map(v => v?.accessorKey).filter(key => key !== 'date')

  return (
    <div class="form-holder">
      <Form onSubmit={handleSubmit}>
        <Field name="name" type="boolean">
          {(field, props) => (
            <div class="field">
              <Checkbox {...props} 
                name="name" 
                label="Name" 
                showLabel={true} 
                checked={Boolean(field.value)} 
                error={field.error} 
                required={true} 
              />
            </div>)}
        </Field>

      </Form>
    </div>
  ) 
}

function handleSubmit(values) {
  console.log('SUBMITTED', 'values ', values)

}