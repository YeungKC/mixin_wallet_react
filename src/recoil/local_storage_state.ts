import { AtomEffect, atomFamily, DefaultValue } from 'recoil'

const localStorageEffect: <T>(key: string) => AtomEffect<T> =
  (key: string) =>
    ({ setSelf, onSet }) => {
      const savedValue = localStorage.getItem(key)
      if (!!savedValue) {
        let value: any | string
        try {
          value = JSON.parse(savedValue)
        } catch (_) {
          value = savedValue
        }
        setSelf(value)
      }

      onSet((newValue) => {
        if (newValue instanceof DefaultValue || newValue === undefined) {
          return localStorage.removeItem(key)
        }
        if (typeof newValue === 'string') {
          localStorage.setItem(key, newValue)
        } else {
          localStorage.setItem(key, JSON.stringify(newValue))
        }
      })
    }

export const localStorageState = <T>(param: string) =>
  atomFamily<T | undefined, string>({
    key: 'localStorageState',
    default: undefined,
    effects_UNSTABLE: (key: string) => [
      localStorageEffect<T | undefined>(key),
    ],
  })(param)
