import { FC, HTMLAttributes, memo, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useProfileCurrencySymbolValue } from "../recoil/profile"
import { AssetSchema } from "../store/database/entity/asset"
import { bigGt, bigLt, bigMul } from "../util/big"
import FormatNumber from "./common/format_number"

const AssetPriceAndChange: FC<
  { asset: AssetSchema } & HTMLAttributes<HTMLAnchorElement>
> = ({ asset, className }) => {
  const symbol = useProfileCurrencySymbolValue()
  const valid = useMemo(() => bigGt(asset.price_usd, 0), [asset.price_usd])

  const isNegative = useMemo(
    () => bigLt(asset.change_usd, 0),
    [asset.change_usd]
  )

  const unitPrice = useMemo(() => {
    if (!valid) return 0
    return bigMul(asset.price_usd, asset.fiat?.rate ?? 0)
  }, [valid, asset.price_usd, asset.fiat?.rate])
  const changeUsd = useMemo(
    () => bigMul(asset.change_usd, 100),
    [asset.change_usd]
  )

  const [t] = useTranslation()

  if (!valid)
    return (
      <div className={`text-sm text-gray-400 ${className}`}>{t("none")}</div>
    )

  return (
    <div
      className={`${
        isNegative ? "text-red-400" : "text-green-400"
      } ${className}`}
    >
      <div className="flex flex-col justify-between text-xs items-end">
        <FormatNumber value={changeUsd} precision={2} trailing="%" />
        <FormatNumber
          className="text-gray-400"
          value={unitPrice}
          precision={2}
          leading={symbol}
        />
      </div>
    </div>
  )
}

export default memo(AssetPriceAndChange)
