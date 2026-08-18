import { useSyncExternalStore } from 'react'
import { onlineManager } from '@tanstack/react-query'

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline(),
    () => true,
  )
}
