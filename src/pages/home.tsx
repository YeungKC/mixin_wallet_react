import { FC, HTMLAttributes, useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { Cell, Pie, PieChart } from "recharts"

import amplitude from "../assets/amplitude.svg"
import amplitudeDecrease from "../assets/amplitude_decrease.svg"
import amplitudeIncrease from "../assets/amplitude_increase.svg"
import amplitudeNone from "../assets/amplitude_none.svg"
import search from "../assets/search.svg"
import setting from "../assets/setting.svg"
import ActionBarButton from "../component/action_bar_button"
import AppBar from "../component/app_bar"
import AssetIcon from "../component/asset_icon"
import Avatar from "../component/avatar"
import Button from "../component/common/button"
import FormatNumber from "../component/common/format_number"
import IconButton from "../component/common/icon_button"
import { bitcoin } from "../constant"
import {
  useProfileCurrencySymbolValue,
  useProfileValue,
} from "../recoil/profile"
import { assetSortType, useAssets, useUpdateAssets } from "../service/hook"
import { AssetSchema } from "../store/database/entity/asset"
import {
  bigAdd,
  bigDiv,
  bigGt,
  bigLt,
  bigMul,
  bigSub,
  toRounding,
} from "../util/big"
import { LoadingPage } from "./loading"

const Home = () => {
  const { data, isLoading } = useAssets()
  const { mutate, isLoading: updating } = useUpdateAssets()
  useEffect(() => {
    mutate()
  }, [mutate])

  if (isLoading || (updating && !data)) return <LoadingPage />
  if (!data?.length) return <div>error</div>

  return (
    <div className="container flex flex-col items-center">
      <_Bar />
      <Balance className="mb-6 mt-6" />
      <Chart className="mb-6" />
      <ActionBar className="mb-6" />
      <List />
    </div>
  )
}

const _Bar = () => {
  const [t] = useTranslation()
  return (
    <AppBar
      leading={<CurrentUserAvatar />}
      title={<>{t("mixinWallet")}</>}
      trailing={<IconButton to="/setting" src={setting} />}
    />
  )
}

const CurrentUserAvatar = () => {
  const profile = useProfileValue()
  return <Avatar user={profile} className="mr-2" />
}

const Balance: FC<HTMLAttributes<HTMLAnchorElement>> = ({ className }) => {
  const { data = [] } = useAssets()
  const symbol = useProfileCurrencySymbolValue()
  const bitcoinAsset = useMemo(
    () => data.find(({ asset_id }) => asset_id === bitcoin),
    [data]
  )
  const balance = useMemo(
    () =>
      data.reduce(
        (prev, { balance, price_usd, fiat }) =>
          bigAdd(prev, bigMul(balance, price_usd, fiat?.rate ?? 0)),
        "0"
      ),
    [data]
  )
  const balanceOfBtc = useMemo(() => {
    if (!bitcoinAsset) {
      return data.reduce(
        (prev, { balance, price_btc }) =>
          bigAdd(prev, bigMul(balance, price_btc)),
        "0"
      )
    } else {
      return bigDiv(balance, bitcoinAsset.fiat!.rate, bitcoinAsset.price_usd)
    }
  }, [bitcoinAsset, balance, data])

  return (
    <div className={`flex flex-col gap-y-1 items-center ${className}`}>
      <div className="flex flex-row justify-center items-center flex-wrap">
        <div className="self-start mt-1">{symbol}</div>
        <FormatNumber
          className="text-2xl font-semibold break-all text-center"
          value={balance}
          precision={"fiat"}
        />
      </div>
      <FormatNumber
        className="flex flex-col text-xs font-semibold text-gray-400"
        value={balanceOfBtc}
        precision={"crypto"}
        trailing=" BTC"
      />
    </div>
  )
}

// tailwind color
const COLORS = ["#FC9E1F", "#FFCA3E", "#5278FF", "#DFE1E5"]
const Chart: FC<HTMLAttributes<HTMLAnchorElement>> = ({ className }) => {
  const [t] = useTranslation()

  const { data = [], isLoading } = useAssets()
  const simpleData = useMemo(
    () =>
      data.map(({ symbol, balance, price_usd }) => ({
        name: symbol,
        value: bigMul(balance, price_usd),
      })),
    [data]
  )
  const totalBalance = useMemo(
    () => simpleData.reduce((prev, { value }) => bigAdd(prev, value), "0"),
    [simpleData]
  )

  const topData = useMemo(() => {
    return simpleData
      .sort((a, b) => Number(b.value) - Number(a.value))
      .slice(0, 3)
  }, [simpleData])

  const chartData = useMemo(() => {
    const total = topData.reduce((prev, { value }) => bigAdd(prev, value), "0")
    const newChartData = [
      ...topData,
      {
        name: t("other"),
        value: bigSub(totalBalance, total),
      },
    ]

    const result = newChartData.map(({ name, value }) => ({
      name,
      value:
        totalBalance !== "0"
          ? Number(toRounding(bigMul(bigDiv(value, totalBalance), 100), 1))
          : 0,
    }))

    let totalPercent = 100
    result.forEach((e, index) => {
      if (index === 3) return (e.value = Number(toRounding(totalPercent, 1)))
      totalPercent -= e.value
    })

    return result.filter(({ value }) => !!value)
  }, [totalBalance, topData, t])

  if (isLoading) return <div className={`w-16 h-16 ${className}`} />

  return (
    <div className={`flex gap-x-5 ${className}`}>
      <PieChart width={56} height={56}>
        <Pie
          data={chartData}
          innerRadius={14}
          outerRadius={28}
          fill="#8884d8"
          paddingAngle={0}
          startAngle={90}
          endAngle={-270}
          minAngle={10}
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
      <div className="flex gap-x-4 items-center">
        <div className="flex flex-col gap-y-3">
          {chartData.slice(0, 2).map(({ name, value }, index) => (
            <ChartItem
              key={`chart-item-${index}`}
              name={name}
              percent={value}
              color={COLORS[index]}
            />
          ))}
        </div>
        <div className="flex flex-col gap-y-3">
          {chartData.slice(2).map(({ name, value }, index) => (
            <ChartItem
              key={`chart-item-${index}`}
              name={name}
              percent={value}
              color={COLORS[index + 2]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const ChartItem: FC<{ name: string; percent: number; color: string }> = ({
  name,
  percent,
  color,
}) => {
  return (
    <div className="flex items-center text-xs font-semibold">
      <div
        className="w-[10px] h-[10px] min-w-[10px] rounded-full mr-2"
        style={{ background: color }}
      />
      <div className="overflow-hidden whitespace-nowrap overflow-ellipsis">
        {name}
      </div>
      <div className="ml-2">{`${percent}%`}</div>
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
      <ActionBarButton name={t("buy")} />
      <ActionBarButton name={t("swap")} className="rounded-r-lg" />
    </div>
  )
}

const List: FC = () => {
  const [params] = useSearchParams()
  const sortValue = params.get("sort")
  const sort = useMemo(() => {
    if (
      sortValue === "amount" ||
      sortValue === "increase" ||
      sortValue === "decrease"
    )
      return sortValue
    return undefined
  }, [sortValue])

  const { data = [] } = useAssets({ sort: sort })

  return (
    <div className="w-full flex flex-col">
      <ListHeader sort={sort} />
      {data.map((asset, index) => (
        <ListItem key={`list-item-${index}`} asset={asset} />
      ))}
    </div>
  )
}

const ListHeader: FC<{ sort?: typeof assetSortType }> = ({ sort }) => {
  const next = useMemo(() => {
    switch (sort) {
      case "increase":
        return "decrease"
      case "decrease":
        return "amount"
      case "amount":
      default:
        return "increase"
    }
  }, [sort])
  const iconSrc = useMemo(() => {
    switch (sort) {
      case "increase":
        return amplitudeIncrease
      case "decrease":
        return amplitudeDecrease
      case "amount":
      default:
        return amplitudeNone
    }
  }, [sort])
  const [t] = useTranslation()
  return (
    <div className="w-full h-10 py-2 px-4 flex">
      <div className="font-semibold flex-1">{t("assets")}</div>
      <IconButton to={{}} src={search} onClick={() => {}} />
      <Button to={{ search: `?sort=${next}` }}>
        <img src={amplitude} className="w-6 h-6" />
        <img src={iconSrc} className="w-[6px] h-[10px]" />
      </Button>
    </div>
  )
}

const ListItem: FC<{ asset: AssetSchema }> = ({ asset }) => {
  const currency = useMemo(
    () => bigMul(asset.balance, asset.price_usd, asset.fiat?.rate ?? 0),
    [asset.balance, asset.price_usd, asset.fiat?.rate]
  )
  const symbol = useProfileCurrencySymbolValue()
  return (
    <Button
      to={`/asset/${asset.asset_id}`}
      className="h-[72px] p-4 w-full flex gap-3"
    >
      <AssetIcon
        assetIconUrl={asset.icon_url}
        chainIconUrl={asset.chain?.icon_url}
        className="flex-shrink-0"
      />
      <div className="flex-grow flex flex-col justify-between overflow-hidden overflow-ellipsis">
        <div className="flex font-semibold text-sm gap-1 whitespace-nowrap">
          <FormatNumber
            className="overflow-hidden overflow-ellipsis"
            value={asset.balance}
            precision={"crypto"}
          />
          {asset.symbol}
        </div>
        <FormatNumber
          className="text-xs text-gray-300"
          value={currency}
          precision={"fiat"}
          leading={symbol}
        />
      </div>
      <AssetPrice asset={asset} className="" />
    </Button>
  )
}

const AssetPrice: FC<
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
      <div className={`text-sm text-gray-300 whitespace-nowrap ${className}`}>
        {t("none")}
      </div>
    )

  return (
    <div
      className={`${
        isNegative ? "text-red-500" : "text-green-500"
      } ${className}`}
    >
      <div className="flex flex-col justify-between text-xs items-end">
        <FormatNumber value={changeUsd} precision={2} trailing="%" />
        <FormatNumber
          className="text-gray-300"
          value={unitPrice}
          precision={2}
          leading={symbol}
        />
      </div>
    </div>
  )
}

export default Home
