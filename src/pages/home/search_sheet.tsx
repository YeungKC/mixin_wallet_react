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

import AssetIcon from "../../component/asset_icon"
import AssetPriceAndChange from "../../component/asset_price_and_change"
import BottomSheetSearchHeader from "../../component/bottom_sheet_search_header"
import Button from "../../component/common/button"
import { BottomSheet } from "../../component/common/modal"
import WindowList from "../../component/common/window_list"
import { useSearchAssets, useTopAssetsAndUpdate } from "../../service/hook"
import { AssetSchema } from "../../store/database/entity/asset"
import { useQueryParams, useSetQueryString } from "../../util/router"
import { LoadingPage } from "../loading"

const SearchSheet = () => {
  const [params] = useSearchParams()

  const [open, setOpen] = useState(false)
  useEffect(() => {
    setOpen(params.has("searchSheet"))
  }, [params])

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
  const [keyword] = useQueryParams("searchSheet")
  const { data } = useSearchAssets(keyword)
  const scrollElementRef = useRef(null)

  const scrollToIndex = useMemo(
    () => 0,
    // eslint-disable-next-line
    [data, keyword]
  )

  return (
    <div ref={scrollElementRef} className="overflow-auto h-full">
      <BottomSheetSearchHeader queryKey="searchSheet" />
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
      {!data && !keyword && (
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
