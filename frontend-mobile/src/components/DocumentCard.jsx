import { View, Text, Image, Pressable } from 'react-native'
import { FileIcon, CalendarIcon } from './icons'

// Portage de DocumentCard.jsx (web). onClick → onPress (Pressable), avec
// un léger effet d'opacité au toucher en remplacement du hover/border web.
export default function DocumentCard({ title, subject, author, date, actions, onPress, coverUrl }) {
  const Wrapper = onPress ? Pressable : View

  return (
    <Wrapper
      onPress={onPress}
      className="gap-3 rounded-lg border border-outline-variant dark:border-outline-variant-night bg-surface-container-lowest dark:bg-surface-container-lowest-night px-4 py-4 active:opacity-70"
    >
      <View className="flex-row items-center gap-4">
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} className="h-11 w-11 rounded-lg" />
        ) : (
          <View className="h-11 w-11 items-center justify-center rounded-lg bg-surface-container dark:bg-surface-container-night">
            <FileIcon width={22} height={22} className="text-primary dark:text-primary-night" />
          </View>
        )}
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="font-semibold text-on-surface dark:text-on-surface-night">
            {title}
          </Text>
          <View className="mt-1 flex-row flex-wrap items-center gap-x-3 gap-y-1">
            {author ? (
              <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">{author}</Text>
            ) : null}
            {subject ? (
              <View className="rounded bg-surface-container-high dark:bg-surface-container-high-night px-2 py-0.5">
                <Text className="text-xs font-medium text-on-surface-variant dark:text-on-surface-variant-night">
                  {subject}
                </Text>
              </View>
            ) : null}
            {date ? (
              <View className="flex-row items-center gap-1">
                <CalendarIcon width={14} height={14} className="text-on-surface-variant dark:text-on-surface-variant-night" />
                <Text className="text-sm text-on-surface-variant dark:text-on-surface-variant-night">{date}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
      {actions ? <View className="flex-row flex-wrap items-center gap-2">{actions}</View> : null}
    </Wrapper>
  )
}
