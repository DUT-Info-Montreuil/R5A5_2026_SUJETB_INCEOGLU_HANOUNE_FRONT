import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/shared/api/client'

// Sert à vérifier que front et back se parlent (/api/health est relayé vers /health du back, cf. vite.config.ts).
export function ApiStatus() {
  const { isSuccess, isError } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiFetch<{ status: string }>('/health'),
    refetchInterval: 15_000,
    retry: false,
  })
  const color = isSuccess ? 'bg-emerald-400' : isError ? 'bg-red-400' : 'bg-slate-500'
  const label = isSuccess ? 'API en ligne' : isError ? 'API hors ligne' : 'API…'
  return (
    <span className="flex items-center gap-2 text-xs text-slate-400">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  )
}
