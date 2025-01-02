import { Popover as KPopover } from "@kobalte/core/popover";

type AnyFn = (...args: any[]) => any

function extendFn<T extends AnyFn, U extends AnyFn>(
  og: T, 
  wrap: U ): T & U {

  const h = (...args: Parameters<T & U>): ReturnType<T & U> => {
    return wrap(...args)
  };

  return h as T & U;
}


export const Popover = extendFn(KPopover, function (props) {


  return (
    <KPopover>
      <KPopover.Trigger class="popover__trigger">Open</KPopover.Trigger>
      <KPopover.Portal>
        <KPopover.Content class="popover__content">
          <KPopover.Arrow />
          <div class="popover__header">
            <KPopover.Title class="popover__title">{props.title}</KPopover.Title>
            <KPopover.CloseButton class="popover__close-button">
              <CrossIcon />
            </KPopover.CloseButton>
          </div>
          <KPopover.Description class="popover__description">
            A UI toolkit for building accessible web apps and design systems with SolidJS.
          </KPopover.Description>
        </KPopover.Content>
      </KPopover.Portal>
    </KPopover>
  )
})


