import { titleCase } from "scule"
import { TextField } from "./TextField"

export function TextInput (p) {
 const Field =  p.formComponents.Field

  return (
    <Field name={p.name}>
      {(field, props) => (
        <TextField
          {...props}
          type="text"
          label={titleCase(p.name.trim())}
          value={field.value}
          error={field.error}
          required
        />
      )}
    </Field>
  )
}



