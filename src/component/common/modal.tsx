import { Dialog } from "@headlessui/react"
import {
  AnimatePresence,
  AnimationControls,
  motion,
  Target,
  TargetAndTransition,
} from "framer-motion"
import { FC } from "react"

export interface ModalProps {
  open: boolean
  onClose: () => void
  className?: string
  maskClosable?: boolean
  keyboard?: boolean
  overlayClassName?: string
  initial?: Target
  animate?: AnimationControls | TargetAndTransition
  exit?: TargetAndTransition
}

const ENTER_TRANSITION = {
  ease: "easeOut",
  duration: 0.3,
}
const EXIT_TRANSITION = {
  ease: "easeOut",
  duration: 0.25,
}

const Modal: FC<ModalProps> = ({
  open,
  onClose,
  children,
  className,
  maskClosable = true,
  keyboard = true,
  overlayClassName,
  initial,
  animate,
  exit,
}) => (
  <AnimatePresence>
    {open && (
      <Dialog
        open={open}
        className="fixed inset-0 z-10 overflow-hidden"
        onClose={() => {
          if (!keyboard) return
          onClose()
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            transition: ENTER_TRANSITION,
          }}
          exit={{
            opacity: 0,
            transition: EXIT_TRANSITION,
          }}
        >
          {maskClosable ? (
            <Dialog.Overlay
              className={`fixed inset-0 bg-black bg-opacity-10 ${overlayClassName}`}
            />
          ) : (
            <div
              className={`fixed inset-0 bg-black bg-opacity-10 ${overlayClassName}`}
            />
          )}
        </motion.div>
        <div className="flex flex-col justify-center items-center h-screen">
          <motion.div
            initial={
              initial || {
                opacity: 0,
              }
            }
            animate={
              animate
                ? {
                    transition: ENTER_TRANSITION,
                    ...animate,
                  }
                : {
                    opacity: 1,
                    transition: ENTER_TRANSITION,
                  }
            }
            exit={
              exit
                ? { transition: EXIT_TRANSITION, ...exit }
                : {
                    opacity: 0,
                    transition: EXIT_TRANSITION,
                  }
            }
            className={`overflow-hidden bg-white shadow-xl z-20 ${className}`}
          >
            {children}
          </motion.div>
        </div>
      </Dialog>
    )}
  </AnimatePresence>
)

export const BottomSheet: FC<ModalProps> = ({ className, ...props }) => (
  <Modal
    {...props}
    className={`container h-[95%] mt-auto rounded-t-2xl md:mt-0 md:rounded-2xl ${className}`}
    initial={{
      translateY: "100%",
    }}
    animate={{
      translateY: 0,
    }}
    exit={{
      translateY: "100%",
    }}
  />
)

export const DialogModal: FC<ModalProps> = ({ className, ...props }) => (
  <Modal
    {...props}
    initial={{
      opacity: 0,
      scale: 0.9,
    }}
    animate={{
      opacity: 1,
      scale: 1,
    }}
    exit={{
      opacity: 0,
      scale: 0.9,
    }}
    className={`flex flex-col justify-center items-center gap-2 m-6 py-8 px-6 rounded-2xl ${className}`}
  />
)

export default Modal
