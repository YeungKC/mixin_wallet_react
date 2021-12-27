import { FC, useEffect, useRef } from "react"
import Sheet from "react-modal-sheet"
import {
  useOverlayTriggerState,
  OverlayTriggerState,
} from "@react-stately/overlays"
import {
  useOverlay,
  usePreventScroll,
  useModal,
  OverlayProvider,
} from "@react-aria/overlays"
import { FocusScope } from "@react-aria/focus"
import { useDialog } from "@react-aria/dialog"

export type BottomSheetProps = {
  open: boolean
  onClose: () => void
  snapPoints?: number[]
  label?: string
  disableDrag?: boolean
}

const BottomSheet: FC<BottomSheetProps> = ({
  open,
  onClose,
  snapPoints,
  label,
  disableDrag = true,
  children,
  ...rest
}) => {
  const sheetState = useOverlayTriggerState({})
  useEffect(() => {
    if (open) sheetState.open()
    else sheetState.close()
  }, [sheetState, open])
  return (
    <Sheet
      {...rest}
      isOpen={sheetState.isOpen}
      onClose={onClose}
      snapPoints={snapPoints}
      disableDrag={disableDrag}
      className="container"
    >
      <OverlayProvider>
        <FocusScope contain autoFocus restoreFocus>
          <A11ySheetContent
            state={sheetState}
            onClose={onClose}
            label={label ?? ""}
          >
            {children}
          </A11ySheetContent>
        </FocusScope>
      </OverlayProvider>
    </Sheet>
  )
}

const A11ySheetContent: FC<{
  state: OverlayTriggerState
  onClose: () => void
  label?: string
}> = ({ state, onClose, children }) => {
  const a11yProps = useA11ySheet(state, onClose)

  return (
    <>
      <Sheet.Container
        style={{ outline: "none", boxShadow: "none" }}
        {...a11yProps}
      >
        <Sheet.Content onViewportBoxUpdate={() => undefined}>
          {children}
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop
        onViewportBoxUpdate={() => undefined}
        onTap={onClose}
        style={{ cursor: "auto" }}
      />
    </>
  )
}

const useA11ySheet = (
  state: OverlayTriggerState,
  onClose: () => void,
  label?: string
) => {
  const ref = useRef<HTMLDivElement>(null)

  const { dialogProps } = useDialog(
    { "aria-label": label ?? "Bottom sheet" },
    ref
  )
  const { overlayProps } = useOverlay(
    { onClose: onClose, isOpen: true, isDismissable: true },
    ref
  )

  usePreventScroll()
  const { modalProps } = useModal()

  const result = {
    ref,
    ...overlayProps,
    ...dialogProps,
    ...modalProps,
    // eslint-disable-next-line
  } as any // HACK: fix type conflicts with Framer Motion

  return result
}

export default BottomSheet
