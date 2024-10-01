import { ComboboxInputProps, Combobox as KCombobox } from "@kobalte/core/combobox";
import HugeiconsCheckmarkCircle03 from '~icons/hugeicons/checkmark-circle-03'
import MageFileUpload from '~icons/mage/file-upload'
import MageCaretDownFill from '~icons/mage/caret-down'
import MageChevronDown from '~icons/mage/chevron-down'
import MageTrash from '~icons/mage/trash'
import HugeiconsAddSquare from '~icons/hugeicons/add-square'
import { mergeProps, Show, splitProps, ValidComponent, JSX, createEffect, createSignal, untrack } from "solid-js";
import style from './combobox.module.css'
import basicStyles from './BasicStyles.module.css'
import { titleCase } from "scule";
import { FieldElementProps, FieldValue, setValue } from "@modular-forms/solid";
import { mergeRefs, Ref } from "@solid-primitives/refs";
import { combineProps } from "@solid-primitives/props";

console.log(style, JSON.stringify(style, null, 2))


type DefaultT<Option = any, OptGroup = never, As extends ValidComponent = "input"> = Parameters<typeof KCombobox<Option, OptGroup, As>>[0] & { value?: string | undefined, showLabel: boolean, errorValue?: JSX.Element, inputProps: FieldElementProps<Record<string, FieldValue>, string> & Omit<JSX.HTMLElementTags['input'], 'name'> & { name: string | undefined } }

export function Combobox<Option = any, OptGroup = never, As extends ValidComponent = "input", T extends Parameters<typeof KCombobox<Option, OptGroup, As>>[0] & { value?: string | undefined, showLabel: boolean, errorValue?: JSX.Element, inputProps: FieldElementProps<Record<string, FieldValue>, string> & Omit<JSX.HTMLElementTags['input'], 'name'> & { name: string | undefined, errorValue?: JSX.Element } } = DefaultT<Option, OptGroup, As>>(props: T) {
  // let rootRef!: HTMLSelectElement

  // createEffect(() => {
  //   console.log('Combobox props', props)
  //   console.log('Combobox err', props.errorValue)
  //   // if (props.errorValue) {
  //     // props.inputProps.ref.scrollIntoView({ behavior: 'smooth', block: 'start' })
  //   // }
  // })
  // const [getValue, setValue] = createSignal(props.value);

  // createEffect(() => {
  //   console.log('VALUE::: ', untrack(getValue))
  //   setValue(props.options.find((option) => untrack(getValue) === option[props?.optionValue || 'value']));
  // });
  const [local, others] = splitProps(props, [
    "options",
    "label",
    "placeholder",
    "error",
    "required",
    "value",
    "onChange",
    "ref",
  ]);
  const [inputRef, setInputRef] = createSignal(null);
  const [selectedValue, setSelectedValue] = createSignal(local.value);

  createEffect(() => {
    setSelectedValue(local.value);
  });

  const onChange = (value) => {
    if (!value) return;
    console.log({ local, others, props })
    console.log('handleChange', value, others.optionValue, value?.[others.optionValue]);
    let val =
      value
        ? typeof value == 'object'
          ? value?.[others.optionValue] || value?.value
          : value
        : undefined;
    console.log('handleChange VAL', val);
    setSelectedValue(val);
    if (local.onChange) {
      local.onChange(val);
    }
  }

  // const d = setValue(props.form, props.field.name, )

  let cothers = combineProps(others, { onChange })

  return (
    <KCombobox<Option, OptGroup, As>
      data-combobox="true"
      itemComponent={itemProps => (
        <KCombobox.Item item={itemProps.item} class='combobox__item comboboxItem' data-item='item'>
          <KCombobox.ItemLabel>{itemProps.item.textValue}</KCombobox.ItemLabel>
          <KCombobox.ItemIndicator class="combobox__item-indicator">
            <HugeiconsCheckmarkCircle03 />
          </KCombobox.ItemIndicator>
        </KCombobox.Item>
      )}
      class={[style.combobox, 'combobox'].join(' ')}
      sectionComponent={props => (
        <KCombobox.Section class='combobox__section'>{props.section.textValue}</KCombobox.Section>
      )}
      // {...local}
      // {...cothers}

      {...others}
      options={props.options}

      // {...props}
      // value={selectedValue()}
      // onChange={onChange}
      onInputChange={onChange}
      validationState={typeof props?.errorValue !== undefined ? props.errorValue ? 'invalid' : 'valid' : undefined}

    // ref={local.ref}
    // value={getValue()}
    // onChange={setValue}
    // value={props.inputProps.value}

    >
      <Show when={props.showLabel && props?.name}>
        <KCombobox.Label class={" " + basicStyles.label}>{titleCase(props?.name || local?.label || '')}</KCombobox.Label>
      </Show>
      <KCombobox.HiddenSelect
        aria-hidden="false"
        inert={true}
        onInput={(e) => {
          console.log('onInput Event HiddenSelectEl', e)
          props?.onInput?.(e)
        }}
        onChange={(e) => {
          console.log('onChange Event HiddenSelectEl', e)
          props.onChange?.(e)
        }}
      />

      <KCombobox.Control aria-label={props?.name ?? ''} class={['combobox__control', 'inputShadow'].join(' ')}>
        <KCombobox.Input
          class='combobox__input'
          data-combo-input="true"
          onInput={(e) => {
            console.log('onInput Event InputEl', e)
            props?.onInput?.(e)
          }}
          onChange={(e) => {
            console.log('onChange Event InputEl', e)
            props.onChange?.(e)
          }}
          placeholder={local?.placeholder || ''}
          ref={(el) => {
            setInputRef(el);
            if (typeof local.ref === 'function') {
              local.ref(el);
            }
          }}
        />
        <KCombobox.Trigger class="combobox__trigger comboboxTrigger" data-combo-trigger="true">
          <KCombobox.Icon class='combobox__icon'>
            <MageChevronDown />
          </KCombobox.Icon>
        </KCombobox.Trigger>
      </KCombobox.Control>

      <Show when={props.errorValue}>
        <span class={['combobox__error', basicStyles.error].join(' ')}>
          {props.errorValue}
        </span>
      </Show>
      <KCombobox.Portal>
        <span class={style['combobox']} style="display: contents;">
          <KCombobox.Content data-thing="thing" class='combobox__content'>
            <KCombobox.Listbox class='combobox__listbox' />
          </KCombobox.Content>
        </span>
      </KCombobox.Portal>
    </KCombobox>
  )
}

