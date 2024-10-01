import { Button as KButton } from "@kobalte/core/button";
import "./style.css";
function extendFn<T extends (...args: any[]) => any>(
  og: T, 
  wrap: (fn: T , args: Parameters<T>) => ReturnType<T>): T {
  const h = (...args: Parameters<T>): ReturnType<T> => {
    return wrap(og, args);
  };

  return h as T;
}



export function Button(props) {
  return (
    <KButton class="button">
      {props.children}
    </KButton>
  )
}