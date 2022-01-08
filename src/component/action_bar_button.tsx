import { FC, HTMLAttributes } from "react"
import { To } from "react-router-dom"

import Button from "./common/button"

const ActionBarButton: FC<
  { name: string; to: To } & HTMLAttributes<HTMLAnchorElement>
> = ({ name, to, className }) => {
  return (
    <Button
      to={to}
      className={`flex-1 bg-gray-100 font-medium text-sm py-2 outline-none ${className}`}
    >
      {name}
    </Button>
  )
}

export default ActionBarButton
