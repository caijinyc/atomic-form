import { expect, test, vitest } from 'vitest'
import { act, fireEvent, getByTestId, render } from '@testing-library/react'
import React from 'react'
import { nextTick, timeout } from '@atomic-form/shared'
import { createForm } from '@atomic-form/core'
import { Field } from '../src/components/field'

test('basic use', async() => {
  const form = createForm<{
    name?: string
    age: number
  }>({
    initialValue: { age: 0 },
  })

  const { rerender, container, unmount } = render(
    <Field form={form.node('name')} defaultState={{ initialValue: 'tom' }}>
      <input data-testid={'input'} />
    </Field>,
  )

  const inputElement = getByTestId(container, 'input') as HTMLInputElement
  expect(inputElement.value).toEqual('tom')

  expect(form.node('name').state.initialized).toBeTruthy()

  form.node('name').setValue('tom2')
  expect(inputElement.value).toEqual('tom2')

  expect(form.state.modified).not.toBeTruthy()

  fireEvent.change(inputElement, { target: { value: '23456' } })
  expect(inputElement.value).toEqual('23456')

  expect(form.state.modified).toBeTruthy()
  expect(form.node('name')).toBeTruthy()

  expect(form.node('name').state.value).toEqual('23456')
})

test('when visible is false, Field will return null', async() => {
  const form = createForm<string>({
  } as any)
  const { container } = render(
    <Field form={form} defaultState={{ initialValue: 'tom' }}>
      <input data-testid={'input'} />
    </Field>,
  )
  expect(container.childElementCount).toBe(1)
  form.setState({ visible: false })
  expect(container.childElementCount).toBe(0)
})

test('mapValue', async() => {
  const form = createForm<string>({
    initialValue: 'tom',
  })
  const { container } = render(
    <Field form={form} mapValue={v => `${v}zzz`}>
      <input data-testid={'input'} />
    </Field>,
  )
  const ele = getByTestId(container, 'input') as HTMLInputElement
  expect(ele.value).toEqual('tomzzz')
})

test('onUpdateValue', async() => {
  const form = createForm<string>({
    initialValue: 'tom',
  })
  const { container } = render(
    <Field form={form} onUpdateValue={v => `${v}zzz`}>
      <input data-testid={'input'} />
    </Field>,
  )
  const ele = getByTestId(container, 'input') as HTMLInputElement
  fireEvent.change(ele, { target: { value: '111' } })
  expect(form.state.value).toEqual('111zzz')
})

test('valuePropName', async() => {
  const form = createForm<boolean>({
    initialValue: true,
  })
  const { container } = render(
    <Field form={form} valuePropName={'checked'}>
      <input type={'checkbox'} data-testid={'checkbox'} />
    </Field>,
  )
  const ele = getByTestId(container, 'checkbox') as HTMLInputElement
  expect(ele.checked).toEqual(true)
})

test('getValueFromEvent', async() => {
  const form = createForm<string>({
    initialValue: 'tom',
  })
  const { container } = render(
    <Field form={form} getValueFromEvent={(e) => {
      return `${e.target.value}zzz`
    }}>
      <input data-testid={'input'} />
    </Field>,
  )
  const ele = getByTestId(container, 'input') as HTMLInputElement
  fireEvent.change(ele, { target: { value: '111' } })
  expect(form.state.value).toEqual('111zzz')
})
