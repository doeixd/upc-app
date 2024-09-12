import { conn, currentFile, currentFileDescription, db, determineBrands, setCurrentFile, setDb, tanstackTableColumnDefsForCurrentTable, UploadFile } from "@renderer/utils/global"
import { createForm } from "@modular-forms/solid"
import { createEffect, createSignal, For, Show } from "solid-js"
import { Combobox } from "@kobalte/core/combobox";
import HugeiconsCheckmarkCircle03 from '~icons/hugeicons/checkmark-circle-03'
import HugeiconsSorting05 from '~icons/hugeicons/sorting-05'
import './addPage.css'
import style from '../assets/combobox.module.css'
import { debounce } from "@solid-primitives/scheduled";
import createDropzone from "solid-dzone";
import MageFileUpload from '~icons/mage/file-upload'
import MageCaretDownFill from '~icons/mage/caret-down'
import MageChevronDown from '~icons/mage/chevron-down'
import { useNavigate } from "@solidjs/router";
import MageTrash from '~icons/mage/trash'
import HugeiconsAddSquare from '~icons/hugeicons/add-square'
import { triggerDropEvent } from "@renderer/utils/triggerDropEvent";
import { unwrap } from "solid-js/store";

console.log({style})

export default function AddPage() {
  const navigate = useNavigate()

  return (
    <div class="flex flex-col items-center mt-[-0.25rem]  w-full h-full add-page" style='overflow-y: scroll'>
      <h1 class="font-bold" style='font-size: 1.6rem; opacity: 0.1; font-weight: 600; letter-spacing: 0.5px'>Add new item</h1>
      <p style='opacity: 0.7; max-width: 30ch; text-align: center; padding-top: 1px; font-size: 1.1rem'></p>
      <div class="py-[17px]">  </div>
      <Form navigate={navigate} />
    </div>
  )
}

function determineInput(columnName, field, props, navigate) {

  let Label = <label style="display: block;" for={field.name}>{columnName}</label>
  let Input = <input data-text-input {...props} class="inputShadow" type="text"  />


  if (field.name == 'notes' || field.name == 'description') {
    Input = <textarea {...props} class="inputShadow" rows="6" cols="50" />
  }


  if (field.name == 'date') {
    const d = new Date()
    const v = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
    console.log(v, props)
    Input =  <input {...props} type="date" value={v} placeholder={v} default={v} />
  }

  if (['img', 'image'].includes(field.name.toLowerCase())) {
    Input = UploadArea({navigate})

  }

  if (field.name == 'brand') {
    const brands = determineBrands()
    Input = (
		<Combobox
			options={brands || []}
			optionValue="brand"
			optionTextValue="brand"
			optionLabel="brand"
			// placeholder="Brand"
      data-combobox="true"
			itemComponent={props => (
				<Combobox.Item item={props.item} class={style.combobox__item} data-item='item'>
					<Combobox.ItemLabel>{props.item.rawValue.brand}</Combobox.ItemLabel>
					<Combobox.ItemIndicator class={style["combobox__item-indicator"]}>
						<HugeiconsCheckmarkCircle03/>
					</Combobox.ItemIndicator>
				</Combobox.Item>
			)}
			sectionComponent={props => (
				<Combobox.Section class={style.combobox__section}>{props.section.rawValue.brand}</Combobox.Section>
			)}
		>
			<Combobox.Control aria-label="Brands" class={[style.combobox__control, 'inputShadow'].join(' ')}>
				<Combobox.Input class={style.combobox__input} data-combo-input="true" />
				<Combobox.Trigger class={style.combobox__trigger} data-combo-trigger="true">
					<Combobox.Icon class={style.combobox__icon}>
            {/* <HugeiconsSorting05 /> */}
            {/* <MageCaretDownFill /> */}
            <MageChevronDown />
					</Combobox.Icon>
				</Combobox.Trigger>
			</Combobox.Control>
			<Combobox.Portal>
				<Combobox.Content data-thing="thing" class={style.combobox__content}>
					<Combobox.Listbox class={style.combobox__listbox} />
				</Combobox.Content>
			</Combobox.Portal>
		</Combobox>
	)



  }


  return (<>
    {Label}
    {Input}
  </>)
}


function Form (formProps) {
  const [ form, { Form, Field, FieldArray }] = createForm()
  let desc = currentFileDescription()

  const defs = tanstackTableColumnDefsForCurrentTable().slice(1)
  console.log('DEFS', tanstackTableColumnDefsForCurrentTable())
  createEffect(() => {
    console.log('FORM: ', unwrap(form))
  })

  let columnNames = defs.map(v => v?.accessorKey).filter(key => key !== 'date')

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
              <Field name={columnName} validate={determineValidator(columnName)} validateOn='blur' >
                {(field, props) => (
                <div class="field">
                  { determineInput(columnName, field, props, formProps?.navigate) }
                  {field.error && <div>{field.error}</div>}
                </div>)}
              </Field>
            )
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



function UploadArea(props) {
  let inputRef!: HTMLInputElement
  let rootRef!: HTMLDivElement

  const { getRootProps, getInputProps, setRefs, files } = createDropzone<HTMLDivElement>()

  const [isDragging, setIsDraggingOg] = createSignal(false)
  const setIsDragging = debounce((value: boolean) => setIsDraggingOg(value), 50);
  
  const [previewSrc, setPreviewSrc] = createSignal()

  createEffect(async () => {
    console.log('DND FILES', files())
    if (files().length) {
      // for (let file of files()) {
        const reader = new FileReader();
        const file: UploadFile | undefined = files().at(0)
        if (file) {
          file.path = window.webUtils.getPathForFile(file.file)
          const dataURL = reader.readAsDataURL(file.file)
          console.log('dataURL', dataURL)
          setPreviewSrc(file.source)
        }
    }
  })


  setTimeout(() => {
    // Refs must be set inside a timeout to ensure the elements have been mounted
    setRefs(rootRef, inputRef)
  })


  return (
    <Show 
      when={previewSrc()}
      fallback={
        <div classList={{ isDragging: isDragging() }} class="upload-area rounded-[16px] border-[4px] border-dashed w-full max-w-[400px] flex z-10" style='border-color: oklch(0.95 0.004 94.5 / 1); aspect-ratio: 4/2.8'
          {...getRootProps({
            onDragOver: () => setIsDragging(true),
            onDragLeave: () => setIsDragging(false),
            onDrop: () => setIsDragging(false)
          })} 
          ref={rootRef}
        
        >
          <div class='upload-area__content flex flex-col place-content-center place-items-center w-full' style='background-color: var(--white)'>
            <MageFileUpload width={'60px'} height={'60px'} color='oklch(0.89 0.008 94.5 / 0.79)' display='block' class="uploadIcon" />
            {/* <HeroiconsOutlineUpload width={'3.8rem'} height={'3.8rem'} color='oklch(0.91 0.008 94.5 / 0.8)' display='block'  class='uploadIcon'/> */}

            <div class='block py-[6.5px]'></div>
            <h2 style='letter-spacing: -1px; font-weight: 600; font-size: 2.6em; text-align:center; color: oklch(0.92 0.008 94.5 / 0.76)'>Drop file here</h2>
          </div>
          <input type="file" id="fileElem" multiple accept="image/*" style="display:none" onChange={(e) => triggerDropEvent(e.target, e.target.files)} ref={inputRef} ></input>
        </div>
      }
    >
      <div class="img-preview-holder">
        <MageTrash class="trash-icon" onClick={() => setPreviewSrc()}/>
        <img class="img-preview" src={previewSrc()} />
      </div>

    </Show>
  )
}

function determineValidator(columnName = '') {
  columnName = columnName.toLowerCase().trim()


  const validators = []
  if (['sku'].includes(columnName)) {

    validators.push(async (value) => {
      if (!value) return false
      const connection = conn()
      const file = currentFile()

      
      if (!connection || !file) return false
      const data = await connection.query(`SELECT COUNT(*) AS skuCount FROM '${file.name}' WHERE LOWER(TRIM(sku)) = LOWER(TRIM('${value}'));`)
      console.log('skuCount String', data.toString()) 
      const skuCount = data.toArray().at(0).skuCount
      console.log('skuCount', skuCount)
      if (skuCount > 0 ) return (
        <div class="field-error">
          UPC already exists. <a href={`/search?query={value}`}>See matches  ›</a>
        </div>
      )
    })
  }
  

  return validators
}