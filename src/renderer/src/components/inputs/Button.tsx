import { Button as KButton } from "@kobalte/core/button";
import styles from "./button.module.css";





export const Button = ((props) => {
  return (
    <KButton {...props} class={styles.button}>
      {props.children}
    </KButton>
  )
}) as typeof KButton