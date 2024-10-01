import { Checkbox as Kobalte } from '@kobalte/core';
import { titleCase } from 'scule';
import { createSignal, type JSX, Show, splitProps } from 'solid-js';
import style from './checkbox.module.css'
import basicStyles from './BasicStyles.module.css'
import HeroiconsOutlineCheck from '~icons/heroicons-outline/check';
import { mergeRefs } from '@solid-primitives/refs';

type CheckboxProps = {
  name: string;
  label: string;
  value?: string | undefined;
  checked: boolean | undefined;
  error: string;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  showLabel?: boolean | undefined;
  description?: string | undefined;
  ref: (element: HTMLInputElement) => void;
  onInput: JSX.EventHandler<HTMLInputElement, InputEvent>;
  onChange: JSX.EventHandler<HTMLInputElement, Event>;
  onBlur: JSX.EventHandler<HTMLInputElement, FocusEvent>;
};

export function Checkbox(props: CheckboxProps) {
  const [rootProps, inputProps] = splitProps(
    props,
    ['name', 'value', 'checked', 'required', 'disabled'],
    ['ref', 'onInput', 'onChange', 'onBlur']
  );
  const [inputRef, setInputRef] = createSignal<HTMLInputElement>();


  return (
    <Kobalte.Root
      {...rootProps}
      class={style.checkbox}
      validationState={typeof props?.error !== undefined ? props.error ? 'invalid' : 'valid' : undefined}
    >
      <Kobalte.Input {...inputProps} class={style.checkbox__input} ref={mergeRefs(inputProps.ref, (item) => setInputRef(item) )}/>
      <Kobalte.Control class={style.checkbox__control} onClick={e => inputRef()!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))}>
        <Kobalte.Indicator>
        <HeroiconsOutlineCheck />
        </Kobalte.Indicator>
      </Kobalte.Control>
      <Show when={props.showLabel && (props?.name|| props?.label) }>
      <Kobalte.Label class={style.checkbox__label + " " + basicStyles.label}>{titleCase(props?.label || props?.name)}</Kobalte.Label>
      </Show>
      <Show when={props.description}>
        <Kobalte.Description class={style.checkbox__label + " " + basicStyles.label}>{props.description}</Kobalte.Description>
      </Show>
      <Show when={props.error}>
        <Kobalte.ErrorMessage class={style['checkbox__error-message'] + ' ' + basicStyles.error}>{props.error}</Kobalte.ErrorMessage>
      </Show>
    </Kobalte.Root>
  );
}