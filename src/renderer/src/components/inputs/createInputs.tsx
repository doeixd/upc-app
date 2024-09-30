import { TextField } from "./TextField";
import HugeiconsSorting05 from '~icons/hugeicons/sorting-05'
import { conn, currentFile, currentFileDescription, db, determineBrands, determineMarketplaces, setCurrentFile, setDb, tanstackTableColumnDefsForCurrentTable, UploadFile } from "@renderer/utils/global"
import { createForm, FieldValue, FormStore, Maybe, MaybeArray, minLength, required, setValue, ValidateField } from "@modular-forms/solid"
import { createEffect, createSignal, For, Match, ParentComponent, Show, Switch, type JSX } from "solid-js"
// import './addPage.css'
import { debounce } from "@solid-primitives/scheduled";
import createDropzone from "solid-dzone";
import { triggerDropEvent } from "@renderer/utils/triggerDropEvent";
import MageFileUpload from '~icons/mage/file-upload'
import MageTrash from '~icons/mage/trash'
import HugeiconsCheckmarkCircle03 from '~icons/hugeicons/checkmark-circle-03'
import MageCaretDownFill from '~icons/mage/caret-down'
import MageChevronDown from '~icons/mage/chevron-down'
import HugeiconsAddSquare from '~icons/hugeicons/add-square'
import { useNavigate } from "@solidjs/router";
import { unwrap } from "solid-js/store";
import { titleCase } from "scule";
import { Combobox } from "@renderer/components/inputs/Combobox"
import { destructure } from "@solid-primitives/destructure"
import { Store } from "solid-js/store";
import { FieldProps } from "@modular-forms/solid";
import { UploadArea } from "./UploadArea";
import basicStyles from './BasicStyles.module.css'

function isStore(value: unknown): value is Store<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "subscribe" in value &&
    typeof (value as any).subscribe === "function" &&
    "reconcile" in value &&
    typeof (value as any).reconcile === "function"
  );
}

export function createFormInputs<F extends ReturnType<typeof createForm<any, any>> = ReturnType<typeof createForm<any, any>>>(formInfo: F) {
  // const store = formInfo.at(0)
  // if (!isStore(store) || typeof store == 'undefined') {
  //   throw new Error('Store is not a store') 
  //   return
  // }
  const [store, { Field, Form, FieldArray }] = formInfo;
  //  as {Field: ParentComponent, Form: ParentComponent, FieldArray: ParentComponent}

  // type FieldProps = Parameters<typeof Field>[0] & { type?: Maybe<string> }
  type OurFieldProps = Omit<FieldProps<Record<string, any>, undefined, string>, 'of' | 'children' | 'type'>

  return {
    SKU: (p: OurFieldProps) => {

      const validators: Maybe<MaybeArray<ValidateField<FieldValue>>> = []
      validators.push((value) => {
        if (typeof value == 'string' && !value.trim().length) {
          return (
            <div class={basicStyles.error}>
              You must enter a sku
            </div>
          )
        }
        return undefined
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
        if (skuCount > 0) return (
          <div class={basicStyles.error} >
            UPC already exists. <a href={`/search?query={value}`}>See matches  ›</a>
          </div>
        )
        return undefined
      })

      return (<>
        <Field  {...p} type="string" validateOn="blur" validate={validators} revalidateOn="input">
          {(field, props) => {
            return (
              <TextField type="text" {...props} name={(p.name as string) && 'SKU'} value={field?.value as string | undefined} error={field.error}  />
            )
          }}
        </Field>
      </>)
    },

    Text: (p: OurFieldProps) => {
      return (<>
        <Field  {...p} type="string" validateOn="blur">
          {(field, props) => {
            return (
              <TextField type="text" name={p.name as string} value={field.value as string | undefined} error={field.error} class={'inputShadow'} />
            )
          }}
        </Field>
      </>)
    },


    Textarea: (p: OurFieldProps) => {
      return (<>
        <Field  {...p} type="string" validateOn="blur">
          {(field, props) => {
            return (
              <TextField type="textarea" name={p.name as string} value={field.value} error={field.error} multiline={true} />
            )
          }}
        </Field>
      </>)
    },

    Date: (p: OurFieldProps) => {
      return (<>
        <Field {...p} type="Date" validateOn="blur">
          {(field, props) => {
            return (
              <TextField type="date" name={p.name as string} value={field.value as Date | string} error={field.error} />
            )
          }}
        </Field>
      </>)
    },

    Brand: (p: OurFieldProps) => {
      const brands = determineBrands() || [] as { brand: string, companyCode: string }[]

      const validators: Maybe<MaybeArray<ValidateField<FieldValue>>> = []

      validators.push((selectedBrands) => {
        console.log('selectedBrands', selectedBrands)
        if (!selectedBrands) {
        console.log('NONE selectedBrands', selectedBrands)
          return (
            <div class={basicStyles.error}>
              Please select a brand
            </div>
          )
        }
        return undefined
      })


      return (
        <Field {...p} validateOn="blur" type='string' validate={validators}>
          {(field, props) => {
            createEffect(() => {

              let found = brands.find(b => b.brand == field.value)
              if (found) {
                // @ts-ignore
                setValue(store, props.name, found, {shouldValidate: true}) 
              }
              // let val =
              //   field.value
              //     ? typeof field.value == 'object'
              //       ? field.value?.['brand'] || field.value?.value
              //       : field.value
              //     : undefined;
              
              console.log('brand field value', field.value)
            })


            return (
              <Combobox<{ brand: string, companyCode: string }>
                options={brands}
                optionValue="brand"
                optionTextValue="brand"
                optionLabel="brand"
                // name={"brand" || props.name}
                multiple={false}
                showLabel={true}
                errorValue={field.error}
                // form
                {...props}
                required={true}

              />
            )
          }}
        </Field>
      )
    },

    Marketplace: (p: OurFieldProps) => {
      const marketplaces = [...new Set((determineMarketplaces() || []).map(m => { return titleCase((m?.marketplace || '').replace(/\s+/g, '')) }))]

      return (
        <Field {...p} type='string'>
          {(field, props) => {
            return (
              <Combobox options={marketplaces} name={"marketplace" || props.name} multiple={false} showLabel={true} inputProps={props} />
            )
          }}
        </Field>
      )
    },

    Image: (p: OurFieldProps) => {
      return (
        <Field {...p} type="File">
          {(field, fieldProps) => (
            <UploadArea<Record<string, FieldValue>> 
              field={field} 
              store={store} 
              showLabel={true} 
              label={p.name as string} 
              accept='image/*'
              inputProps={fieldProps} />
          )}
        </Field>
      )
    }
  }
}