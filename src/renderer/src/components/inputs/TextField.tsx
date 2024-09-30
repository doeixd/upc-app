import { TextField as Kobalte } from '@kobalte/core';
import { titleCase, upperFirst } from 'scule';
import { createMemo, type JSX, mergeProps, Show, splitProps } from 'solid-js';
import textfieldStyles from './TextField.module.css'
import basicStyles from './BasicStyles.module.css'
import { combineProps } from '@solid-primitives/props';


type TextFieldProps = {
  name: string;
  type?: 'textarea' | 'text' | 'email' | 'tel' | 'password' | 'url' | 'date' | undefined;
  class?: string;
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
  styles?: CSSModuleClasses;
};

export function TextField(props: TextFieldProps) {
  const style = createMemo(() => {
    const contructedStyles = combineProps(textfieldStyles, basicStyles, props?.styles || {})
    return contructedStyles
  })
  const [_rootProps, _inputProps] = splitProps(
    props,
    ['name', 'value', 'required', 'disabled'],
    ['placeholder', 'ref', 'onInput', 'onChange', 'onBlur']
  );

  const rootProps = mergeProps({
    class: [style().inputContainer, props.class].join(' ')
  }, _rootProps)

  const inputProps = mergeProps({
    class: [style().input, style().inputShadow].join(' ')
  }, _inputProps)

  return (
    <Kobalte.Root
      {...rootProps}
      value={typeof props.value === null ? undefined : props?.value as string | undefined }
      validationState={props.error ? 'invalid' : 'valid'}
    >
      <Show when={(typeof props?.showLabel === 'undefined' ? true : false) && (props?.name || props?.label)}>
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