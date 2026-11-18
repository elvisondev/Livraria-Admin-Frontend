import { useEffect, useRef, useState } from 'react'
import { errMsg } from '../lib'

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data?: T; error?: string; loading: boolean }>({ loading: true })
  const [tick, setTick] = useState(0)
  const ref = useRef(fn)
  ref.current = fn

  useEffect(() => {
    let cancelado = false
    setState((s) => ({ data: s.data, loading: true }))
    ref.current()
      .then((data) => !cancelado && setState({ data, loading: false }))
      .catch((e: unknown) => !cancelado && setState({ loading: false, error: errMsg(e) }))
    return () => {
      cancelado = true
    }
  }, [...deps, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, reload: () => setTick((t) => t + 1) }
}
