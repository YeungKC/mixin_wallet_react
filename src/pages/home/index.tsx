import {
  FC,
  HTMLAttributes,
  lazy,
  memo,
  Suspense,
  useEffect,
  useMemo,
} from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { Cell, Pie, PieChart } from "recharts"

import amplitude from "../../assets/amplitude.svg"
import amplitudeDecrease from "../../assets/amplitude_decrease.svg"
import amplitudeIncrease from "../../assets/amplitude_increase.svg"
import amplitudeNone from "../../assets/amplitude_none.svg"
import search from "../../assets/search.svg"
import setting from "../../assets/setting.svg"
import ActionBarButton from "../../component/action_bar_button"
import AppBar from "../../component/app_bar"
import AssetIcon from "../../component/asset_icon"
import AssetPriceAndChange from "../../component/asset_price_and_change"
import Avatar from "../../component/avatar"
import Button from "../../component/common/button"
import FormatNumber from "../../component/common/format_number"
import IconButton from "../../component/common/icon_button"
import WindowList from "../../component/common/window_list"
import { bitcoin } from "../../constant"
import {
  useProfileCurrencySymbolValue,
  useProfileValue,
} from "../../recoil/profile"
import { assetSortType, useAssets, useUpdateAssets } from "../../service/hook"
import { AssetSchema } from "../../store/database/entity/asset"
import { bigAdd, bigDiv, bigMul, bigSub, toRounding } from "../../util/big"
import { useSetQueryString } from "../../util/router"
import { LoadingPage } from "../loading"

const SearchSheet = lazy(() => import("./search_sheet"))

const Home = () => {
  const { data, isLoading } = useAssets()
  const { mutate, isLoading: updating } = useUpdateAssets()
  useEffect(() => {
    mutate()
  }, [mutate])

  if (isLoading || (updating && !data)) return <LoadingPage />
  if (!data?.length) return <div>error</div>

  return (
    <>
      <div className="container flex flex-col items-center">
        <_Bar />
        <Balance className="mb-6 mt-6" />
        <Chart className="mb-6" />
        <ActionBar className="mb-6" />
        <_List />
      </div>
      <Suspense fallback={null}>
        <SearchSheet />
      </Suspense>
    </>
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

const Balance: FC<HTMLAttributes<HTMLAnchorElement>> = memo(({ className }) => {
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
      return bigDiv(
        balance,
        bitcoinAsset.fiat?.rate ?? 0,
        bitcoinAsset.price_usd
      )
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
})

// tailwind color
const COLORS = ["#FC9E1F", "#FFCA3E", "#5278FF", "#DFE1E5"]
const Chart: FC<HTMLAttributes<HTMLAnchorElement>> = memo(({ className }) => {
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
              key={name}
              name={name}
              percent={value}
              color={COLORS[index]}
            />
          ))}
        </div>
        <div className="flex flex-col gap-y-3">
          {chartData.slice(2).map(({ name, value }, index) => (
            <ChartItem
              key={name}
              name={name}
              percent={value}
              color={COLORS[index + 2]}
            />
          ))}
        </div>
      </div>
    </div>
  )
})

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
      <div className="overflow-hidden truncate">{name}</div>
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

const _List = memo(() => {
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
    <>
      <ListHeader sort={sort} />
      <WindowList
        rowCount={data.length}
        rowHeight={72}
        rowRenderer={({ index, style }) => (
          <ListItem
            key={data[index].asset_id}
            style={style}
            asset={data[index]}
          />
        )}
      />
    </>
  )
})

const ListHeader: FC<{ sort?: typeof assetSortType }> = memo(({ sort }) => {
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

  const nextQuery = useSetQueryString({ sort: next })
  const openSearchSheet = useSetQueryString({ searchSheet: undefined })

  const [t] = useTranslation()
  return (
    <div className="w-full h-10 py-2 px-4 flex">
      <div className="font-semibold flex-1">{t("assets")}</div>
      <IconButton to={{ search: openSearchSheet }} src={search} />
      <Button to={{ search: nextQuery }}>
        <img src={amplitude} className="w-6 h-6" />
        <img src={iconSrc} className="w-[6px] h-[10px]" />
      </Button>
    </div>
  )
})

const ListItem: FC<{ asset: AssetSchema } & HTMLAttributes<HTMLAnchorElement>> =
  memo(({ asset, style }) => {
    const currency = useMemo(
      () => bigMul(asset.balance, asset.price_usd, asset.fiat?.rate ?? 0),
      [asset.balance, asset.price_usd, asset.fiat?.rate]
    )
    const symbol = useProfileCurrencySymbolValue()
    return (
      <Button
        to={`/asset/${asset.asset_id}`}
        className="p-4 flex gap-3"
        style={style}
      >
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

export default Home
