import MageFileUpload from '~icons/mage/file-upload'
import HeroiconsOutlineUpload from '~icons/heroicons-outline/upload'
import createDropzone from 'solid-dzone'
import { createEffect, createSignal } from 'solid-js'
import { debounce } from '@solid-primitives/scheduled';

import './indexPage.css'
import { db } from '@renderer/utils/duckdb';
import * as api from '@renderer/utils/api'
import { setCurrentFile, setDb, UploadFile, createBackButton} from '@renderer/utils/global';
import { Route, useNavigate } from '@solidjs/router';

export default function Index() {
  const navigate = useNavigate()
  const backButton = createBackButton()

  return (
    <div class="flex flex-col items-center place-content-center pt-[33px]  w-full">
      <h1 class="font-bold" style='font-size: 3rem'>Get Started</h1>
      <p style='opacity: 0.7; max-width: 30ch; text-align: center; padding-top: 1px; font-size: 1.1rem'>Drop a csv file with your upcs and products below</p>
      <div class="py-[33px]">  </div>
      <UploadArea navigate={navigate} />
    </div>
  )
}


function UploadArea(props) {
  let inputRef!: HTMLInputElement
  let rootRef!: HTMLDivElement

  const { getRootProps, getInputProps, setRefs, files } = createDropzone<HTMLDivElement>()

  const [isDragging, setIsDraggingOg] = createSignal(false)
  const setIsDragging = debounce((value: boolean) => setIsDraggingOg(value), 50);
  
  createEffect(async () => {
    console.log('DND FILES', files())
    if (files().length) {
      // for (let file of files()) {
        const file: UploadFile | undefined = files().at(0)
        if (file) {
          file.path = window.webUtils.getPathForFile(file.file)
          setDb(db)
          setCurrentFile(file)

          props.navigate('/table', {scroll: true})
        }
    }
  })


  setTimeout(() => {
    // Refs must be set inside a timeout to ensure the elements have been mounted
    setRefs(rootRef, inputRef)
  })


  return (
    <div classList={{ isDragging: isDragging() }} class="upload-area rounded-[16px] border-[4px] border-dashed w-full max-w-[400px] flex z-10" style='border-color: oklch(0.95 0.004 94.5 / 1); aspect-ratio: 4/2.8'
      {...getRootProps({
        onDragOver: () => setIsDragging(true),
        onDragLeave: () => setIsDragging(false),
        onDrop: () => setIsDragging(false)
      })} 
      ref={rootRef}
    
    >
      <div class='upload-area__content flex flex-col place-content-center place-items-center w-full' style='pointer-events-none'>
        <MageFileUpload width={'68px'} height={'68px'} color='oklch(0.89 0.008 94.5 / 0.79)' display='block' class="uploadIcon" />
        {/* <HeroiconsOutlineUpload width={'3.8rem'} height={'3.8rem'} color='oklch(0.91 0.008 94.5 / 0.8)' display='block'  class='uploadIcon'/> */}

        <div class='block py-[6.5px]'></div>
        <h2 style='letter-spacing: -1px; font-weight: 600; font-size: 2.6rem; text-align:center; color: oklch(0.92 0.008 94.5 / 0.76)'>Drop file here</h2>
      </div>
      <input type="file" id="fileElem" multiple accept="*" style="display:none" {...getInputProps()} ref={inputRef}></input>
    </div>
  )
}