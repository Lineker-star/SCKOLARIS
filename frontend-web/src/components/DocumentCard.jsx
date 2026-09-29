import { FileIcon, CalendarIcon } from './icons'

export default function DocumentCard({ title, subject, author, date, actions, onClick, coverUrl }) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-4 ${
        onClick ? 'cursor-pointer hover:border-primary transition-colors' : ''
      }`}
    >
      <div className="flex min-w-0 items-center gap-4">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-11 w-11 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary">
            <FileIcon width={22} height={22} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-on-surface truncate">{title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-on-surface-variant">
            {author && <span>{author}</span>}
            {subject && (
              <span className="inline-flex items-center rounded bg-surface-container-high px-2 py-0.5 text-xs font-medium">
                {subject}
              </span>
            )}
            {date && (
              <span className="inline-flex items-center gap-1">
                <CalendarIcon width={14} height={14} />
                {date}
              </span>
            )}
          </div>
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:shrink-0">{actions}</div>}
    </div>
  )
}
