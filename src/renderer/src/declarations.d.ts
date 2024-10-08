import { Maybe, MaybePromise } from '@modular-forms/solid';
import { JSXElement } from 'solid-js';

declare module '@modular-forms/solid' {
  export type ValidateField<TFieldValue> = (value: Maybe<TFieldValue>) => Maybe<MaybePromise<JSXElement>>
}


declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '**/*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.styl' {
  const classes: { [key: string]: string };
  export default classes;
}
