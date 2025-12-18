// Lightweight bilingual synonyms for better recall in fuzzy search
export const SYNONYMS = {
  // FR <-> EN common domain terms
  devis: ['devis', 'estimation', 'soumission', 'quote', 'estimate', 'quotation'],
  estimation: ['estimation', 'devis', 'quote', 'estimate'],
  soumission: ['soumission', 'devis', 'quote'],
  facture: ['facture', 'facturation', 'invoice', 'billing'],
  paiement: ['paiement', 'payment', 'payer', 'pay'],
  client: ['client', 'cliente', 'clients', 'customer', 'customers', 'user', 'utilisateur', 'usager'],
  projet: ['projet', 'projets', 'project', 'projects', 'gestion', 'management'],
  gestion: ['gestion', 'management', 'project management'],
  technique: ['technique', 'techniques', 'technical', 'tech', 'support'],
  probleme: ['problème', 'probleme', 'incident', 'bug', 'issue', 'problem', 'outage', 'panne'],
  urgent: ['urgent', 'urgence', 'priority', 'prioritaire', 'rush'],
  delai: ['délai', 'delai', 'delais', 'délai(s)', 'deadline', 'due date', 'turnaround'],
  tarif: ['tarif', 'tarifs', 'prix', 'price', 'pricing', 'rate', 'rates'],
  rabais: ['rabais', 'remise', 'escompte', 'discount'],
  traduction: ['traduction', 'translation', 'translate'],
  terminologie: ['terminologie', 'terminology', 'termes', 'glossary'],
  revision: ['révision', 'revision', 'review', 'proofreading'],
  service: ['service', 'services', 'offre', 'offer'],
}

// Normalize string for matching (remove accents, lowercase)
export const normalize = (s = '') => s
  .normalize('NFD')
  .replace(/\p{Diacritic}+/gu, '')
  .toLowerCase()

// Expand a query with synonyms
export function expandQuery(q) {
  if (!q) return ''
  const tokens = normalize(q).split(/\s+/).filter(Boolean)
  const bag = new Set()
  for (const t of tokens) {
    bag.add(t)
    // try direct lookup
    if (SYNONYMS[t]) SYNONYMS[t].forEach(w => bag.add(normalize(w)))
    // try approximate key without accents
    const found = Object.keys(SYNONYMS).find(k => k === t)
    if (!found) {
      // fallback: add close matches by startsWith to avoid explosion
      for (const k of Object.keys(SYNONYMS)) {
        if (k.startsWith(t) || t.startsWith(k)) SYNONYMS[k].forEach(w => bag.add(normalize(w)))
      }
    }
  }
  return Array.from(bag).join(' ')
}
