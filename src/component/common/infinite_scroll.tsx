import { FC, useCallback, useEffect, useRef } from "react"

export interface InfiniteScrollProps {
  defaultPage?: number
  rootMargin?: number
  threshold?: number
  useWindow?: boolean
  disabled?: boolean

  onIntersect?(): void
}

const InfiniteScroll: FC<InfiniteScrollProps> = ({
  rootMargin = 0,
  threshold = 1.0,
  useWindow = true,
  onIntersect,
  children,
  disabled,
}) => {
  const loaderRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback<IntersectionObserverCallback>(
    (entries) => {
      const target = entries[0]
      if (target.isIntersecting) {
        if (onIntersect) {
          onIntersect()
        }
      }
    },
    [onIntersect]
  )

  useEffect(() => {
    if (disabled) return undefined
    const loader = loaderRef.current
    const option: IntersectionObserverInit = {
      root: useWindow ? null : rootRef.current,
      rootMargin: `${rootMargin}px`,
      threshold,
    }
    const observer = new IntersectionObserver(handleObserver, option)
    if (loader) observer.observe(loader)

    return () => {
      if (loader) {
        observer.unobserve(loader)
        observer.disconnect()
      }
    }
  }, [handleObserver, rootMargin, threshold, useWindow, rootRef, disabled])

  return (
    <div ref={rootRef}>
      {children}
      <div ref={loaderRef} />
    </div>
  )
}

export default InfiniteScroll
