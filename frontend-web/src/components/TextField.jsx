import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EyeIcon, EyeOffIcon } from './icons'

export default function TextField({ label, labelRight, icon, error, className = '', ...inputProps }) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const isPassword = inputProps.type === 'password'

  return (
    <label className={`block ${className}`}>
      {(label || labelRight) && (
        <span className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm font-semibold text-on-surface">{label}</span>}
          {labelRight}
        </span>
      )}
      <span className="relative flex items-center">
        {icon && <span className="absolute left-3 text-on-surface-variant">{icon}</span>}
        <input
          {...inputProps}
          type={isPassword && visible ? 'text' : inputProps.type}
          className={`w-full rounded border px-3 py-2.5 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary focus:border-2 transition-colors ${
            icon ? 'pl-10' : ''
          } ${isPassword ? 'pr-10' : ''} ${error ? 'border-error' : 'border-outline'} ${
            inputProps.readOnly ? 'bg-surface-container text-on-surface-variant cursor-default' : ''
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? t('textField.hidePassword') : t('textField.showPassword')}
            tabIndex={-1}
            className="absolute right-3 text-on-surface-variant hover:text-on-surface"
          >
            {visible ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
          </button>
        )}
      </span>
      {error && <span className="block text-sm text-error mt-1">{error}</span>}
    </label>
  )
}
