import { FC } from "react"
import { Link, LinkProps } from "react-router-dom"

export declare const ButtonProps: (LinkProps &
  React.RefAttributes<HTMLAnchorElement>) &
  React.RefAttributes<HTMLButtonElement>
const Button: FC<typeof ButtonProps> = (props) => {
  return (
    <Link
      {...props}
      to={props.to}
      className={`flex items-center justify-center ${props.className}`}
    >
      {props.children}
    </Link>
  )
}

export default Button
