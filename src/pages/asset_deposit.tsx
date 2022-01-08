const QRCode = require("qrcode.react")

import { Dialog } from "@headlessui/react"
import Clipboard from "clipboard"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { toast } from "react-toastify"

import copy from "../assets/copy.svg"
import AppBar from "../component/app_bar"
import AssetIcon from "../component/asset_icon"
import BackButton from "../component/common/back_button"
import Button from "../component/common/button"
import { DialogModal } from "../component/common/modal"
import { bitcoin, eos, ethereum, tron } from "../constant"
import { useAsset, useUpdateAsset } from "../service/hook"
import { AssetSchema } from "../store/database/entity/asset"
import { bigGt } from "../util/big"
import { LoadingPage } from "./loading"

const AssetDeposit = () => {
  const { assetId } = useParams()
  const { data, isLoading } = useAsset(assetId ?? "")
  const { mutate, isLoading: updating } = useUpdateAsset()
  useEffect(() => {
    mutate(assetId ?? "")
  }, [mutate, assetId])

  const [t] = useTranslation()

  const [openMemoDialog, setOpenMemoDialog] = useState(false)

  useEffect(() => {
    if (!data?.tag) return
    setOpenMemoDialog(true)
  }, [data?.tag])

  if (isLoading || (updating && !data)) {
    return <LoadingPage />
  }

  if (!data) {
    return <div>Asset not found</div>
  }

  const closeModal = () => setOpenMemoDialog(false)

  return (
    <div className="container flex flex-col items-center">
      <AppBar
        leading={<BackButton />}
        title={`${t("deposit")} ${data.symbol}`}
      />
      {data.tag && <Memo data={data} className="mt-4" />}
      <Address data={data} className="mt-4" showDepositNotice={!!data.tag} />
      <Tip data={data} className="mt-9" />
      <MemoDialog
        open={openMemoDialog}
        onClose={closeModal}
        symbol={data.symbol}
      />
    </div>
  )
}

const Address = ({
  data,
  className,
  showDepositNotice = false,
}: {
  data: AssetSchema
  className?: string
  showDepositNotice?: boolean
}) => {
  useEffect(() => {
    new Clipboard("#addressButton")
  }, [])
  const [t] = useTranslation()
  return (
    <div
      className={`w-full px-5 flex flex-col gap-1 items-start break-all ${className}`}
    >
      <p className=" text-gray-400 text-sm">{t("address")}</p>
      <div className="flex items-start w-full justify-between">
        <p className="font-semibold">{data.destination}</p>
        <Button
          to={{}}
          id="addressButton"
          data-clipboard-text={data.destination}
          className="flex-shrink-0"
          onClick={() => toast(t("copyToClipboard"))}
        >
          <img src={copy} loading="lazy" className="h-6 w-6" />
        </Button>
      </div>
      {showDepositNotice && (
        <p className="text-xs text-red-400">
          {t("depositNotice", { value: data.symbol })}
        </p>
      )}
      <div className="self-center relative mt-4">
        <div className="w-40 h-40">
          <QRCode value={data.destination} size={160} level="H" />
        </div>
        <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center">
          <AssetIcon
            assetIconUrl={data.icon_url}
            chainIconUrl={data.chain?.icon_url}
          />
        </div>
      </div>
    </div>
  )
}

const Memo = ({
  data,
  className,
}: {
  data: AssetSchema
  className?: string
}) => {
  useEffect(() => {
    new Clipboard("#memoButton")
  }, [])
  const [t] = useTranslation()
  return (
    <div
      className={`w-full px-5 flex flex-col gap-1 items-start break-all ${className}`}
    >
      <p className=" text-gray-400 text-sm">{t("memo")}</p>
      <div className="flex break-all items-start w-full justify-between">
        <p className="font-semibold">{data.tag}</p>
        <Button
          to={{}}
          id="memoButton"
          data-clipboard-text={data.tag}
          className="flex-shrink-0"
          onClick={() => toast(t("copyToClipboard"))}
        >
          <img src={copy} loading="lazy" className="h-6 w-6" />
        </Button>
      </div>
      <p className="text-xs text-red-400">{t("depositMemoNotice")}</p>
      <div className="self-center relative mt-4">
        <div className="w-40 h-40">
          <QRCode value={data.tag} size={160} level="H" />
        </div>
        <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-center items-center">
          <AssetIcon
            assetIconUrl={data.icon_url}
            chainIconUrl={data.chain?.icon_url}
          />
        </div>
      </div>
    </div>
  )
}

const Tip = ({
  data,
  className,
}: {
  data: AssetSchema
  className?: string
}) => {
  const [t] = useTranslation()

  const tips = useMemo(() => {
    switch (data.asset_id) {
      case bitcoin:
        return [t("depositTipBtc")]
      case ethereum:
        return [t("depositTipEth")]
      case eos:
        return [t("depositTipEos")]
      case tron:
        return [t("depositTipTron"), t("depositTipNotSupportContract")]
      default:
        return [t("depositTip", { value: data.symbol })]
    }
  }, [t, data.asset_id, data.symbol])

  const needShowReserve = useMemo(
    () => bigGt(data.reserve ?? 0, 0),
    [data.reserve]
  )

  return (
    <div className={`w-full px-5 ${className}`}>
      <ul className=" list-disc list-inside gap-1 p-2 bg-gray-100 rounded-lg text-sm text-gray-400 font-semibold">
        {tips.map((e) => (
          <li key={e}>{e}</li>
        ))}
        <HighlightedLi
          text={t("depositConfirmation", { value: data.confirmations })}
          highlight={`${data.confirmations}`}
          highlightClassName="text-black"
        />
        {needShowReserve && (
          <HighlightedLi
            text={t("depositReserve", {
              value: `${data.reserve} ${data.symbol}`,
            })}
            highlight={`${data.reserve} ${data.symbol}`}
            highlightClassName="text-black"
          />
        )}
      </ul>
    </div>
  )
}

const HighlightedLi = ({
  text,
  highlight,
  highlightClassName,
}: {
  text: string
  highlight: string
  highlightClassName: string
}) => {
  const parts = text.split(new RegExp(`(${highlight})`, "gi"))
  return (
    <li>
      {parts.map((part) => (
        <span
          key={part}
          className={
            part.toLowerCase() === highlight.toLowerCase()
              ? highlightClassName
              : ""
          }
        >
          {part}
        </span>
      ))}
    </li>
  )
}

const MemoDialog = ({
  open,
  onClose,
  symbol,
}: {
  open: boolean
  onClose: () => void
  symbol?: string
}) => {
  const [t] = useTranslation()
  return (
    <DialogModal
      open={open}
      onClose={onClose}
      maskClosable={false}
      keyboard={false}
    >
      <Dialog.Title className="text-lg font-medium">{t("notice")}</Dialog.Title>
      <Dialog.Description className="text-sm text-center text-red-400">
        {t("depositNotice", { value: symbol })}
      </Dialog.Description>
      <Button
        to={{}}
        onClick={onClose}
        className="mt-6 justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 rounded-md outline-none"
      >
        {t("ok")}
      </Button>
    </DialogModal>
  )
}

export default AssetDeposit
