import { Combobox as KCombobox } from "@kobalte/core/combobox";
import HugeiconsCheckmarkCircle03 from '~icons/hugeicons/checkmark-circle-03'
import MageFileUpload from '~icons/mage/file-upload'
import MageCaretDownFill from '~icons/mage/caret-down'
import MageChevronDown from '~icons/mage/chevron-down'
import MageTrash from '~icons/mage/trash'
import HugeiconsAddSquare from '~icons/hugeicons/add-square'
import { mergeProps, splitProps, ValidComponent } from "solid-js";
import style from './combobox.module.css'



type DefaultT<Option = any, OptGroup = never, As extends ValidComponent = "div"> = Parameters<typeof KCombobox<Option, OptGroup, As>>[0]

export function Combobox<Option = any, OptGroup = never, As extends ValidComponent = "div", T extends Parameters<typeof KCombobox<Option, OptGroup, As>>[0] = DefaultT<Option, OptGroup, As>>(props: T) {

  return (
      <KCombobox<Option, OptGroup, As>
        data-combobox="true"
        itemComponent={itemProps => (
          <KCombobox.Item item={itemProps.item} class={style.combobox__item} data-item='item'>
            <KCombobox.ItemLabel>{itemProps.item.textValue}</KCombobox.ItemLabel>
            <KCombobox.ItemIndicator class={style["combobox__item-indicator"]}>
              <HugeiconsCheckmarkCircle03/>
            </KCombobox.ItemIndicator>
          </KCombobox.Item>
        )}
        sectionComponent={props => (
          <KCombobox.Section class={style.combobox__section}>{props.section.textValue}</KCombobox.Section>
        )}
        {...props}
      >
        <KCombobox.Label class="">{props?.name}</KCombobox.Label>
        <KCombobox.HiddenSelect />
        <KCombobox.Control aria-label={props?.name ?? ''} class={[style.combobox__control, 'inputShadow'].join(' ')}>
          <KCombobox.Input class={style.combobox__input} data-combo-input="true" />
          <KCombobox.Trigger class={style.combobox__trigger} data-combo-trigger="true">
            <KCombobox.Icon class={style.combobox__icon}>
              <MageChevronDown />
            </KCombobox.Icon>
          </KCombobox.Trigger>
        </KCombobox.Control>
        <KCombobox.Portal>
          <KCombobox.Content data-thing="thing" class={style.combobox__content}>
            <KCombobox.Listbox class={style.combobox__listbox} />
          </KCombobox.Content>
        </KCombobox.Portal>
      </KCombobox>
    )
}