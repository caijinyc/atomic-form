<h1 align="center">
Atomic Form
</h1>

<p align="center">
Atom-first, High-performance Form solution.
</p>

## Installation

```bash
pnpm add @atomic-form/react
```

This library works with all modern browsers. It does not work with IE.

## Usage

```tsx
import { Field, useForm } from "@atomic-form/react";

function AtomicFormDemo() {
  const form = useForm<{ name: string; age: number }>({initialValue: {name: 'tom', age: 18}})

  return (
    <div>
      <Field form={ form.node('name') }>
        <input/>
      </Field>
      <Field form={ form.node('age') }>
        <input type={'number'}/>
      </Field>
    </div>
  )
}
```
