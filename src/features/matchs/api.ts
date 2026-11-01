import { apiFetch } from '@/shared/api/client'
import type { Match } from './types'

// Réservé à l'administrateur, tournoi en cours, deux équipes connues, pas encore de vainqueur (B-13 à B-15).
export const matchsApi = {
  resultat: (id: number, vainqueurId: number) =>
    apiFetch<Match>(`/matchs/${id}/resultat`, { method: 'PATCH', body: { vainqueurId } }),
  forfait: (id: number, equipeForfaitId: number) =>
    apiFetch<Match>(`/matchs/${id}/forfait`, { method: 'PATCH', body: { equipeForfaitId } }),
}
