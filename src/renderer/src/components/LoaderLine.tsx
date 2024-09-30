import { createSignal, Show } from 'solid-js'
import styles from'./LoaderLine.module.css'


export function createLoaderLine() {
  const [show, setShow] = createSignal(false)

  return {
    show() {
      setShow(true)
    },
    hide() {
      setShow(false)
    }, 
    toggle() {
      setShow(!show())
    }, 
    LoaderLine() {
      return (
        <Show when={show()}>
          <div class={styles.holder} >
            <div class={styles.left}></div>
            <div class={styles.right}></div>
          </div>
        </Show>
      )
    }
  }
}

export function LoaderLine(p) {
  return (
    <Show when={p.show}>
      <div class={styles.holder} >
        <div class={styles.left}></div>
        <div class={styles.right}></div>
      </div>
    </Show>
    )
}