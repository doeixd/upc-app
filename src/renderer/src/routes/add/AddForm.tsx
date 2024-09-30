import { Form } from "@modular-forms/solid"
import { conn, currentFile, currentFileDescription, db, determineBrands, determineMarketplaces, setCurrentFile, setDb, tanstackTableColumnDefsForCurrentTable, UploadFile } from "@renderer/utils/global"
import { createForm, FieldValue, FormStore, Maybe, MaybeArray, setValue, ValidateField } from "@modular-forms/solid"
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js"
import HugeiconsSorting05 from '~icons/hugeicons/sorting-05'
import './addPage.css'
import { debounce } from "@solid-primitives/scheduled";
import createDropzone from "solid-dzone";
import { triggerDropEvent } from "@renderer/utils/triggerDropEvent";
import MageFileUpload from '~icons/mage/file-upload'
import HugeiconsCheckmarkCircle03 from '~icons/hugeicons/checkmark-circle-03'
import MageCaretDownFill from '~icons/mage/caret-down'
import MageChevronDown from '~icons/mage/chevron-down'
import MageTrash from '~icons/mage/trash'
import HugeiconsAddSquare from '~icons/hugeicons/add-square'
import { useNavigate } from "@solidjs/router";
import { unwrap } from "solid-js/store";
import { titleCase } from "scule";
import { Combobox } from "@renderer/components/Combobox"
import { destructure } from "@solid-primitives/destructure"
import { createFormInputs } from "@renderer/components/inputs/createInputs"



function handleSubmit(values, event) {
  console.log('SUBMITTED', 'values ', values, 'event ', event)

}


export function AddForm(formProps) {
  
  const defs = tanstackTableColumnDefsForCurrentTable().slice(1)
  //@ts-ignore
  let columnNames = defs.map(v => v?.accessorKey).filter(key => key !== 'date')

  type StoreType = {
    brand: { brand: string, companyCode: string }
  } & Record<string, FieldValue>

  const formInfo = createForm<StoreType>()
  const [form, { Form, Field, FieldArray }] = formInfo

  const Inputs = createFormInputs(formInfo)

  // let desc = currentFileDescription()
  console.log('DEFS', tanstackTableColumnDefsForCurrentTable())
  // createEffect(() => {
  //   console.log('FORM: ', unwrap(form))
  // })

  // let brands = determineBrands()

  return (
    <div class="form-holder">
      <Form onSubmit={handleSubmit} shouldActive={true} shouldFocus={true}>
        <For each={columnNames}>
          {(columnName) => {
            return (<>
              <div class="pb-[26px]">
                <Switch fallback={<Inputs.Text name={columnName} />}>
                  <Match when={columnName == 'date'}>
                    <Inputs.Date name={columnName} />
                  </Match>
                  <Match when={columnName == 'brand'}>
                    <Inputs.Brand name={columnName} />
                  </Match>
                  <Match when={columnName == 'marketplace'}>
                    <Inputs.Marketplace name={columnName} />
                  </Match>
                  <Match when={columnName == 'notes'}>
                    <Inputs.Textarea name={columnName} />
                  </Match>
                  <Match when={columnName== 'description'}>
                    <Inputs.Textarea name={columnName} />
                  </Match>
                  <Match when={columnName == 'sku'}>
                    <Inputs.SKU name={columnName} />
                  </Match>
                  <Match when={['img', 'image', 'picture', 'pic'].includes((columnName || '').trim().toLowerCase())}>
                    <Inputs.Image name={'Image'} />
                  </Match>
                </Switch>
              </div>
              {/* <Field name={columnName} validate={determineValidator(columnName)} validateOn='blur' type={determineType(columnName)}>
                {(field, props) => (
                  <div class="field">
                    {determineInput(columnName, field, props, formProps?.navigate, form)}
                    {field.error && <div>{field.error}</div>}
                  </div>)}
              </Field> */}
            </>)
          }}
        </For>
        <button class="add-button2" type="submit">
          <div class="add-button__content">
            Add item
            <HugeiconsAddSquare />
          </div>
          <div class="add-button__rainbow"></div>
          <div class="add-button__background"></div>
        </button>
      </Form>
    </div>
  )
}

