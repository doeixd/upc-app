import { createForm, focus, getValue, getValues, insert, remove, required, setValue, submit } from "@modular-forms/solid"
import { currentFileDescription, tanstackTableColumnDefsForCurrentTable } from "@renderer/utils/global"
import { createEffect, createMemo, createSignal, For, Show } from "solid-js"
import { unwrap } from "solid-js/store"
import { AddForm } from "../AddForm"
import { Checkbox } from "@renderer/components/inputs/Checkbox"
import { Button } from "@renderer/components/inputs/Button"
import style from './variants.module.css'
import { clsx } from "@renderer/utils/classes"
import { createFormInputs } from "@renderer/components/inputs/createInputs"
import { TextField } from "@renderer/components/inputs/TextField"
import { useLocation, useNavigate } from "@solidjs/router"
import HugeiconsAddSquare from '~icons/hugeicons/add-square'
import { createAutoAnimate } from '@formkit/auto-animate/solid'
import HugeiconsCancel02 from '~icons/hugeicons/cancel-01'

const [hasVariants, setHasVariants] = createSignal(false)
export default function VariantsPage() {
  const location = useLocation()
  // console.log('VARIANTS LOCATION', { state: location.state })


  return (
    <div class="flex flex-col items-center mt-[-0.25rem]  w-full h-full variants-page" style='overflow-y: scroll'>
      <h1 class="font-bold" style='font-size: 1.6rem; opacity: 0.1; font-weight: 600; letter-spacing: 0.5px'>Variants</h1>
      <p style='opacity: 0.7; max-width: 30ch; text-align: center; padding-top: 1px; font-size: 1.1rem'></p>
      <div class="py-[17px]">  </div>
      {/* <Form navigate={navigate} /> */}
      <Show when={hasVariants() || true} fallback={<VariantsPageForm />}>
        <AddVariantsForm />
      </Show>
    </div>
  )
}

function AddVariantsForm() {
  const location = useLocation()
  const [isHovering, setIsHovering] = createSignal(false)

  // console.log('location state og', location?.state)
  const formInput = createForm<any, any>({
    initialValues: {
      variants: location?.state?.variants || []
    }
  })

  const [store, { Form, Field, FieldArray }] = formInput
  const Inputs = createFormInputs(formInput)

  const navigate = useNavigate()


  const sku = createMemo(() => {
    return useLocation?.()?.state?.sku || ''
  })

  createEffect(() => {
    // console.log('location state', location?.state)
    // console.log('Store', getValues(store))
  })



  return (<>
    <div class="flex flex-col items-center w-full h-full variants-page" style='overflow-y: scroll; scroll-padding-bottom: 100px; scroll-margin-bottom:100px'>
      <Form class="flex gap-5 flex-col" onSubmit={(e) => {
        // console.log('SUBMITTED', e)
        navigate('/add/variants/skus', {
          state: {
            sku: sku(),
            variants: e.variants,
            last: location?.state || {}
          }
        })
      }}>
        <FieldArray name="variants">
          {(fieldArray) => {
            if (fieldArray.items.length == 0) {
              insert(store, "variants", {
                value: {
                variantOptions: [
                  {

                    value: '',
                  }
                ]
                }
              })
            }

            const [animationParent] = createAutoAnimate({ duration: 200 })

            return (
              <div ref={animationParent} class="flex gap-5 flex-col">
                <For each={fieldArray.items}>
                  {(variant, variantIndex) => {

                    // console.log('VARIANT Variant VARIANT', variant)
                    const [variantKind, setVariantKind] = createSignal('name')

                    createEffect(() => {
                      // console.log('stuff stuff', location.state, useLocation().state.sku)
                      // console.log('variantKind 1234567', variantKind())
                    })
                    const isEven = createMemo(() => {
                      return variantIndex() % 2 === 0
                    })
                    return (
                      <div class={style.variantHolder} classList={{
                        'oddVariant': isEven(),
                      }}>
                        <button type="button" class={style.removeButton} onClick={() => {
                          remove(store, `variants`, {
                            at: variantIndex()
                          })
                        }}
                        >
                          <HugeiconsCancel02 width={20} height={20} class={style.closeIcon} stroke-linecap="round" stroke-linejoin="round" />
                        </button>
                        <Inputs.Combobox name={`variants.${variantIndex()}.variantKind`} label="Variant type" validateOn="submit" options={['Color', 'Size', 'Style']}
                          value={getValue(store, `variants.${variantIndex()}.variantKind`)}
                          validate={[() => {
                            // if (!variantKind() && getValue(store, `variants.${variantIndex()}.variantKind`)) {
                            const value = getValue(store, `variants.${variantIndex()}.variantKind`)
                            const fields = getValues(store, `variants.${variantIndex()}.variantOptions`)
                            const notFilled = fields.map(v => v.value).filter(v => v.length == 0).length

                            // console.log('ITS TIMELOL', { notFilled, fields, fieldsLength: fields.length, variantKind: variantKind(), value })

                            if (!value) {
                              return "Please select a variant type"
                            }
                          }]}
                          onChange={(e) => {
                            // console.log('onChangeBBB', e)
                            if (typeof e === 'string') {
                              setVariantKind(e)
                              setValue(store, `variants.${variantIndex()}.variantKind`, e)
                            } else {
                              // queueMicrotask(() => {
                              //   setTimeout(() => {
                              //     setVariantKind(getValue(store, 'variantKind'))
                              //   })
                              // })
                            }
                          }}
                        />
                        <FieldArray name={`variants.${variantIndex()}.variantOptions`}
                          // revalidateOn="touched"
                          validate={[(items) => {
                            const fields = getValues(store, `variants.${variantIndex()}.variantOptions`)
                            const notFilled = fields.map(v => v.value).filter(v => v.length == 0).length

                            // console.log('BOOPY', { notFilled, fields, fieldsLength: fields.length, variantKind: variantKind(), items })

                            if (fields.length == notFilled) {
                              return "Please add at least one variant option"
                            }

                          }]}>
                          {(fieldArray) => {
                            createEffect(() => {
                              // console.log('ISTHISTHEERROR', fieldArray)
                            })
                            const reversed = createMemo(() => {
                              return fieldArray.items
                            })
                            return (
                              <div class="flex flex-col gap-5 mt-2">
                                <span>
                                  <h2 style='font-size: 1.2rem; font-weight: 600; letter-spacing: 0.5px; opacity: 0.7; padding-top: 10px;'>Variant options</h2>
                                  <Show when={fieldArray.error}>
                                    <p class='field-error my-0'>{fieldArray.error}</p>
                                  </Show>
                                </span>
                                <For each={reversed()}>
                                  {(_, index) => (<>
                                    <Field name={`variants.${variantIndex()}.variantOptions.${index()}.value`}>
                                      {(field, props) => {
                                        const fieldValueIsEmpty = createMemo(() => {
                                          // console.log('fieldValueIsEmpty', !field.value?.length)
                                          return !field.value?.length
                                        })

                                        return (
                                          <TextField
                                            {...props}
                                            name={`variants.${variantIndex()}.variantOptions.${index()}.value`}
                                            label={`${variantKind()} ${index() + 1}`}
                                            showLabel={true}
                                            classList={{
                                              'opacity-50': fieldValueIsEmpty(),
                                            }}
                                            value={field.value}
                                            onFirstBlur={(e) => {
                                              if (index() == reversed().length - 1 && field.value && !isHovering()) {
                                                insert(store, `variants.${variantIndex()}.variantOptions`, {
                                                  value: {
                                                    value: ''
                                                  }
                                                })
                                                return true
                                              }
                                            }}

                                            onKeyDown={(e) => {
                                              // console.log('onInput sukkas', e)
                                              // console.log('KEYDOWN', e.key)
                                              if (e.key === 'Enter') {
                                                e.preventDefault()
                                                if (index() == reversed().length - 1 && !isHovering()) {
                                                  insert(store, `variants.${variantIndex()}.variantOptions`, {
                                                    value: {
                                                      value: ''
                                                    }
                                                  })

                                                  focus(store, `variants.${variantIndex()}.variantOptions.${index() + 1}.value`)

                                                } else {
                                                  e.currentTarget.blur()
                                                  
                                                  focus(store, `variants.${variantIndex()}.variantOptions.${index() + 1}.value`)
                                                }
                                              }
                                            }}
                                          />
                                        )
                                      }}
                                    </Field>
                                  </>)}
                                </For>
                              </div>
                            )
                          }}
                        </FieldArray>
                      </div>
                    )
                  }}
                </For>
              </div>
            )
          }}
        </FieldArray>

        <span class="mb-4  flex flex-col items-center" >

          <button class="add-button7" type="button" onClick={(e) => {
            e.preventDefault()

            insert(store, "variants", {
              value: {
                variantOptions: [
                  {
                    value: '',
                  }
                ]
              }
            })

            setTimeout(() => {
              focus(store, `variants.${getValues(store, 'variants').length - 1}.variantKind`)

              const focusedElement = () => document.activeElement;

              // Check if there is a focused element
              if (focusedElement()) {
                // Scroll the element into view with smooth behavior
                focusedElement()?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'center'
                });
              }
            }, 300)
          }}
            onMouseOver={(e) => {
              setIsHovering(true)
              document.querySelectorAll('input').forEach(input => (input as HTMLInputElement)?.blur())
            }}
            onMouseOut={() => {
              setIsHovering(false)
            }}
          >
            <div class="add-button__content">
              Add another variant type
              <HugeiconsAddSquare width={25} height={25} opacity={0.8} />
            </div>
            <div class="add-button__rainbow"></div>
            <div class="add-button__background"></div>
          </button>
          <div class="flex justify-center w-[200px] my-0 py-0">
            or
          </div>


          <button class="add-button3" type="submit" onClick={() => {
            // submit(store)
            // navigate('/add/variants/skus', {
            //   state: 
            // })
          }}
            onMouseOut={() => {
              setIsHovering(false)
            }}
            onMouseOver={(e) => {
              setIsHovering(true)
              document.querySelectorAll('input').forEach(input => (input as HTMLInputElement)?.blur())
            }}
          >
            <div class="add-button__content">
              Continue
            </div>
            <div class="add-button__rainbow"></div>
            <div class="add-button__background"></div>
          </button>

        </span>
      </Form>
    </div>

  </>)
}

function VariantsPageForm(formProps) {
  const [form, { Form, Field, FieldArray }] = createForm()
  let desc = currentFileDescription()

  const defs = tanstackTableColumnDefsForCurrentTable().slice(1)
  // console.log('DEFS', tanstackTableColumnDefsForCurrentTable())
  createEffect(() => {
    // console.log('FORM: ', unwrap(form))
  })

  let columnNames = defs.map(v => v?.accessorKey).filter(key => key !== 'date')

  return (
    <div class="form-holder">
      <h2 class={style.header}>Does this product have variants?</h2>
      <div class="flex gap-x-5 justify-center mt-8">
        <a href="/tablePage"><button class={clsx(style.no, style.button)}>No</button></a>
        <button onClick={() => {
          // console.log('Has variants')
          setHasVariants(true)
        }} class={clsx(style.button, style.yes)}>Yes</button>
      </div>
    </div>
  )
}

function handleSubmit(values) {
  // console.log('SUBMITTED', 'values ', values)

}