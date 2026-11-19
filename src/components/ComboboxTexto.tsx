import { useId, useMemo, useState, type InputHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { inputCls } from './ui'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'list' | 'role'> & {
  value: string
  onChange: (valor: string) => void
  sugestoes: string[]
}

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

// Campo de texto livre com lista de sugestões. Digitar qualquer valor continua permitido.
export function ComboboxTexto({ value, onChange, sugestoes, className = '', onKeyDown, ...rest }: Props) {
  const listaId = useId()
  const [aberto, setAberto] = useState(false)
  const [filtrar, setFiltrar] = useState(false) // só filtra depois que a pessoa digita
  const [ativo, setAtivo] = useState(-1)

  const opcoes = useMemo(() => {
    if (!filtrar || !value.trim()) return sugestoes
    const q = norm(value.trim())
    return sugestoes.filter((s) => norm(s).includes(q))
  }, [sugestoes, value, filtrar])

  const visivel = aberto && opcoes.length > 0

  function escolher(v: string) {
    onChange(v)
    setAberto(false)
    setAtivo(-1)
  }

  return (
    <div className="relative">
      <input
        {...rest}
        role="combobox"
        aria-expanded={visivel}
        aria-controls={listaId}
        aria-autocomplete="list"
        aria-activedescendant={visivel && ativo >= 0 ? `${listaId}-${ativo}` : undefined}
        autoComplete="off"
        className={`${inputCls} pr-10 ${className}`}
        value={value}
        onChange={(e) => { onChange(e.target.value); setFiltrar(true); setAberto(true); setAtivo(-1) }}
        onFocus={() => { setFiltrar(false); setAberto(true) }}
        onClick={() => setAberto(true)}
        onBlur={() => { setAberto(false); setAtivo(-1) }}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (e.key === 'ArrowDown') { e.preventDefault(); setAberto(true); setAtivo((a) => (opcoes.length ? (a + 1) % opcoes.length : -1)) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setAberto(true); setAtivo((a) => (opcoes.length ? (a <= 0 ? opcoes.length - 1 : a - 1) : -1)) }
          else if (e.key === 'Enter' && visivel && ativo >= 0) { e.preventDefault(); escolher(opcoes[ativo]) } // sem item ativo, Enter envia o formulário normalmente
          else if (e.key === 'Escape' && aberto) { e.preventDefault(); setAberto(false) }
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Mostrar sugestões"
        disabled={rest.disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { setFiltrar(false); setAberto((a) => !a) }}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted hover:text-text disabled:opacity-60"
      >
        <ChevronDown className={`size-4 transition-transform ${visivel ? 'rotate-180' : ''}`} aria-hidden />
      </button>
      {visivel && (
        <ul id={listaId} role="listbox" className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-surface-2 py-1 shadow-lg shadow-black/40">
          {opcoes.map((o, i) => (
            <li
              key={o}
              id={`${listaId}-${i}`}
              role="option"
              aria-selected={o === value}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => escolher(o)}
              onMouseEnter={() => setAtivo(i)}
              className={`flex min-h-11 cursor-pointer items-center break-words px-3 py-2 text-text ${i === ativo ? 'bg-bg' : ''} ${o === value ? 'text-primary' : ''}`}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
