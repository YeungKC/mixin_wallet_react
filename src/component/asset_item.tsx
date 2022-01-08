import { FC, HTMLAttributes, memo, useMemo } from "react"
import { To } from "react-router-dom"

import { useProfileCurrencySymbolValue } from "../recoil/profile"
import { AssetSchema } from "../store/database/entity/asset"
import { bigMul } from "../util/big"
import AssetIcon from "./asset_icon"
import AssetPriceAndChange from "./asset_price_and_change"
import Button from "./common/button"
import FormatNumber from "./common/format_number"

const AssetItem: FC<
  {
    asset: AssetSchema
    to: To | ((asset: AssetSchema) => To)
  } & HTMLAttributes<HTMLAnchorElement>
> = memo(({ asset, to, style }) => {
  const currency = useMemo(
    () => bigMul(asset.balance, asset.price_usd, asset.fiat?.rate ?? 0),
    [asset.balance, asset.price_usd, asset.fiat?.rate]
  )
  const symbol = useProfileCurrencySymbolValue()
  const _to = useMemo(() => {
    if (to instanceof Function) {
      return to(asset)
    }
    return to
  }, [to, asset])
  return (
    <Button to={_to} className="p-4 flex gap-3" style={style}>
      <AssetIcon
        assetIconUrl={asset.icon_url}
        chainIconUrl={asset.chain?.icon_url}
        className="flex-shrink-0"
      />
      <div className="flex-grow flex flex-col justify-between truncate">
        <div className="flex font-semibold text-sm gap-1">
          <FormatNumber value={asset.balance} precision={"crypto"} />
          {asset.symbol}
        </div>
        <FormatNumber
          className="text-xs text-gray-400"
          value={currency}
          precision={"fiat"}
          leading={symbol}
        />
      </div>
      <AssetPriceAndChange asset={asset} className="" />
    </Button>
  )
})

export default AssetItem
