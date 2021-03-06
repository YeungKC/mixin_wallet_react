import { FC, memo, ReactNode } from "react"

interface AppBarProps {
  leading?: ReactNode
  title?: ReactNode
  trailing?: ReactNode
}

const AppBar: FC<AppBarProps> = memo(({ leading, title, trailing }) => (
  <>
    <div className="w-full h-6 px-4 py-6 flex flex-row items-center bg-white sticky top-0 z-10">
      {leading && leading}
      <p key={"title"} className="font-semibold">
        {title}
      </p>
      {trailing && <div className="ml-auto mr-28">{trailing}</div>}
    </div>
  </>
))

export default AppBar
