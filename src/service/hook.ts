import { useEffect, useState } from 'react'
import { useInfiniteQuery, useMutation, useQuery } from 'react-query'
import service, { queryClient } from './service'

export declare const assetSortType: 'amount' | 'increase' | 'decrease' | undefined

export const useAssetResults = ({
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
                builder = builder.addOrderBy('(asset.balance * asset.price_usd)', 'DESC')
                    .addOrderBy('asset.balance', 'DESC')
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
    }
)

export const useAssetResult = (id: string) =>
    useQuery(
        ['asset', id],
        () => service.assetResults()
            .where('asset.asset_id = :id', { id })
            .limit(1)
            .getOne(),
    )

export const useSnapshots = ({
    assetId,
    opponentId,
    limit = 30,
}: {
    assetId?: string
    opponentId?: string
    offset?: string
    limit?: number
}) => {
    const { data, isFetching, fetchNextPage } = useInfiniteQuery(
        ['snapshot', assetId],
        async ({ pageParam }) => {
            let builder = service.snapshotResults()
            if (assetId) {
                builder = builder.andWhere('snapshot.asset_id = :assetId', { assetId })
            }
            if (opponentId) {
                builder = builder.andWhere('snapshot.opponent_id = :opponentId', { opponentId })
            }

            if (pageParam) {
                builder = builder.andWhere('snapshot.created_at < :offset', { offset: pageParam })
            }

            return builder.addOrderBy('snapshot.created_at', 'DESC')
                .limit(limit)
                .getMany()
        },
        {
            getNextPageParam: (lastPage) => lastPage[lastPage.length - 1]?.created_at,
        }
    )
    const { mutateAsync, isLoading } = useUpdateAssetSnapshots()
    const [lastParam, setLastParam] = useState<string | undefined>(undefined)

    useEffect(() => {
        const load = async () => {
            if (!assetId) return
            await mutateAsync({ assetId, offset: undefined, limit })
        }
        load()
    }, [assetId, mutateAsync, limit])

    return {
        data: data,
        fetchNextPage: async () => {
            if (isLoading || isFetching) return
            fetchNextPage()
            if (!assetId) return
            const offset = data?.pageParams[data?.pageParams.length - 1] as string | undefined
            if (lastParam === offset) return
            await mutateAsync({ assetId, offset, limit })
            setLastParam(offset)
        },
    }
}

export const useUpdateAssets = () => useMutation({
    mutationFn: () => service.updateAssets(),
    onSuccess: () => {
        queryClient.invalidateQueries('asset')
        queryClient.invalidateQueries('fiat')
    }
})

export const useUpdateAsset = () => useMutation({
    mutationFn: (assetId: string) => service.updateAsset(assetId),
    onSuccess: () => {
        queryClient.invalidateQueries('asset')
        queryClient.invalidateQueries('fiat')
    }
})

export const useUpdateAssetSnapshots = () => useMutation({
    mutationFn: ({ assetId, offset, limit = 30 }: { assetId: string, offset?: string, limit: number }) => service.updateAssetSnapshots(assetId, offset, limit),
    onSuccess: () => {
        queryClient.invalidateQueries('snapshot')
        queryClient.invalidateQueries('asset')
        queryClient.invalidateQueries('user')
    }
})