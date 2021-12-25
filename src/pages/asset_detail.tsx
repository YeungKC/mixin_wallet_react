import { useParams } from "react-router"
import AppBar from "../component/app_bar"
import {
  useAsset,
  useSnapshotsAndUpdate,
  useUpdateAsset,
} from "../service/hook"
import { LoadingPage } from "./loading"
import BackButton from "../component/common/back_button"
import AssetIcon from "../component/asset_icon"
import FormatNumber from "../component/common/format_number"
import { FC, HTMLAttributes, useEffect, useMemo } from "react"
import { AssetSchema } from "../store/database/entity/asset"
import { useProfileCurrencySymbolValue } from "../recoil/profile"
import { bigGt, bigMul } from "../util/big"
import ActionBarButton from "../component/action_bar_button"
import { useTranslation } from "react-i18next"
import { SnapshotSchema } from "../store/database/entity/snapshot"
import Button from "../component/common/button"
import TransactionType from "../component/transaction_type"
import TransactionIcon from "../component/transaction_icon"
import formatDate from "../util/format_date"
import WindowList from "../component/common/window_list"

const AssetDetail = () => {
  const { assetId } = useParams()
  const { data, isLoading } = useAsset(assetId ?? "")
  const { mutate, isLoading: updating } = useUpdateAsset()
  useEffect(() => {
    mutate(assetId ?? "")
  }, [mutate, assetId])

  if (isLoading || (updating && !data)) {
    return <LoadingPage />
  }

  if (!data) {
    return <div>Asset not found</div>
  }
  return (
    <div className="container flex flex-col items-center">
      <AppBar leading={<BackButton />} title={data.name} />
      <AssetIcon
        assetIconUrl={data.icon_url}
        chainIconUrl={data.chain?.icon_url}
        className="w-14 h-14 mt-5"
      />
      <Balance data={data} className="mt-4" />
      <ActionBar className="mt-6" />
      <ListHeader />
      <ListAsset />
    </div>
  )
}

const Balance: FC<
  { data: AssetSchema } & HTMLAttributes<HTMLAnchorElement>
> = ({ data, className }) => {
  const balance = useMemo(
    () => bigMul(data.balance, data.price_usd, data.fiat?.rate ?? 0),
    [data.balance, data.price_usd, data.fiat?.rate]
  )
  const symbol = useProfileCurrencySymbolValue()
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex gap-1 flex-wrap justify-center">
        <FormatNumber
          value={data.balance}
          precision={"crypto"}
          className="font-semibold text-2xl break-all text-center"
        />
        <p className="self-end mb-1">{data.symbol}</p>
      </div>
      <FormatNumber
        value={balance}
        precision={"fiat"}
        leading={symbol}
        className="text-xs font-semibold text-gray-400 break-all text-center"
      />
    </div>
  )
}

const ActionBar: FC<HTMLAttributes<HTMLDivElement>> = ({ className }) => {
  const [t] = useTranslation()
  return (
    <div
      className={`w-full flex items-center justify-center mb-4 h-10 px-8 ${className}`}
    >
      <ActionBarButton name={t("send")} className="rounded-l-lg" />
      <ActionBarButton name={t("receive")} />
      <ActionBarButton name={t("swap")} className="rounded-r-lg" />
    </div>
  )
}

const ListAsset = () => {
  const { assetId } = useParams()
  const { data, fetchNextPage, hasNextPage, isLoading } = useSnapshotsAndUpdate(
    {
      assetId: assetId ?? "",
    }
  )

  const [t] = useTranslation()

  const list = data?.pages?.reduce((p, c) => p.concat(c), []) ?? []

  return (
    <div className="w-full">
      <WindowList
        onScroll={({ clientHeight, scrollHeight, scrollTop }) => {
          if (scrollHeight - scrollTop > clientHeight * 1.5) return
          fetchNextPage()
        }}
        rowCount={list.length}
        rowHeight={72}
        rowRenderer={({ index, style }) => (
          <ListItem
            key={list[index].snapshot_id}
            style={style}
            data={list[index]}
          />
        )}
      />
      <p className="p-8 flex justify-center items-center text-sm text-gray-400">
        {(hasNextPage || isLoading) && t("loadingMore")}
        {!hasNextPage && !isLoading && t("noMoreData")}
      </p>
    </div>
  )
}

const ListItem: FC<
  { data: SnapshotSchema } & HTMLAttributes<HTMLAnchorElement>
> = ({ data, style }) => {
  const isPositive = useMemo(() => bigGt(data.amount, 0), [data.amount])
  return (
    <Button
      to={`/snapshot/${data.snapshot_id}`}
      className="p-4 flex gap-3"
      style={style}
    >
      <TransactionIcon data={data} className="flex-shrink-0" />
      <div className="flex-grow flex flex-col justify-between overflow-hidden overflow-ellipsis">
        <p className="font-medium text-sm">
          <TransactionType type={data.type} />
        </p>
        <p className="text-xs text-gray-400">
          <Date date={data.created_at} />
        </p>
      </div>
      <div className="flex gap-1 text-sm flex-shrink-0">
        <FormatNumber
          value={data.amount}
          precision={"crypto"}
          leading={isPositive ? "+" : ""}
          className={`font-semibold ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        />
        <p>{data.asset?.symbol}</p>
      </div>
    </Button>
  )
}

const Date: FC<{ date: string }> = ({ date }) => {
  const dateText = useMemo(() => formatDate(date, "ll"), [date])
  return <>{dateText}</>
}

const ListHeader = () => {
  const [t] = useTranslation()
  return (
    <div className="w-full h-10 py-2 px-4 font-semibold">
      {t("transactions")}
    </div>
  )
}

export default AssetDetail
