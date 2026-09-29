import { useTranslation } from 'react-i18next'
import { XIcon } from './icons'

export default function Modal({ title, icon, onClose, children }) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/60 p-4">
      <div className="w-full max-w-lg rounded-lg bg-surface-container-lowest shadow-lg">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-on-surface">
            {icon}
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="text-on-surface-variant hover:text-on-surface"
          >
            <XIcon width={20} height={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
