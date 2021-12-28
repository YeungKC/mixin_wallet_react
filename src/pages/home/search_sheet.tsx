import {
  FC,
  HTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"

import search from "../../assets/ic_search_small.svg"
import AssetIcon from "../../component/asset_icon"
import AssetPriceAndChange from "../../component/asset_price_and_change"
import BottomSheet from "../../component/common/bottom_sheet"
import Button from "../../component/common/button"
import WindowList from "../../component/common/window_list"
import { useSearchAssets, useTopAssetsAndUpdate } from "../../service/hook"
import { AssetSchema } from "../../store/database/entity/asset"
import { useSetQueryString } from "../../util/router"
import { LoadingPage } from "../loading"

const SearchSheet = () => {
  const [params] = useSearchParams()
  const open = params.get("searchSheet") !== null

  const navigate = useNavigate()
  const closeSheet = useSetQueryString({ searchSheet: null })

  const onClose = useCallback(() => {
    navigate({ search: closeSheet })
  }, [navigate, closeSheet])

  return (
    <BottomSheet open={open} onClose={onClose} className="">
      <SearchSheetPage />
    </BottomSheet>
  )
}

const SearchSheetPage: FC = () => {
  const [params] = useSearchParams()
  const keyword = params.get("searchSheet")
  const { data } = useSearchAssets(keyword)
  const scrollElementRef = useRef(null)

  const scrollToIndex = useMemo(
    () => 0,
    // eslint-disable-next-line
    [data, keyword]
  )

  return (
    <div ref={scrollElementRef} className="overflow-auto h-full">
      <SearchHeader />
      {data && (
        <WindowList
          key="search"
          scrollElement={scrollElementRef.current || undefined}
          scrollToIndex={scrollToIndex}
          listStyle={{ width: "100%" }}
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
      )}
      {(!data || !keyword) && (
        <InitAssets scrollElement={scrollElementRef.current || undefined} />
      )}
    </div>
  )
}

const InitAssets: FC<{ scrollElement?: Element }> = ({ scrollElement }) => {
  const { data, isLoading } = useTopAssetsAndUpdate()
  const [t] = useTranslation()

  if (isLoading) return <LoadingPage showTips={false} />

  if (!data) return null

  return (
    <>
      <p className="mx-4 mt-2 text-sm">{t("assetTrending")}</p>
      <WindowList
        key={`top-${scrollElement}`}
        scrollElement={scrollElement}
        listStyle={{ width: "100%" }}
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
}

const SearchHeader = () => {
  const [params] = useSearchParams()
  const [keyword, setKeyword] = useState<string | undefined>(
    params.get("searchSheet") || ""
  )
  const navigate = useNavigate()

  const keywordQuery = useSetQueryString({ searchSheet: keyword })

  useEffect(() => {
    const interval = setTimeout(
      () => navigate({ search: keywordQuery }, { replace: true }),
      200
    )
    return () => clearInterval(interval)
  }, [navigate, keywordQuery])

  const closeSheet = useSetQueryString({ searchSheet: null })

  const [t] = useTranslation()
  return (
    <div className="flex gap-2 p-4 sticky top-0 bg-white rounded-t-lg z-10">
      <div className="relative flex-grow">
        <input
          autoFocus
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="bg-gray-100 w-full rounded-full py-2 pr-4 pl-9 h-10"
        />
        <img
          src={search}
          className="absolute left-3 top-0 bottom-0 mt-auto mb-auto"
        />
      </div>

      <Button to={{ search: closeSheet }} className="p-2">
        {t("cancel")}
      </Button>
    </div>
  )
}

const ListItem: FC<
  { asset: AssetSchema } & HTMLAttributes<HTMLButtonElement>
> = ({ asset, style }) => (
  <Button
    to={`/asset/${asset.asset_id}`}
    className="p-4 flex gap-3 relative"
    style={style}
  >
    <AssetIcon
      assetIconUrl={asset.icon_url}
      chainIconUrl={asset.chain?.icon_url}
      className="flex-shrink-0"
    />
    <div className="flex-grow flex flex-col justify-between truncate">
      <p className="font-semibold text-sm">{asset.symbol}</p>
      <p className="text-xs text-gray-400">{asset.name}</p>
    </div>
    <AssetPriceAndChange asset={asset} />
  </Button>
)

export default SearchSheet
