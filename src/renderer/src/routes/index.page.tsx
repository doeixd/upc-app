import MageFileUpload from '~icons/mage/file-upload'
import HeroiconsOutlineUpload from '~icons/heroicons-outline/upload'

export default function Index() {
  return (
    <div class="flex flex-col items-center place-content-center pt-[33px]  border-1 border-red-500 w-full">
      <h1 class="font-bold" style='font-size: 3rem'>Get Started</h1>
      <p style='opacity: 0.7; max-width: 30ch; text-align: center; padding-top: 1px; font-size: 1.1rem'>Drop a csv file with your upcs and products below</p>
      <div class="py-[33px]">  </div>
      <UploadArea />
    </div>
  )
}


function UploadArea() {
  return (
    <div class="rounded-[16px] border-[4px] border-dashed w-full max-w-[400px] flex" style='border-color: oklch(0.95 0.004 94.5 / 1); aspect-ratio: 4/2.8'>
      <div class='flex flex-col place-content-center place-items-center w-full'>
        <MageFileUpload width={'68px'} height={'68px'} color='oklch(0.89 0.008 94.5 / 0.79)' display='block' class="uploadIcon" />
        {/* <HeroiconsOutlineUpload width={'3.8rem'} height={'3.8rem'} color='oklch(0.91 0.008 94.5 / 0.8)' display='block'  class='uploadIcon'/> */}

        <div class='block py-[6.5px]'></div>
        <h2 style='letter-spacing: -1px; font-weight: 600; font-size: 2.7rem; text-align:center; color: oklch(0.92 0.008 94.5 / 0.76)'>Drop file here</h2>
      </div>
      <input type="file" id="fileElem" multiple accept="*" style="display:none"></input>
    </div>
  )
}