import { useEffect, useState } from 'react'
import { DeviceEventEmitter, View, Text } from 'react-native'

export default function ConnectionStatusBanner() {
  const [status, setStatus] = useState('stable')
  const [action, setAction] = useState('cette opération')
  const [restoreNotice, setRestoreNotice] = useState(false)

  useEffect(() => {
    const handleStatus = (event) => {
      const nextStatus = event?.status
      if (nextStatus === 'unstable') {
        setStatus('unstable')
        setAction(event?.action ?? 'cette opération')
        setRestoreNotice(false)
        return
      }
      if (nextStatus === 'stable') {
        setStatus('stable')
        if (event?.action) setAction(event.action)
        setRestoreNotice(true)
        const timeout = setTimeout(() => setRestoreNotice(false), 4000)
        return () => clearTimeout(timeout)
      }
    }

    const subscription = DeviceEventEmitter.addListener('network-status', handleStatus)
    return () => subscription.remove()
  }, [])

  if (status === 'stable' && !restoreNotice) return null

  const isWarning = status !== 'stable'

  return (
    <View
      pointerEvents="none"
      className={`absolute right-4 top-4 z-50 max-w-[320px] rounded-md border px-3 py-2 shadow-lg ${
        isWarning ? 'border-warning bg-warning-container' : 'border-success bg-success-container'
      }`}
    >
      <View className="flex-row items-center gap-2">
        <View className={`h-2.5 w-2.5 rounded-full ${isWarning ? 'bg-warning' : 'bg-success'}`} />
        <Text className={`text-sm font-semibold ${isWarning ? 'text-on-warning-container' : 'text-on-success-container'}`}>
          {restoreNotice
            ? `Connexion rétablie — vous pouvez réessayer ${action}.`
            : status === 'offline'
              ? `Connexion instable / hors ligne pendant ${action} — veuillez patienter.`
              : `Connexion instable pendant ${action} — veuillez patienter.`}
        </Text>
      </View>
    </View>
  )
}
