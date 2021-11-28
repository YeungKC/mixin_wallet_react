import { useTranslation } from 'react-i18next'
import Avatar from '../component/avatar'
import { useProfileCurrencySymbolValue, useProfileValue } from '../recoil/profile'
import { useSearchParams } from 'react-router-dom'
import { assetSortType, useAssetResult } from '../service/hook'
import { FC, HTMLAttributes, useMemo } from 'react'
import { AssetSchema } from '../store/database/entity/asset'
import { bitcoin } from '../constant'
import { bigAdd, bigDiv, bigGt, bigLt, bigMul, bigSub, formatCryptocurrency, formatCurrency, toRounding } from '../util/big'
import { Cell, Pie, PieChart } from 'recharts'
import IconButton from '../component/common/icon_button'

import setting from '../assets/setting.svg'
import search from '../assets/search.svg'
import amplitude from '../assets/amplitude.svg'
import amplitudeNone from '../assets/amplitude_none.svg'
import amplitudeIncrease from '../assets/amplitude_increase.svg'
import amplitudeDecrease from '../assets/amplitude_decrease.svg'
import Button from '../component/common/button'
import AssetIcon from '../component/asset_icon'

const Home = () => {
  const [params] = useSearchParams()
  const sortValue = params.get('sort')
  const sort = useMemo(() => {
    if (sortValue === 'amount' || sortValue === 'increase' || sortValue === 'decrease')
      return sortValue
    return undefined
  }, [sortValue])
  return (
    <div className="container flex flex-col items-center">
      <Bar />
      <Balance className="mb-6" />
      <Chart className="mb-8" />
      <ActionBar className="mb-8" />
      <List sort={sort} />
    </div>
  )
}

const Bar = () => {
  const [t] = useTranslation()
  return (
    <div className="w-full h-6 p-4 my-2 flex flex-row items-center mb-5">
      <CurrentUserAvatar />
      <p className="font-semibold">{t('mixinWallet')}</p>
      <IconButton to="/setting" src={setting} className="ml-auto mr-28" />
    </div>
  )
}

const CurrentUserAvatar = () => {
  const profile = useProfileValue()
  return <Avatar user={profile} className="mr-2" />
}


const Balance: FC<HTMLAttributes<HTMLAnchorElement>> = ({ className }) => {
  const { data = [] } = useAssetResult()
  const symbol = useProfileCurrencySymbolValue()
  const bitcoinAsset = useMemo(() => data.find(({ asset_id }) => asset_id === bitcoin), [data])
  const balance = useMemo(
    () => {
      const result = data.reduce(
        (prev, { balance, price_usd, fiat }) => bigAdd(prev, bigMul(balance, price_usd, fiat?.rate ?? 0)),
        '0'
      )
      return formatCurrency(result)
    },
    [data]
  )
  const balanceOfBtc = useMemo(() => {
    let result: string
    if (!bitcoinAsset) {
      result = data.reduce((prev, { balance, price_btc }) => bigAdd(prev, bigMul(balance, price_btc)), '0')
    } else {
      result = bigDiv(balance, bitcoinAsset.fiat!.rate, bitcoinAsset.price_usd)
    }
    return formatCryptocurrency(result)
  }, [bitcoinAsset, balance, data])

  return (
    <div className={`flex flex-col gap-y-1 items-center ${className}`}>
      <div className="flex flex-row">
        <div className="self-start mt-1">{symbol}</div>
        <div className="text-3xl font-semibold">{balance}</div>
      </div>
      <div className="flex flex-col text-xs font-semibold text-gray-400">
        {balanceOfBtc} BTC
      </div>
    </div>
  )
}

const COLORS = ['#FC9E1F', '#FFCA3E', '#5278FF', '#DFE1E5']
const Chart: FC<HTMLAttributes<HTMLAnchorElement>> = ({ className }) => {
  const [t] = useTranslation()

  const { data = [], isLoading } = useAssetResult()
  const simpleData = useMemo(() => data.map(({ symbol, balance, price_usd }) => ({
    name: symbol,
    value: bigMul(balance, price_usd),
  })), [data])
  const totalBalance = useMemo(() => simpleData.reduce((prev, { value }) => bigAdd(prev, value), '0'), [simpleData])

  const topData = useMemo(() => {
    return simpleData.sort((a, b) => Number(b.value) - Number(a.value)).slice(0, 3)
  }, [simpleData])

  const chartData = useMemo(() => {
    const total = topData.reduce((prev, { value }) => bigAdd(prev, value), '0')
    const newChartData = [...topData, {
      name: t('other'),
      value: bigSub(totalBalance, total),
    }]

    const result = newChartData.map(({ name, value }) => ({
      name,
      value: totalBalance !== '0' ? Number(toRounding(bigMul(bigDiv(value, totalBalance), 100), 1)) : 0,
    }))

    let totalPercent = 100
    result.forEach((e, index) => {
      if (index === 3) return e.value = totalPercent
      totalPercent -= e.value
    })

    return result.filter(({ value }) => !!value)
  }, [totalBalance, topData, t])

  if (isLoading) return <div className={`w-16 h-16 ${className}`} />

  return (
    <div className={`flex gap-x-5 ${className}`}>
      <PieChart width={64} height={64}>
        <Pie
          data={chartData}
          innerRadius={14}
          outerRadius={30}
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
          {chartData.slice(0, 2).map(({ name, value }, index) =>
            <ChartItem key={`chart-item-${index}`} name={name} percent={value} color={COLORS[index]} />
          )}
        </div>
        <div className="flex flex-col gap-y-3">
          {chartData.slice(2,).map(({ name, value }, index) =>
            <ChartItem key={`chart-item-${index}`} name={name} percent={value} color={COLORS[index + 2]} />
          )}
        </div>
      </div>
    </div>
  )
}

const ChartItem: FC<{ name: string, percent: number, color: string }> = ({ name, percent, color }) => {
  return (<div className="flex items-center text-xs font-semibold">
    <div className="w-[10px] h-[10px] min-w-[10px] rounded-full mr-2" style={{ background: color }} />
    <div className="overflow-hidden whitespace-nowrap overflow-ellipsis">{name}</div>
    <div className="ml-2">{`${percent}%`}</div>
  </div>)
}

const ActionBar: FC<HTMLAttributes<HTMLDivElement>> = ({ className }) => {
  const [t] = useTranslation()
  return (
    <div className={`w-full flex items-center justify-center mb-4 h-10 px-8 ${className}`}>
      <ActionBarButton name={t('send')} className='rounded-l-lg' />
      <ActionBarButton name={t('receive')} />
      <ActionBarButton name={t('buy')} />
      <ActionBarButton name={t('swap')} className='rounded-r-lg' />
    </div>
  )
}

const ActionBarButton: FC<{ name: string } & HTMLAttributes<HTMLAnchorElement>> = ({ name, className, onClick }) => {
  return <Button
    to={{}}
    className={`flex-1 bg-gray-100 font-medium text-sm py-2 outline-none ${className}`}
    onClick={onClick}
  >
    {name}
  </Button>
}

const List: FC<{ sort?: typeof assetSortType }> = ({ sort }) => {
  const { data = [], } = useAssetResult({ sort: sort })

  return <div className="w-full flex flex-col">
    <ListHeader sort={sort} />
    {data.map((asset, index) => <ListItem key={`list-item-${index}`} asset={asset} />)}
  </div>
}

const ListHeader: FC<{ sort?: typeof assetSortType }> = ({ sort }) => {
  const next = useMemo(() => {
    switch (sort) {
      case 'increase':
        return 'decrease'
      case 'decrease':
        return 'amount'
      case 'amount':
      default:
        return 'increase'
    }
  }, [sort])
  const iconSrc = useMemo(() => {
    switch (sort) {
      case 'increase':
        return amplitudeIncrease
      case 'decrease':
        return amplitudeDecrease
      case 'amount':
      default:
        return amplitudeNone
    }
  }, [sort])
  const [t] = useTranslation()
  return <div className="w-full h-10 py-2 px-4 flex">
    <div className="font-semibold flex-1">{t('assets')}</div>
    <IconButton to={{}} src={search} onClick={() => { }} />
    <Button to={{ search: `?sort=${next}` }} >
      <img src={amplitude} className="w-6 h-6" />
      <img src={iconSrc} className="w-[6px] h-[10px]" />
    </Button>
  </div>
}

const ListItem: FC<{ asset: AssetSchema }> = ({ asset }) => {
  const cryptocurrency = useMemo(() => formatCryptocurrency(asset.balance), [asset.balance])
  const currency = useMemo(() => formatCurrency(bigMul(asset.balance, asset.price_usd, asset.fiat?.rate ?? 0)), [asset.balance, asset.price_usd, asset.fiat?.rate])
  const symbol = useProfileCurrencySymbolValue()
  return <Button to={{}} onClick={() => { }} className="h-[72px] p-4 w-full flex gap-3">
    <AssetIcon asset={asset} className="flex-shrink-0" />
    <div className="flex-grow flex-shrink flex flex-col justify-between overflow-hidden overflow-ellipsis">
      <div className="flex font-semibold text-sm gap-1 whitespace-nowrap">
        <div className="overflow-hidden overflow-ellipsis">
          {cryptocurrency}
        </div>
        {asset.symbol}
      </div>
      <div className="text-xs text-gray-300">{symbol}{currency}</div>
    </div>
    <AssetPrice asset={asset} className="" />
  </Button>
}

const AssetPrice: FC<{ asset: AssetSchema } & HTMLAttributes<HTMLAnchorElement>> = ({ asset, className }) => {
  const symbol = useProfileCurrencySymbolValue()
  const valid = useMemo(() => bigGt(asset.price_usd, 0), [asset.price_usd])

  const isNegative = useMemo(() => bigLt(asset.change_usd, 0), [asset.change_usd])

  const unitPrice = useMemo(() => {
    if (!valid) return 0
    return formatCurrency(bigMul(asset.price_usd, asset.fiat?.rate ?? 0))
  }, [valid, asset.price_usd, asset.fiat?.rate])
  const changeUsd = useMemo(() => toRounding(bigMul(asset.change_usd, 100), 2), [asset.change_usd])


  const [t] = useTranslation()

  if (!valid) return <div className={`text-sm text-gray-300 whitespace-nowrap ${className}`}>{t('none')}</div>

  return (
    <div className={`${isNegative ? "text-red-500" : "text-green-500"} ${className}`}>
      <div className="flex flex-col justify-between text-xs items-end">
        {changeUsd}%
        <div className="text-gray-300">
          {symbol}{unitPrice}
        </div>
      </div>
    </div>
  )
}


export default Home
