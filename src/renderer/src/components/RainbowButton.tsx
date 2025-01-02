import { JSX, splitProps } from 'solid-js';
import './RainbowButton.css'




export const RainbowButton = (props: { children: JSX.Element, onClick: () => void, style: string } & JSX.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const [elementProps, buttonProps] = splitProps(props, ['children', 'onClick', 'style'])


  return ( 
    <div class={`rainbow-button ${props.class}`} style={elementProps.style} onClick={elementProps.onClick}>
      <button {...buttonProps} class={"rainbow-button__content "}> {elementProps.children}</button>
      <div class="rainbow-button__rainbow"> {` `}</div>
      <div class="rainbow-button__background">{` `}</div>
    </div>
  )
}

export default RainbowButton


        // <button class="add-button2" type="submit">
        //   <div class="add-button__content">
        //     Add item
        //     <HugeiconsAddSquare />
        //   </div>
        //   <div class="add-button__rainbow"></div>
        //   <div class="add-button__background"></div>
        // </button>