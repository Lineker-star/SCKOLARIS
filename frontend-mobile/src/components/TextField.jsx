import { useState } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { EyeIcon, EyeOffIcon } from './icons'

// Portage de TextField.jsx (web). Différences RN :
// - `type="password"` devient `secureTextEntry` (avec bascule œil ouvert/fermé)
// - `onChange` (event DOM) devient `onChangeText` (chaîne directe) — on
//   garde `onChangeText` comme prop pour rester idiomatique RN plutôt que
//   de simuler un faux event.
export default function TextField({
  label,
  labelRight,
  icon,
  error,
  className = '',
  type,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'none',
  ...inputProps
}) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'

  return (
    <View className={className}>
      {label || labelRight ? (
        <View className="flex-row items-center justify-between mb-1.5">
          {label ? (
            <Text className="text-sm font-semibold text-on-surface dark:text-on-surface-night">{label}</Text>
          ) : null}
          {labelRight}
        </View>
      ) : null}

      <View className="relative flex-row items-center">
        {icon ? <View className="absolute left-3 z-10">{icon}</View> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8a90a0"
          secureTextEntry={isPassword && !visible}
          autoCapitalize={autoCapitalize}
          keyboardType={type === 'email' ? 'email-address' : 'default'}
          className={`w-full rounded border px-3 py-2.5 text-on-surface dark:text-on-surface-night focus:border-2 focus:border-primary dark:focus:border-primary-night ${
            icon ? 'pl-10' : ''
          } ${isPassword ? 'pr-10' : ''} ${
            error ? 'border-error dark:border-error-night' : 'border-outline dark:border-outline-night'
          }`}
          {...inputProps}
        />
        {isPassword && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityLabel={visible ? t('textField.hidePassword') : t('textField.showPassword')}
            className="absolute right-3"
          >
            {visible ? (
              <EyeOffIcon width={18} height={18} className="text-on-surface-variant dark:text-on-surface-variant-night" />
            ) : (
              <EyeIcon width={18} height={18} className="text-on-surface-variant dark:text-on-surface-variant-night" />
            )}
          </Pressable>
        )}
      </View>

      {error ? <Text className="text-sm text-error dark:text-error-night mt-1">{error}</Text> : null}
    </View>
  )
}
