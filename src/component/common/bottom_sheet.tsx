import { Dialog } from "@headlessui/react"
import { AnimatePresence, motion } from "framer-motion"
import { FC } from "react"

export type BottomSheetProps = {
  open: boolean
  onClose: () => void
  className?: string
  overlayClassName?: string
}

const ENTER_TRANSITION = {
  ease: "easeOut",
  duration: 0.3,
}
const EXIT_TRANSITION = {
  ease: "easeOut",
  duration: 0.25,
}

const BottomSheet: FC<BottomSheetProps> = ({
  open,
  onClose,
  children,
  className,
  overlayClassName,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          className="fixed inset-0 z-10 overflow-hidden"
          onClose={onClose}
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
            <Dialog.Overlay
              className={`fixed inset-0 bg-black bg-opacity-10 ${overlayClassName}`}
            />
          </motion.div>
          <div className="flex flex-col justify-end md:justify-center items-center h-screen">
            <motion.div
              initial={{
                translateY: "100%",
              }}
              animate={{
                translateY: 0,
                transition: ENTER_TRANSITION,
              }}
              exit={{
                translateY: "100%",
                transition: EXIT_TRANSITION,
              }}
              className={`container overflow-hidden bg-white shadow-xl rounded-t-2xl md:rounded-2xl h-[95%] ${className}`}
            >
              {children}
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

export default BottomSheet
