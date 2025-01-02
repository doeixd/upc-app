import { createForm } from "@modular-forms/solid"
import { createFormInputs } from "@renderer/components/inputs/createInputs"
import { useBeforeLeave, useLocation, useNavigate } from "@solidjs/router"
import { createEffect, createMemo, createSignal, For, Show } from "solid-js"
import styles from './skus.module.css'
import { createGetId } from "@renderer/utils/global"
import { Tooltip } from "@kobalte/core/tooltip";
import { createMutable, createStore, unwrap } from "solid-js/store"
import { RainbowButton } from "@renderer/components/RainbowButton"
import { Combobox } from "@kobalte/core/combobox";
import comboboxStyles from '@renderer/components/inputs/combobox.module.css'
import HeroiconsOutlineSelector from '~icons/heroicons-outline/selector'
import { I } from "@kobalte/core/dist/index-d454ada4"
import HeroiconsOutlineQuestionMarkCircle from '~icons/heroicons-outline/question-mark-circle'
import HeroiconsOutlineX from '~icons/heroicons-outline/x'
import { titleCase } from "scule"
import HugeiconsCheckmarkCircle03 from '~icons/hugeicons/checkmark-circle-03'
import { createUsePreviousState } from "@renderer/utils/previousState"
import { UPC } from "@renderer/components/UPC"

export default function SkusPage(props) {
  // console.log({ props })

  const previousState = createUsePreviousState()[0]()()
  // console.log({ previousState })

  const formInfo = createForm<any, any>()
  const Input = createFormInputs(formInfo)
  const [store, { Form, Field, FieldArray }] = formInfo

  const navigate = useNavigate()
  const location = useLocation()
  console.log('location', location)


  const [activeOption, setActiveOption] = createSignal<'list' | 'multiply'>('list')

  useBeforeLeave((e, ...rest) => {
    // console.log('use before leave', e)
    if (e.to == -1) {
      e.preventDefault()
      queueMicrotask(() => {
        console.log('USE BEFORE LEAVE VARIANTS', location?.state)
        navigate('/add/variants', { state: {
          ...previousState.state,
          variants: location?.state?.variants || []
          } })
        })
    }
    return true
  })


  const variants = createMemo<{ variantKind: string, variantOptions: { value: string }[] }[]>(() => {
    return (useLocation()?.state?.variants || []).map(variant => {
      if (variant && Array.isArray(variant.variantOptions)) {
        variant.variantOptions = variant.variantOptions.filter(variantOption => variantOption?.value !== '')
      }
      return variant
    })
  })

  // console.log({ variants: variants() })

  type variant = {
    kind: string
    value: string | unknown
  }

  const additionalVariants = createMutable<variant[][]>([])


  const createdVariants = createMemo(() => {
    if (activeOption() === 'list') {
      const options = variants().map(variant => {
        return (variant?.variantOptions || []).map(variantOption => {
          return {
            kind: variant.variantKind,
            value: v(variantOption),
          }
        })
      })
      // console.log({ options })
      return options.flat().map(v => [v])
    }

    if (activeOption() === 'multiply') {
      const options: variant[][] = [];
      const variantsList = variants();
      // console.log('Variants:', { variants: variantsList });

      const totalVariantCount = variantsList.reduce((acc, variant) => 
        acc * (variant.variantOptions?.length || 1), 1);

      const getId = (o: variant[]) => o
        .sort((a, b) => a.kind.localeCompare(b.kind))
        .map(v => `${v.kind}-${v.value}`)
        .join('');

      const discovered = new Set<string>();

      const generateCombinations = (current: variant[], index: number) => {
        if (index === variantsList.length) {
          const id = getId(current);
          if (!discovered.has(id)) {
            discovered.add(id);
            options.push(current);
          }
          return;
        }

        for (const option of variantsList[index].variantOptions || []) {
          generateCombinations([
            ...current,
            { kind: variantsList[index].variantKind, value: v(option) }
          ], index + 1);
        }
      };

      generateCombinations([], 0);

      return options;
    }

    return []; // Default return value if the condition is not met
  });

  const deletedVariants = createMutable<variant[][]>([])

  const deletedVariantsSet = createMemo(() => {
    const words = deletedVariants.map(dv => dv.sort((a, b) => a.kind.localeCompare(b.kind))).map(dv => dv.map(v => `${v.kind}-${v.value}`).join(' :: '))
    return new Set(words)
  })

  const deleteVariantGroup = (variantGroup: variant[], index?: number) => {
    deletedVariants.push(variantGroup);
    if (index !== undefined) {
      additionalVariants.splice(index, 1);
    }
  };

  const filteredVariants = createMemo(() => {
    return createdVariants().filter(v => {
      const words = v.sort((a, b) => a.kind.localeCompare(b.kind)).map(v => `${v.kind}-${v.value}`).join(' :: ')
      // console.log({ words })
      return !deletedVariantsSet().has(words)
    })
  })

  function v(o) {
    if (typeof o === 'object' && o !== null && 'value' in o) {
      return o.value
    }
    return o
  }

  createEffect(() => {
    // console.log({ createdVariants: createdVariants() })
    // console.log({ deletedVariants: deletedVariants, additionalVariants: additionalVariants, deletedVariantsSet: deletedVariantsSet() })
  })

  return (

    <div class="flex flex-col items-center mt-[-0.26rem]  w-full h-full variants-page" style='overflow-y: scroll'>
      <h1 class="font-bold" style='font-size: 1.6rem; opacity: 0.1; font-weight: 600; letter-spacing: 0.5px'>
        SKUs
      </h1>
      <p style='opacity: 0.7; max-width: 30ch; text-align: center; padding-top: 1px; font-size: 1.1rem'></p>
      <div class="py-[17px]">  </div>


      <div class={styles.optionsHolder}>
        <div class={styles.headerHolder}>
          <div class={styles.buttons}>
            <Tooltip>
              <Tooltip.Trigger class="tooltip__trigger">
                <button classList={{ 'active': activeOption() === 'list' }} onClick={() => setActiveOption('list')}>List</button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content class="tooltip__content">
                  <Tooltip.Arrow class="tooltip__arrow" />
                  Use this option to create a list of SKUs for each variant. Only one SKU will be created for each variant.
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip>
            <Tooltip>
              <Tooltip.Trigger class="tooltip__trigger">
                <button classList={{ 'active': activeOption() === 'multiply' }} onClick={() => setActiveOption('multiply')}>Multiply</button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content class="tooltip__content">
                  <Tooltip.Arrow />
                  Use this option to create a list of SKUs for every possible combonation of variants.
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip>
          </div>
          <div> </div>
          <RainbowButton class="rainbow-button--add-button" style={'--margin: 0 0 1.7rem 0;'} onClick={() => additionalVariants.push([])}
          >
            Add
          </RainbowButton>
          <div class={styles.header}>
            <div>Variants</div>
            <div>SKU</div>
            <div>UPC</div>
          </div>
        </div>
        
        <For each={additionalVariants}>
          {(variantGroup, index) => {
            const setValues = (newValues: string[]) => {
              const updatedVariants = newValues.map(v => {
                const [kind, value] = v.split(':').map(s => s.trim());
                return { kind, value };
              });
              additionalVariants[index()] = updatedVariants;
            };


            return (
              <div class={styles.row + ' relative'}>
                <div style='position: absolute; top: 35%; right: -50px;'>
                  <button onClick={() => deleteVariantGroup(variantGroup, index())}>
                    <HeroiconsOutlineX color="var(--grey-5)" stroke-width={0.8} class='box-content p-3 hover:text-red-700 opacity-50 hover:opacity-100 hover:bg-red-100 rounded-full'/>
                  </button>
                </div>
                <div>
                  <div class="overflow-y-auto flex flex-col gap-2">
                    <For each={variantGroup}>
                      {(variant, vindex) => (
                        <div class="flex items-center justify-between gap-1 rounded-full bg-[var(--grey-2)] text-[var(--grey-7)] px-3 py-1 text-sm font-medium hover:bg-[var(--grey-3)] hover:text-[var(--grey-10)]">
                          <div>{titleCase(variant.kind)}</div>
                          <div>{variant.value}</div>
                          <button
                            onClick={() => {
                              additionalVariants[index()] = variantGroup.filter((_, i) => i !== vindex());
                            }}
                            class="hover:text-red-700 opacity-50 hover:opacity-100 hover:bg-[var(--grey-3)] rounded-full"
                          >
                            <HeroiconsOutlineX color="currentColor" stroke-width={0.8} />
                          </button>
                        </div>
                      )}
                    </For>
                    <Combobox<string>
                      multiple
                      options={variants().flatMap(v => v.variantOptions.map(o => `${v.variantKind}: ${o.value}`))}
                      value={variantGroup.map(v => `${v.kind}: ${v.value}`)}
                      onChange={setValues}
                      itemComponent={props => (
                        <Combobox.Item item={props.item} class='combobox__item'>
                          <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
                          <Combobox.ItemIndicator class="combobox__item-indicator">
                            <HugeiconsCheckmarkCircle03 />
                          </Combobox.ItemIndicator>
                        </Combobox.Item>
                      )}
                      removeOnBackspace={false}

                    >
                      <Combobox.Description class="flex items-center gap-1">
                        <span style='color: var(--grey-6); font-weight: 400; font-size: 0.9rem;'>
                          Selected variants
                        </span>
                        <Tooltip>
                          <Tooltip.Trigger class="tooltip__trigger">
                            <button>
                              <HeroiconsOutlineQuestionMarkCircle color="var(--grey-5)" stroke-width={0.8} />
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content class="tooltip__content">
                              Add variants to the list, or type a new one like so: <br /> <span class="font-bold">color: red</span>
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip>
                      </Combobox.Description>
                      <Combobox.Control<string> aria-label="Add variants">
                        {state => (
                          <Combobox.Input
                            style="background-color: var(--grey-0); padding: 0.5rem; border-radius: 0.5rem; border: 1px solid var(--grey-3); width: 80%"
                            class="inputShadow"
                            onKeyDown={e => {
                              if (e.key === 'Enter' && e.currentTarget instanceof HTMLInputElement) {
                                setValues([...state.selectedOptions(), e.currentTarget.value]);
                              }
                            }}
                          />
                        )}
                      </Combobox.Control>
                      <Combobox.Portal>
                        <Combobox.Content class='combobox__content'>
                          <Combobox.Listbox class='combobox__listbox' />
                        </Combobox.Content>
                      </Combobox.Portal>
                    </Combobox>
                  </div>
                  {/* <button style='font-size: 0.8rem; padding: 0.2rem 0.7rem; margin-top: 0.5rem;' class='hover:text-red-700 opacity-50 hover:opacity-100 hover:bg-red-100 rounded-full'>Remove</button> */}

                </div>
                <div>
                  <Input.Text name={`variant-${index()}`} showLabel={false} />
                </div>
                <div>0 34343 2343445 0</div>
              </div>
            );
          }}
        </For>
        <Show when={additionalVariants.length > 0}>
          <hr style='grid-column: span 3; color: var(--grey-3); background-color: var(--grey-3); height: 1px; border: none; margin: 0.5rem 0; padding: 0 10px; opacity: 0.8'/>
        </Show>
        <For each={filteredVariants()}>
          {(variantOptions, index) => {
            // console.log({ variantOptions })
            return (
              <div class={styles.row + ' relative'}>
                <div style='position: absolute; top: 35%; right: -50px;'>
                  <button onClick={() => deleteVariantGroup(variantOptions)}>
                    <HeroiconsOutlineX color="var(--grey-5)" stroke-width={0.8} class='box-content p-3 hover:text-red-700 opacity-50 hover:opacity-100 hover:bg-red-100 rounded-full'/>
                  </button>
                </div>
                <div class="overflow-y-auto flex flex-col gap-2">
                  <For each={variantOptions}>
                    {(variant) => {
                      // console.log({ variant })
                      return (
                        <div class="flex items-center justify-between gap-1 rounded-full bg-[var(--grey-2)] text-[var(--grey-7)] px-3 py-1 text-sm font-medium hover:bg-[var(--grey-3)] hover:text-[var(--grey-10)]">
                          <div>{variant.kind}</div>
                          <div>{variant.value}</div>
                        </div>
                      )
                    }}
                  </For>
                </div>
                <div>
                  <Input.Text name={`variant-${Math.floor(Math.random() * 100)}`} showLabel={false} value={location.state.sku}/>
                </div>
                {/* <div> */}
                  <UPC value={'0 34343 2343445 0'} />
                {/* </div> */}
              </div>
            )
          }}
        </For>
      </div>
    </div>
  )
}


