import { TextField as Kobalte } from '@kobalte/core';
import { titleCase, upperFirst } from 'scule';
import { createEffect, createMemo, createSignal, type JSX, mergeProps, Show, splitProps } from 'solid-js';
import textfieldStyles from './TextField.module.css'
import basicStyles from './BasicStyles.module.css'
import { combineProps } from '@solid-primitives/props';


type TextFieldProps = {
  name: string;
  type?: 'textarea' | 'text' | 'email' | 'tel' | 'password' | 'url' | 'date' | undefined;
  class?: string;
  classList?: Record<string, boolean>;
  label?: string | undefined;
  placeholder?: string | undefined;
  value: unknown;
  error?: string;
  showLabel?: boolean;
  multiline?: boolean | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  ref?: (element: HTMLInputElement | HTMLTextAreaElement) => void;
  onInput?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, InputEvent>;
  onChange?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, Event>;
  onBlur?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, FocusEvent>;
  onFirstBlur?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, FocusEvent>;
  onKeyDown?: JSX.EventHandler<HTMLInputElement | HTMLTextAreaElement, KeyboardEvent>;
  styles?: CSSModuleClasses;
};

export function TextField(props: TextFieldProps) {
  const style = createMemo(() => {
    const contructedStyles = combineProps(textfieldStyles, basicStyles, props?.styles || {})
    return contructedStyles
  })
  const [_rootProps, _inputProps] = splitProps(
    props,
    ['name', 'value', 'required', 'disabled', 'class','classList'],
    ['placeholder', 'ref', 'onInput', 'onChange', 'onBlur', 'onKeyDown']
  );

  const rootProps = combineProps({
    class: [style().inputContainer, props.class].join(' '),
    classList: props?.classList || {},
  }, _rootProps)

  const [hasFirstBlur, setHasFirstBlur] = createSignal(false)

  createEffect(() => {
    // console.log('hasFirstBlur', hasFirstBlur())
  })

  const inputProps = combineProps({
    class: [style().input, style().inputShadow].join(' '),
    onBlur: (e) => {
      if (!hasFirstBlur()) {
        const ret:any = props?.onFirstBlur?.(e)
        setHasFirstBlur(ret)
      }
    }
  }, _inputProps)

  // console.log('inputProps', inputProps)


  return (
    <Kobalte.Root
      {...rootProps}
      value={typeof props.value === null ? undefined : props?.value as string | undefined }
      validationState={props.error ? 'invalid' : 'valid'}
    >
      <Show when={(props?.showLabel || typeof props?.showLabel === 'undefined' ? true : false) && (props?.name || props?.label)}>
        <Kobalte.Label class={[style().label].join(' ')}>{props?.label || props?.name}</Kobalte.Label>
      </Show>
      <Show
        when={props.type == 'textarea'}
        fallback={<Kobalte.Input {...inputProps} type={props.type} data-text-input />}
      >
        <Kobalte.TextArea {...inputProps} autoResize cols={50} rows={5} data-text-input />
      </Show>
      <Kobalte.ErrorMessage class={style().error}>{props.error}</Kobalte.ErrorMessage>
    </Kobalte.Root>
  );
}
      // <Show when={(typeof props?.showLabel === 'undefined' ? true : false) && (props?.name || props?.label)}></Show>