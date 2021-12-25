import { FC, HTMLAttributes, memo, useMemo } from "react"

import { toRounding } from "../../util/big"

export interface FormatNumberProps {
  value: number | string
  precision: number | "crypto" | "fiat"
  trailing?: string
  leading?: string
}

const FormatNumber: FC<FormatNumberProps & HTMLAttributes<HTMLAnchorElement>> =
  memo(({ value, precision, leading, trailing, className }) => {
    const text = useMemo(() => {
      let _precision = 0
      switch (precision) {
        case "crypto":
          _precision = 8
          break
        case "fiat":
          _precision = 2
          break
        default:
          _precision = precision
      }
      return toRounding(value, _precision)
    }, [value, precision])
    return (
      <p className={className}>
        {leading ? leading : ""}
        {text}
        {trailing ? trailing : ""}
      </p>
    )
  })

export default FormatNumber
