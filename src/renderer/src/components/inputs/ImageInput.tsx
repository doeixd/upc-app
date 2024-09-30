import { FieldProps, FieldStore, FieldValue, FormStore, ResponseData, setValue } from "@modular-forms/solid";
import { triggerDropEvent } from "@renderer/utils/triggerDropEvent";
import { debounce } from "@solid-primitives/scheduled";
import createDropzone from "solid-dzone";
import { createSignal, createEffect, Show, JSX } from "solid-js";
import MageFileUpload from '~icons/mage/file-upload'
import MageTrash from '~icons/mage/trash'
import style from './ImageInput.module.css'
import { UploadFile } from "@renderer/utils/global"
import { FieldPath } from "@modular-forms/solid";

type ImageInputProps<T extends Record<string, FieldValue> = Record<string, FieldValue>, S extends FieldPath<T> = FieldPath<T>> = {
  inputProps: JSX.HTMLElementTags['input'];
  store?: FormStore<T, S>,
  showLabel: boolean,
  label?: string,
  field: FieldStore<T, S>
}

export function ImageInput<T extends Record<string, FieldValue>, S extends FieldPath<T>>(props: ImageInputProps<T, S>) {
  let inputRef!: HTMLInputElement
  let rootRef!: HTMLDivElement

  const { getRootProps, getInputProps, setRefs, files } = createDropzone<HTMLDivElement>()

  const [isDragging, setIsDraggingInternal] = createSignal(false)
  const setIsDraggingDebounced = debounce((value: boolean) => setIsDraggingInternal(value), 50);

  const [previewSrc, setPreviewSrc] = createSignal<string | ''>()

  createEffect(async () => {
    if (files().length && props.store) {
      const file: UploadFile | undefined = files()[0]

      if (file) {
        try {
          file.path = window.webUtils.getPathForFile(file.file)
          const dataURL = await readFileAsDataURL(file.file)
          setPreviewSrc(dataURL)
          setValue(props.store, props.field.name, file.path as any)
        } catch (error) {
          console.error('Error reading file:', error)
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
    // Refs must be set inside a timeout to ensure the elements have been mounted
    setRefs(rootRef, inputRef)
  })

  return (
    <Show
      when={previewSrc()}
      fallback={
        <>
          <Show when={props.showLabel}>
            <label class={style.label} for={props.field.name}>{props?.label || props?.field?.name}</label>
          </Show>
          <div 
            classList={{ [style.isDragging]: isDragging() }} 
            class={`${style.uploadArea} ${isDragging() ? style.isDragging : ''} upload-area`}
            {...getRootProps({
              onDragOver: () => setIsDraggingDebounced(true),
              onDragLeave: () => setIsDraggingDebounced(false),
              onDrop: () => setIsDraggingDebounced(false)
            })}
            ref={rootRef}
          >
            <div class={[style.uploadAreaContent, 'upload-area__content'].join(' ')}>
              <MageFileUpload class={[style.uploadIcon, 'uploadIcon'].join(' ')} width={'60px'} height={'60px'} color='oklch(0.89 0.008 94.5 / 0.79)' display='block' />
              <div class={style.spacer}></div>
              <h2 class={style.dropText}>Drop file here</h2>
            </div>
            <input 
              {...props.inputProps} 
              type="file" 
              id="fileElem" 
              multiple 
              accept="image/*" 
              class={style.fileInput}
              onChange={(e) => triggerDropEvent(e.target, e.target.files)} 
              ref={inputRef} 
            />
          </div>
          <Show when={props.field.error}>
            <div class={style.fieldError}>
              {props.field.error}
            </div>
          </Show>
        </>
      }
    >
      <div class={style.imgPreviewHolder}>
        <MageTrash class={style.trashIcon} onClick={() => setPreviewSrc()} />
        <img class={style.imgPreview} src={previewSrc()} alt="Preview" />
      </div>
    </Show>
  )
}