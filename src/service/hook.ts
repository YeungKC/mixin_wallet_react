import { useEffect, useState } from "react"
import { useInfiniteQuery, useMutation, useQuery } from "react-query"
import service from "./service"

export declare const assetSortType:
  | "amount"
  | "increase"
  | "decrease"
  | undefined

export const useAssets = ({
  filterHidden = false,
  hideSmallAssets = false,
  sort = "amount",
  limit,
}: {
  filterHidden?: boolean
  hideSmallAssets?: boolean
  sort?: typeof assetSortType
  limit?: number
} = {}) =>
  useQuery(["asset", filterHidden, hideSmallAssets, sort], () => {
    let builder = service.assetResults()

    if (filterHidden)
      builder = builder.andWhere(
        "(extra.hidden IS NULL OR extra.hidden = false)"
      )
    if (hideSmallAssets)
      builder = builder.andWhere("(asset.balance * asset.price_usd) > 1")
    switch (sort) {
      case "amount":
        builder = builder
          .addOrderBy("(asset.balance * asset.price_usd)", "DESC")
          .addOrderBy("asset.balance", "DESC")
        break
      case "increase":
        builder = builder.orderBy("asset.change_usd", "DESC")
        break
      case "decrease":
        builder = builder.orderBy("CAST(asset.change_usd as DECIMAL)", "ASC")
        break
    }
    if (limit) builder = builder.limit(limit)

    return builder.getMany()
  })

export const useAsset = (id: string) =>
  useQuery(["asset", id], () =>
    service
      .assetResults()
      .where("asset.asset_id = :id", { id })
      .limit(1)
      .getOne()
  )

export const useSnapshotsAndUpdate = ({
  assetId,
  opponentId,
  limit = 30,
}: {
  assetId?: string
  opponentId?: string
  offset?: string
  limit?: number
}) => {
  const { data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery(
    ["snapshot", assetId],
    async ({ pageParam }) => {
      let builder = service.snapshotResults()
      if (assetId) {
        builder = builder.andWhere("snapshot.asset_id = :assetId", { assetId })
      }
      if (opponentId) {
        builder = builder.andWhere("snapshot.opponent_id = :opponentId", {
          opponentId,
        })
      }

      if (pageParam) {
        builder = builder.andWhere("snapshot.created_at < :offset", {
          offset: pageParam,
        })
      }

      return builder
        .addOrderBy("snapshot.created_at", "DESC")
        .limit(limit)
        .getMany()
    },
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.length < limit) return undefined
        return lastPage[lastPage.length - 1]?.created_at
      },
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
    isLoading: isLoading || isFetching,
    hasNextPage,
    fetchNextPage: async () => {
      if (!assetId) return
      if (isLoading || isFetching) return
      const { data } = await fetchNextPage()
      const offset = data?.pageParams[data?.pageParams.length - 1] as
        | string
        | undefined
      if (lastParam === offset) return
      await mutateAsync({ assetId, offset, limit })
      setLastParam(offset)
    },
  }
}

export const useSnapshot = (id: string) =>
  useQuery(["snapshot", id], async () =>
    service
      .snapshotResults()
      .where("snapshot.snapshot_id = :id", { id })
      .limit(1)
      .getOne()
  )

export const useTicker = (assetId: string, offset?: string) =>
  useQuery(["ticker", assetId, offset], () => service.ticker(assetId, offset))

export const useTopAssetsAndUpdate = () => {
  const { data: ids } = useQuery("topAssetId", () => service.topAssetIds())
  const { data, isLoading } = useQuery(
    ["asset", ids],
    () =>
      service
        .assetResults()
        .where("asset.asset_id IN (:...ids)", { ids })
        .orderBy(
          `CASE asset.asset_id
          ${
            ids?.map((id, index) => `WHEN '${id}' THEN ${index}`).join("\n") ??
            ""
          }
          ELSE 999999
          END
        `
        )
        .limit(ids?.length ?? 0)
        .getMany(),
    { enabled: !!ids }
  )

  const { mutate, isLoading: updating } = useMutation({
    mutationFn: () => service.updateTopAssetIds(),
  })

  useEffect(() => {
    mutate()
  }, [mutate])

  return {
    data,
    isLoading: isLoading || (updating && !data),
    mutate: mutate,
  }
}

export const useSearchAssets = (query: string | null | undefined) => {
  const { data, isLoading } = useQuery(["asset", query], () => {
    if (!query) return []
    return service
      .assetResults()
      .orWhere(`asset.symbol LIKE '%${query}%'`)
      .orWhere(`asset.name LIKE '%${query}%'`)
      .addOrderBy(
        `
          CASE
          WHEN asset.symbol = '${query}' THEN 1
          WHEN asset.name = '${query}' THEN 2
          WHEN asset.symbol LIKE '${query}%' THEN 100 + LENGTH(asset.symbol)
          WHEN asset.name LIKE '${query}%' THEN 200 + LENGTH(asset.name)

          WHEN asset.symbol LIKE '%${query}%' THEN 300 + LENGTH(asset.symbol)
          WHEN asset.name LIKE '%${query}%' THEN 400 + LENGTH(asset.name)

          WHEN asset.symbol LIKE '%${query}' THEN 500 + LENGTH(asset.symbol)
          WHEN asset.name LIKE '%${query}' THEN 600 + LENGTH(asset.name)
          ELSE 1000
          END
          `
      )
      .addOrderBy("asset.price_usd > 0", "DESC")
      .addOrderBy("asset.symbol", "ASC")
      .addOrderBy("asset.name", "ASC")
      .getMany()
  })

  const { mutate, isLoading: updating } = useMutation({
    mutationFn: (query: string) => service.searchAssets(query),
  })

  useEffect(() => {
    if (query) mutate(query)
  }, [mutate, query])

  return {
    data,
    isLoading: isLoading || updating,
  }
}

export const useUpdateAssets = () =>
  useMutation({
    mutationFn: () => service.updateAssets(),
  })

export const useUpdateAsset = () =>
  useMutation({
    mutationFn: (assetId: string) => service.updateAsset(assetId),
  })

export const useUpdateAssetSnapshots = () =>
  useMutation({
    mutationFn: ({
      assetId,
      offset,
      limit = 30,
    }: {
      assetId: string
      offset?: string
      limit: number
    }) => service.updateAssetSnapshots(assetId, offset, limit),
  })

export const useUpdateAssetSnapshot = () =>
  useMutation({
    mutationFn: (snapshotId: string) => service.updateSnapshot(snapshotId),
  })
