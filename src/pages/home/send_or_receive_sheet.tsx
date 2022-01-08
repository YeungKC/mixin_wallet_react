import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { To, useNavigate, useSearchParams } from "react-router-dom"

import AssetItem from "../../component/asset_item"
import BottomSheetSearchHeader from "../../component/bottom_sheet_search_header"
import { BottomSheet } from "../../component/common/modal"
import WindowList from "../../component/common/window_list"
import { useAssets, useSearchAssets } from "../../service/hook"
import { AssetSchema } from "../../store/database/entity/asset"
import { useQueryParams, useSetQueryString } from "../../util/router"
import { LoadingPage } from "../loading"

interface SendOrReceiveSheetProps {
  searchKey: string
  to: (asset: AssetSchema) => To
}

const SendOrReceiveSheet = ({
  searchKey,
  ...props
}: SendOrReceiveSheetProps) => {
  const [params] = useSearchParams()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(params.has(searchKey))
  }, [params, searchKey])

  const navigate = useNavigate()
  const closeSheet = useSetQueryString({ [searchKey]: null })

  const onClose = useCallback(() => {
    navigate({ search: closeSheet })
  }, [navigate, closeSheet])

  return (
    <BottomSheet open={open} onClose={onClose} className="">
      <SendOrReceiveSheetPage {...props} searchKey={searchKey} />
    </BottomSheet>
  )
}

const SendOrReceiveSheetPage = ({ searchKey, to }: SendOrReceiveSheetProps) => {
  const { data: initData } = useAssets()
  const [keyword] = useQueryParams(searchKey)
  const { data: searchData } = useSearchAssets(keyword)
  const scrollElementRef = useRef(null)

  const scrollToIndex = useMemo(
    () => 0,
    // eslint-disable-next-line
    [searchData, initData, keyword]
  )

  const data = searchData || initData

  return (
    <div ref={scrollElementRef} className="overflow-auto h-full">
      <BottomSheetSearchHeader queryKey={searchKey} />

      {!data && !keyword && <LoadingPage showTips={false} />}

      {data && (
        <WindowList
          scrollElement={scrollElementRef.current || undefined}
          scrollToIndex={scrollToIndex}
          listStyle={{ width: "100%" }}
          rowCount={data.length}
          rowHeight={72}
          rowRenderer={({ index, style }) => (
            <AssetItem
              key={data[index].asset_id}
              style={style}
              asset={data[index]}
              to={to}
            />
          )}
        />
      )}
    </div>
  )
}

export default SendOrReceiveSheet
