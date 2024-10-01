import { conn, currentFile, currentFileDescription, db, determineBrands, determineMarketplaces, setCurrentFile, setDb, tanstackTableColumnDefsForCurrentTable, UploadFile } from "@renderer/utils/global"
import { createForm, setValue } from "@modular-forms/solid"
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
import { Combobox } from "@renderer/components/inputs/Combobox"
import { destructure } from "@solid-primitives/destructure"
import { AddForm } from "./AddForm"

/* --- 
<route type="yaml">
#yaml 
  name: name-override
  meta:
    requiresAuth: true
  path: 'poopy'
#!yaml 
</route>
*/

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



function determineInput(columnName, field, props, navigate, form) {

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
    Input = UploadArea({navigate, field, props, form})

  }

  if (field.name == 'brand') {
    const brands = determineBrands() || [] as {brand: string, companyCode: string}[]
    Input = (
      <Combobox<{brand: string, companyCode: string}>
        options={brands}
        optionValue="brand"
        optionTextValue="brand"
        optionLabel="brand"
        name="brand"
        />
    )
  }


  if (field.name == 'marketplace') {
    const marketplaces = [...new Set((determineMarketplaces() || []).map(m => { return titleCase((m?.marketplace || '').replace(/\s+/g, '')) }))]

    Input = <Combobox options={marketplaces} name="marketplace" />
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
      <AddForm />
    </div>
  ) 
}





function UploadArea(args) {
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
          setValue(args.form, args.field.name, file.file)
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
          <input type="file" id="fileElem" {...args.props}  multiple accept="image/*" style="display:none" onChange={(e) => triggerDropEvent(e.target, e.target.files)} ref={inputRef} ></input>
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
    validators.push((value) => {
      if(!value.trim().length) {
        return (
          <div class="field-error">
            You must enter a sku
          </div>
        )
      }

    })

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
      );
    })
  }
  

  return validators
}



function determineType (columnName) {

  if (['img', 'image'].includes(columnName.toLowerCase())) {
    return 'File'
  }

  return 'string'
}