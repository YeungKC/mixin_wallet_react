import { FC } from 'react'
import { To } from 'react-router'
import Button, { ButtonProps } from './button'

const IconButton: FC<typeof ButtonProps & { src: string }> = (props) => {
    return <Button {...props}>
        <img src={props.src} className="w-6 h-6" />
    </Button>
}

export default IconButton