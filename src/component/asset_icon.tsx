import { FC, HTMLAttributes } from "react"
import { AssetSchema } from "../store/database/entity/asset"

const AssetIcon: FC<{ asset: AssetSchema } & HTMLAttributes<HTMLAnchorElement>> = ({ asset, className }) => {
    const chainIcon = asset.chain && (
        <img src={asset.chain.icon_url} loading='lazy' className="absolute w-[14px] h-[14px] bottom-0 left-0" />
    )
    return <div className={`relative w-10 h-10 ${className}`}>
        <img src={asset.icon_url} loading='lazy' className="w-full h-full" />
        {chainIcon}
    </div>
}

export default AssetIcon