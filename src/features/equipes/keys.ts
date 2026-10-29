// Clés de cache des équipes, à part des hooks pour être importables partout sans dépendance circulaire.
export const equipeKeys = {
  all: ['equipes'] as const,
  detail: (id: number) => [...equipeKeys.all, 'detail', id] as const,
  demandes: (id: number) => [...equipeKeys.detail(id), 'demandes'] as const,
  // Hors de detail(id) : recharger la fiche de l'équipe ne doit pas relire l'espace d'échange.
  messages: (id: number) => [...equipeKeys.all, 'messages', id] as const,
  mesDemandes: ['moi', 'demandes'] as const,
  mesEquipes: ['moi', 'equipes'] as const,
}
