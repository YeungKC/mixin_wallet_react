import { FC, HTMLAttributes } from "react"

const AssetIcon: FC<
  {
    assetIconUrl: string
    chainIconUrl?: string
  } & HTMLAttributes<HTMLAnchorElement>
> = ({ assetIconUrl, chainIconUrl, className }) => {
  const chainIcon = chainIconUrl && (
    <img
      src={chainIconUrl}
      loading="lazy"
      className="absolute w-[14px] h-[14px] bottom-0 left-0"
    />
  )
  return (
    <div className={`relative w-10 h-10 ${className}`}>
      <img src={assetIconUrl} loading="lazy" className="w-full h-full" />
      {chainIcon}
    </div>
  )
}

export default AssetIcon
