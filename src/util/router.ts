import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"

export const useSetQueryString = (obj: {
  [key: string]: string | undefined | null
}) => {
  const [params] = useSearchParams()
  return useMemo(() => {
    const p = new URLSearchParams(params)
    Object.keys(obj).forEach((key) => {
      const value = obj[key]
      if (value === null) p.delete(key)
      else p.set(key, value ?? "")
    })
    return p.toString()
  }, [obj, params])
}
