import { createContext, useCallback, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Inbox, Loader2, RefreshCw } from 'lucide-react'

export const inputCls =
  'w-full min-h-11 rounded-lg border border-border bg-bg px-3 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 aria-[invalid=true]:border-danger'
export const iconBtn =
  'inline-flex size-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text'

const variants = {
  primary: 'bg-primary font-medium text-bg hover:bg-primary-hover',
  ghost: 'border border-border text-text hover:bg-surface-2',
  danger: 'bg-danger font-medium text-bg hover:opacity-90',
}
export const btnCls = (v: keyof typeof variants = 'ghost') =>
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[v]}`

type ButtonProps = { variant?: keyof typeof variants; loading?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>
export function Button({ variant = 'ghost', loading = false, disabled, type = 'button', children, ...rest }: ButtonProps) {
  return (
    <button {...rest} type={type} disabled={disabled || loading} className={btnCls(variant)}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

export function Field({ label, htmlFor, error, hint, children }: { label: string; htmlFor: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
    </div>
  )
}

export function Loading() {
  return (
    <div role="status" className="flex items-center gap-2 p-6 text-muted">
      <Loader2 className="size-5 animate-spin" aria-hidden /> Carregando…
    </div>
  )
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-danger/50 bg-danger/10 p-4 text-sm">
      <AlertTriangle className="size-5 shrink-0 text-danger" aria-hidden />
      <p className="min-w-0 flex-1">{message}</p>
      {onRetry && <Button onClick={onRetry}><RefreshCw className="size-4" />Tentar de novo</Button>}
    </div>
  )
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
      <Inbox className="size-8 text-muted" aria-hidden />
      <p className="font-medium">{title}</p>
      {children && <div className="flex flex-wrap justify-center gap-2 text-sm text-muted">{children}</div>}
    </div>
  )
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null)
  const fechar = useRef(onClose)
  fechar.current = onClose
  useEffect(() => {
    panel.current?.focus()
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && fechar.current()
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={panel} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-xl outline-none">
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function ConfirmDialog({ title, message, confirmLabel, busy, onConfirm, onCancel }: { title: string; message: ReactNode; confirmLabel: string; busy: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="text-sm text-muted">{message}</div>
      <div className="mt-5 flex justify-end gap-2">
        <Button onClick={onCancel} disabled={busy}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm} loading={busy}>{confirmLabel}</Button>
      </div>
    </Modal>
  )
}

type Kind = 'ok' | 'erro'
const ToastCtx = createContext<(kind: Kind, text: string) => void>(() => undefined)
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; kind: Kind; text: string }[]>([])
  const push = useCallback((kind: Kind, text: string) => {
    const id = Date.now() + Math.random()
    setItems((s) => [...s, { id, kind, text }])
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 4500)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} className="flex items-start gap-2 rounded-lg border border-border bg-surface-2 p-3 text-sm shadow-lg">
            {t.kind === 'ok' ? <CheckCircle2 className="size-5 shrink-0 text-ok" aria-hidden /> : <AlertTriangle className="size-5 shrink-0 text-danger" aria-hidden />}
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

// A API não informa o total de páginas: "Próxima" fica ativa enquanto a página vier cheia.
export function Pager({ pagina, limite, qtd, onChange }: { pagina: number; limite: number; qtd: number; onChange: (p: number) => void }) {
  return (
    <nav aria-label="Paginação" className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
      <span>Página {pagina} · {qtd} {qtd === 1 ? 'item' : 'itens'} (a API não informa o total)</span>
      <div className="flex gap-2">
        <Button disabled={pagina <= 1} onClick={() => onChange(pagina - 1)}><ChevronLeft className="size-4" />Anterior</Button>
        <Button disabled={qtd < limite} onClick={() => onChange(pagina + 1)}>Próxima<ChevronRight className="size-4" /></Button>
      </div>
    </nav>
  )
}
