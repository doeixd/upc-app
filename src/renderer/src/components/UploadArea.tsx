import createDropzone from "solid-dzone";
import { triggerDropEvent } from "@renderer/utils/triggerDropEvent";
import MageFileUpload from '~icons/mage/file-upload'
import MageTrash from '~icons/mage/trash'
import { Accessor, createEffect, createMemo, createSignal, For, JSX, mergeProps, Show } from "solid-js"
import { debounce } from "@solid-primitives/scheduled";
import { UploadFile } from "@renderer/utils/global";
import { combineProps, CombinePropsOptions } from '@solid-primitives/props'

import defaultStyles from '@renderer/components/UploadArea.module.css'

defaultStyles



type UploadArgsProps<InputProps extends object> = {
  onDraggingChange: (isDragging: boolean) => any,
  onUpload: (files: Accessor<UploadFile[]>) => any,
  accept?: string,
  showPreview?: boolean,
  inputProps?: InputProps,
  multiple?: boolean,
  styles?: CSSModuleClasses,
  preview?: JSX.Element 
}

export function UploadArea(args) {
  let inputRef!: HTMLInputElement
  let rootRef!: HTMLDivElement

  const { getRootProps, getInputProps, setRefs, files } = createDropzone<HTMLDivElement>()

  const [isDragging, setIsDraggingOg] = createSignal(false)
  const setIsDragging = debounce((value: boolean) => setIsDraggingOg(value), 50);
  
  const [previewSrc, setPreviewSrc] = createSignal<string | undefined>()

  const showPreview = createMemo(() => {
    if (args?.showPreview) return true
    if (typeof args?.showPreview == 'undefined' && (args?.accept || '').includes('image')) {
      return true
    }
    return false
  })

  const shouldShowPreview = createMemo(() => {
    return Boolean(previewSrc()) && showPreview()
  })

  const styles = createMemo(() => {
    if (args.styles) return args.styles
    return defaultStyles
  })

  const reverse: CombinePropsOptions = {
    reverseEventHandlers: true
  }

  const inputPropsArray = [
    args?.inputProps || {},
    {
      'data-upload-input': true,
      type: 'file',
      style: styles().input,
      ...(args?.multiple ? { multiple: true } : {}),
      ...(args?.accept ? { accept: args?.accept } : { accept: '*'}),
      onChange: (e) => triggerDropEvent(e.target, e.target.files) ,
      ref: inputRef,
    }
  ]

  const inputProps = combineProps<typeof inputPropsArray>(inputPropsArray, 
   reverse)


  const rootPropsArray = [
    args?.rootProps || {},
    {
      class: styles().root,
      'data-upload-area': true,
      classList: {
        isDragging: isDragging()
      },
      ref: rootRef
    },
    getRootProps({
      onDragOver: () => setIsDragging(true),
      onDragLeave: () => setIsDragging(false),
      onDrop: () => setIsDragging(false)
    })
  ]
  const rootProps = combineProps<typeof rootPropsArray>(rootPropsArray, reverse)

  createEffect(() => {
    files() // Watch this signal
    args.onUpload(files)
  })

  createEffect(() => {
    args.onDraggingChange(isDragging())
  })

  setTimeout(() => {
    setRefs(rootRef, inputRef)
  })



  return (
    <Show 
      when={shouldShowPreview()}
      fallback={
        <div {...rootProps} ref={rootRef}>
          <Show 
            when={args.children}
            fallback={(
              <div class={styles().content}>
                <MageFileUpload width={'60px'} height={'60px'} class={styles().icon} />
                <div class={styles().spacer}></div>
                <h2 class={styles().message}>Drop file here</h2>
              </div>
            )}
          >
            {args.children}
          </Show>
          <input {...inputProps} />
        </div>
      }
    >
      <div class={styles().imgPreviewHolder}>
        <MageTrash class="trash-icon" onClick={() => setPreviewSrc()}/>
        <img class="img-preview" src={previewSrc()} />
      </div>

    </Show>
  )
}