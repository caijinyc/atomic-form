import * as React from 'react'

import { Field, useForm, useFormValue, useWatchForm } from '@atomic-form/react'

function App() {
  const form = useForm<{ name: string; age: number }>({ initialValue: { name: 'tom', age: 18 } })
  const value = useFormValue(form)

  useWatchForm(form.node('age'), (state) => {
    console.log('age', state.value)
  })

  return (
    <div className="App">
      <div>
        <label>
          Name:
        </label>
        <Field form={ form.node('name') }>
          <input/>
        </Field>
      </div>

      <div>
        <label>
          Age:
        </label>
        <Field form={ form.node('age') } onUpdateValue={value => value ? Number(value) : 0}>
          <input type={ 'number' }/>
        </Field>
      </div>

      <pre>{ JSON.stringify(value, null, 2)}</pre>
    </div>
  )
}

export default App
