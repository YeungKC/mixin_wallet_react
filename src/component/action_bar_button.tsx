import { FC, HTMLAttributes } from "react"

import Button from "./common/button"

const ActionBarButton: FC<
  { name: string } & HTMLAttributes<HTMLAnchorElement>
> = ({ name, className, onClick }) => {
  return (
    <Button
      to={{}}
      className={`flex-1 bg-gray-100 font-medium text-sm py-2 outline-none ${className}`}
      onClick={onClick}
    >
      {name}
    </Button>
  )
}

export default ActionBarButton
