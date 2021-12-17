import { FC, HTMLAttributes, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import AppBar from "../component/app_bar"
import AssetIcon from "../component/asset_icon"
import BackButton from "../component/common/back_button"
import FormatNumber from "../component/common/format_number"
import TransactionType from "../component/transaction_type"
import {
  useProfileCurrencySymbolValue,
  useProfileValue,
} from "../recoil/profile"
import { useSnapshot, useTicker, useUpdateAssetSnapshot } from "../service/hook"
import { SnapshotSchema } from "../store/database/entity/snapshot"
import { bigAbs, bigGt, bigMul } from "../util/big"
import formatDate from "../util/format_date"
import { LoadingPage } from "./loading"

const SnapshotDetail = () => {
  const { snapshotId } = useParams()
  const { data, isLoading } = useSnapshot(snapshotId ?? "")
  const { mutate, isLoading: updating } = useUpdateAssetSnapshot()
  useEffect(() => {
    mutate(snapshotId ?? "")
  }, [mutate, snapshotId])

  const { t } = useTranslation()

  if (isLoading || (updating && !data)) return <LoadingPage />

  if (!data) return <div>Snapshot not found</div>

  return (
    <div className="container flex flex-col items-center pb-10">
      <AppBar leading={<BackButton />} title={t("transactions")} />
      <AssetIcon
        assetIconUrl={data.asset?.icon_url ?? ""}
        chainIconUrl={data.chain?.icon_url}
        className="w-14 h-14 mt-6"
      />
      <Value data={data} className="mt-4" />
      <Detail data={data} />
    </div>
  )
}

const Value: FC<
  { data: SnapshotSchema } & HTMLAttributes<HTMLAnchorElement>
> = ({ data, className }) => {
  const isPositive = useMemo(() => bigGt(data.amount, 0), [data.amount])
  const nowValue = useMemo(
    () =>
      bigMul(
        bigAbs(data.amount),
        data.asset?.price_usd ?? 0,
        data.fiat?.rate ?? 0
      ),
    [data.amount, data.asset?.price_usd, data.fiat?.rate]
  )

  const { data: ticker, isLoading } = useTicker(data.asset_id, data.created_at)

  const tickerValue = useMemo(() => {
    if (!ticker) return
    return bigMul(bigAbs(data.amount), ticker?.price_usd, data.fiat?.rate ?? 0)
  }, [data.amount, ticker, data.fiat?.rate])
  const tickerValueValid = useMemo(
    () => bigGt(tickerValue ?? 0, 0),
    [tickerValue]
  )

  const symbol = useProfileCurrencySymbolValue()

  const [t] = useTranslation()
  return (
    <div
      className={`w-full flex flex-col items-center pb-4 border-b-8 border-gray-100 ${className}`}
    >
      <div className="flex gap-1 flex-wrap justify-center">
        <FormatNumber
          value={data.amount}
          precision={"crypto"}
          className={`font-semibold text-2xl break-all text-center ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        />
        <p className="self-end mb-1">{data.asset?.symbol}</p>
      </div>
      <div className="text-gray-400 text-sm flex flex-col items-center">
        <FormatNumber
          value={nowValue}
          precision={"fiat"}
          leading={t("walletTransactionCurrentValue") + symbol}
        />
        {!tickerValueValid && (
          <p>
            {isLoading
              ? `${t("walletTransactionThatTimeValue") + symbol}...`
              : t("walletTransactionThatTimeNoValue")}
          </p>
        )}
        {tickerValueValid && (
          <FormatNumber
            value={tickerValue!} // eslint-disable-line @typescript-eslint/no-non-null-assertion
            precision={"fiat"}
            leading={t("walletTransactionThatTimeValue") + symbol}
          />
        )}
      </div>
    </div>
  )
}

const Detail: FC<
  { data: SnapshotSchema } & HTMLAttributes<HTMLAnchorElement>
> = ({ data, className }) => {
  const { t } = useTranslation()
  const dateText = useMemo(
    () => formatDate(data.created_at, "lll"),
    [data.created_at]
  )
  return (
    <div className={`w-full px-6 ${className}`}>
      <Info title={t("transactionsId")}>{data.snapshot_id}</Info>
      <Info title={t("transactionsType")}>
        <TransactionType type={data.type} />
      </Info>
      <Info title={t("assetType")}>{data.asset?.name}</Info>
      <From data={data} />
      <To data={data} />
      {data.memo.length && <Info title={t("memo")}>{data.memo}</Info>}
      <Info title={t("time")}>{dateText}</Info>
      {data.trace_id.length && <Info title={t("trace")}>{data.trace_id}</Info>}
    </div>
  )
}

const Info: FC<{ title: string }> = ({ title, children }) => {
  return (
    <div className="flex flex-col gap-1 mt-4 text-sm break-all">
      <p className="text-gray-400">{title}</p>
      {children}
    </div>
  )
}

const From: FC<{ data: SnapshotSchema }> = ({ data }) => {
  const [t] = useTranslation()
  const profile = useProfileValue()
  const { title, sender } = useMemo(() => {
    let sender: string
    let title = t("from")

    switch (data.type) {
      case "deposit":
      case "pending":
        sender = data.sender ?? ""
        break
      case "transfer": {
        const isPositive = bigGt(data.amount, 0)
        if (isPositive) {
          sender = data.opponent?.full_name ?? ""
        } else {
          sender = profile?.full_name ?? ""
        }
        break
      }
      default:
        sender = data.transaction_hash ?? ""
        title = t("transactionHash")
        break
    }
    return { title, sender }
  }, [
    data.amount,
    data.opponent?.full_name,
    data.sender,
    data.transaction_hash,
    data.type,
    profile?.full_name,
    t,
  ])

  return <Info title={title}>{sender}</Info>
}

const To: FC<{ data: SnapshotSchema }> = ({ data }) => {
  const [t] = useTranslation()
  const profile = useProfileValue()
  const { title, receiver } = useMemo(() => {
    let receiver: string
    let title = t("to")

    switch (data.type) {
      case "deposit":
      case "pending":
        receiver = data.transaction_hash ?? ""
        title = t("transactionHash")
        break
      case "transfer": {
        const isPositive = bigGt(data.amount, 0)
        if (!isPositive) {
          receiver = data.opponent?.full_name ?? ""
        } else {
          receiver = profile?.full_name ?? ""
        }
        break
      }
      default:
        receiver = data.receiver ?? ""
        if (data.asset?.tag.length) {
          title = t("address")
        }
        break
    }
    return { title, receiver }
  }, [
    data.amount,
    data.asset?.tag.length,
    data.opponent?.full_name,
    data.receiver,
    data.transaction_hash,
    data.type,
    profile?.full_name,
    t,
  ])

  if (!receiver) return null
  return <Info title={title}>{receiver}</Info>
}

export default SnapshotDetail
