import createDropzone from "solid-dzone";
import { triggerDropEvent } from "@renderer/utils/triggerDropEvent";
import MageFileUpload from '~icons/mage/file-upload'
import MageTrash from '~icons/mage/trash'
import { Accessor, createEffect, createMemo, createSignal, JSX, mergeProps } from "solid-js"
import { debounce } from "@solid-primitives/scheduled";
import { UploadFile } from "@renderer/utils/global";
import { combineProps, CombinePropsOptions } from '@solid-primitives/props'
import { FieldStore, FieldValue, FormError, FormStore, setValue } from "@modular-forms/solid";
import { FieldPath } from "@modular-forms/solid";
import basicStyles from './BasicStyles.module.css'

import defaultStyles from './UploadArea.module.css'

  type UploadArgsProps<T extends Record<string, FieldValue>> = {
  onDraggingChange?: (isDragging: boolean) => any,
  onUpload?: (files: Accessor<UploadFile[]>) => any,
  accept?: string,
  showPreview?: boolean,
  rootProps?: JSX.HTMLAttributes<HTMLDivElement>,
  inputProps?: JSX.HTMLElementTags['input'],
  multiple?: boolean,
  styles?: CSSModuleClasses,
  preview?: JSX.Element,
  message?: string,
  store: FormStore<T, any>,
  showLabel?: boolean,
  label?: string,
  field: FieldStore<T, FieldPath<T>>
  children?: JSX.Element,
}

export function UploadArea<T extends Record<string, FieldValue>>(args: UploadArgsProps<T>) {
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
    const contructedStyles = combineProps(defaultStyles, basicStyles, args?.styles || {})
    return contructedStyles
  })

  const reverse: CombinePropsOptions = {
    reverseEventHandlers: true
  }

  const inputPropsArray = [
    args?.inputProps || {},
    {
      'data-upload-input': true,
      type: 'file',
      class: styles().input,
      ...(args?.multiple ? { multiple: true } : {}),
      ...(args?.accept ? { accept: args?.accept } : { accept: 'image/*'}),
      onChange: (e) => triggerDropEvent(e.target, e.target.files) ,
      ref: inputRef,
    }
  ]

  const inputProps = combineProps<typeof inputPropsArray>(inputPropsArray, reverse)

  const gotRootProps = getRootProps({
      onDragOver: () => setIsDragging(true),
      onDragLeave: () => setIsDragging(false),
      onDrop: () => setIsDragging(false),
      classList: {
        isDragging: isDragging()
      },
    })

  console.log('gotRootProps', gotRootProps)

  const rootPropsArray = [
    args.rootProps ?? {},
    {
      class: [styles().root, 'upload-area'].join(' '),
      'data-upload-area': true,
      ref: rootRef
    },
    gotRootProps
  ]
  const rootProps = combineProps<typeof rootPropsArray>(rootPropsArray, reverse)

  createEffect(() => {
    files() // Watch this signal
    if (args.onUpload) args.onUpload(files)
  })

  createEffect(() => {
    if (args.onDraggingChange) args.onDraggingChange(isDragging())
      console.log('Dragging', isDragging())
  })

  createEffect(async () => {
    if (files().length && args.store) {
      const file: UploadFile | undefined = files()[0]

      if (file) {
        try {
          file.path = window.webUtils.getPathForFile(file.file)
          const dataURL = await readFileAsDataURL(file.file)
          setPreviewSrc(dataURL)
          setValue(args.store, args.field.name, file as any)
        } catch (error) {
          console.error('Error reading file:', error)
          //@ts-expect-error
          throw new FormError('Error reading file: ' + error.message)

          // Handle error (e.g., show error message to user)
        }
      }
    }
  })

  // Helper function to read file as data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  setTimeout(() => {
    setRefs(rootRef, inputRef)
  })

  return (
    <>
      {args.showLabel && (
        <label class={styles().label} for={args.field.name}>{args?.label || args?.field?.name}</label>
      )}
      {shouldShowPreview() ? (
        <div class={styles().imgPreviewHolder}>
          <MageTrash class={styles().trashIcon} onClick={() => setPreviewSrc(undefined)}/>
          <img class={styles().imgPreview} src={previewSrc()} alt="Preview" />
        </div>
      ) : (
        <div {...rootProps} classList={{ isDragging: isDragging() }} ref={rootRef}>
          {args.children || (
            <div class={[styles().content, 'upload-area__content'].join(' ')}>
              <MageFileUpload width={'60px'} height={'60px'} class={[styles().icon].join('uploadIcon')} />
              <div class={styles().spacer}></div>
              <h2 class={styles().message}>{args?.message || 'Drop file here'}</h2>
            </div>
          )}
          <input {...inputProps} />
        </div>
      )}
      {args.field.error && (
        <div class={styles().fieldError}>
          {args.field.error}
        </div>
      )}
    </>
  )
}