import {
  WindowScroller,
  AutoSizer,
  List,
  Index,
  ListRowRenderer,
  OnScrollParams,
} from "react-virtualized"

export interface WindowListProps {
  scrollElement?: Element | null
  rowCount: number
  rowHeight: number | ((info: Index) => number)
  rowRenderer: ListRowRenderer
  onScroll?: (params: OnScrollParams) => void

  listStyle?: React.CSSProperties
  scrollToIndex?: number
}

const WindowList = ({
  scrollElement,
  listStyle,
  rowCount,
  rowHeight,
  rowRenderer,
  onScroll,
  scrollToIndex,
}: WindowListProps) => (
  <WindowScroller scrollElement={scrollElement || undefined}>
    {({ height, isScrolling, registerChild, scrollTop }) => (
      <AutoSizer disableHeight style={{ width: undefined }}>
        {({ width }) => (
          <div ref={registerChild}>
            <List
              autoHeight
              height={height}
              isScrolling={isScrolling}
              scrollTop={scrollTop}
              width={width}
              style={listStyle}
              rowCount={rowCount}
              rowHeight={rowHeight}
              rowRenderer={rowRenderer}
              onScroll={onScroll}
              scrollToIndex={scrollToIndex}
            />
          </div>
        )}
      </AutoSizer>
    )}
  </WindowScroller>
)

export default WindowList
