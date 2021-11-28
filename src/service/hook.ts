import { useQuery } from 'react-query'
import service from './service'

export declare const assetSortType: 'amount' | 'increase' | 'decrease' | undefined

export const useAssetResult = ({
    filterHidden = false,
    hideSmallAssets = false,
    sort = 'amount',
    limit
}: {
    filterHidden?: boolean
    hideSmallAssets?: boolean
    sort?: typeof assetSortType
    limit?: number
} = {}) => useQuery(
    ['asset', filterHidden, hideSmallAssets, sort],
    () => {
        let builder = service.assetResults()

        if (filterHidden)
            builder = builder.andWhere('(extra.hidden IS NULL OR extra.hidden = false)')
        if (hideSmallAssets)
            builder = builder.andWhere('(asset.balance * asset.price_usd) > 1')
        switch (sort) {
            case 'amount':
                builder = builder.orderBy('(asset.balance * asset.price_usd)', 'DESC')
                break
            case 'increase':
                builder = builder.orderBy('asset.change_usd', 'DESC')
                break
            case 'decrease':
                builder = builder.orderBy('CAST(asset.change_usd as DECIMAL)', 'ASC')
                break
        }
        if (limit)
            builder = builder.limit(limit)

        return builder.getMany()
    },
    {
        initialData: [],
    }
)
