import { View, Text } from 'react-native'
import { Image } from 'expo-image'
import '../nativewindInterop'

const sizeClasses = {
  sm: 'h-9 w-9',
  md: 'h-14 w-14',
  lg: 'h-24 w-24',
}

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-lg',
  lg: 'text-3xl',
}

export default function Avatar({ user, size = 'sm', className = '' }) {
  const initials = `${user?.first_name?.[0] ?? ''}${user?.last_name?.[0] ?? ''}`.toUpperCase()

  if (user?.avatar_url) {
    return (
      <Image
        source={{ uri: user.avatar_url }}
        accessibilityLabel={`${user.first_name} ${user.last_name}`}
        className={`${sizeClasses[size]} rounded-full ${className}`}
        contentFit="cover"
      />
    )
  }

  return (
    <View
      className={`${sizeClasses[size]} items-center justify-center rounded-full bg-surface-container-high dark:bg-surface-container-high-night ${className}`}
    >
      <Text className={`${textSizeClasses[size]} font-semibold text-on-surface-variant dark:text-on-surface-variant-night`}>
        {initials || '?'}
      </Text>
    </View>
  )
}
