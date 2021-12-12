import { User } from 'mixin-node-sdk/dist/types'
import { selector, useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { getRecoilPromise, setRecoil } from 'recoil-nexus'
import symbols from '../util/symbol'
import { localStorageState } from './local_storage_state'

// token
export const tokenState = localStorageState<string>('token')
export const useTokenState = () => useRecoilState(tokenState)
const hasTokenState = selector({
    key: 'hasToken',
    get: ({ get }) => !!get(tokenState),
})
export const useHasTokenValue = () => useRecoilValue(hasTokenState)


// profile
export const profileState = localStorageState<User>('profile')

export const useProfileValue = () => useRecoilValue(profileState)
export const useSetProfileState = () => useSetRecoilState(profileState)
export const useProfileState = () => useRecoilState(profileState)

const profileCurrencyState = selector({
    key: 'profileCurrency',
    get: ({ get }) => get(profileState)?.fiat_currency ?? 'USD',
})

export const useProfileCurrencyValue = () => useRecoilValue(profileCurrencyState)

const profileCurrencySymbolState = selector({
    key: 'profileCurrencySymbol',
    get: ({ get }) => (symbols as any)[get(profileCurrencyState)] ?? '$',
})

export const useProfileCurrencySymbolValue = () => useRecoilValue(profileCurrencySymbolState)


// location from
const locationFromState = localStorageState<string>('locationFrom')

export const setLocationFrom = (location: string) => {
    setRecoil(locationFromState, location)
}

export const getLocationFrom = () => getRecoilPromise(locationFromState)