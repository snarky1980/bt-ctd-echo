import { useMemo, useCallback } from 'react'
import { interfaceTexts } from '../constants/interfaceTexts'

export function useCategory(templatesData, interfaceLanguage) {
  const categoryLabels = useMemo(() => {
    if (!templatesData) return {}
    const labels = { ...(templatesData.metadata?.categoryLabels || {}) }
    ;(templatesData.templates || []).forEach(t => {
      const key = t?.category
      if (!key) return
      if (!labels[key]) labels[key] = { fr: '', en: '' }
      if (t.category_fr && !labels[key].fr) labels[key].fr = t.category_fr
      if (t.category_en && !labels[key].en) labels[key].en = t.category_en
    })
    return labels
  }, [templatesData])

  const categories = useMemo(() => {
    if (!templatesData) return []
    const metaCats = templatesData?.metadata?.categories
    return Array.isArray(metaCats) && metaCats.length
      ? metaCats
      : [...new Set((templatesData.templates || []).map(t => t.category).filter(Boolean))]
  }, [templatesData])

  const getCategoryLabel = useCallback((categoryKey) => {
    if (!categoryKey) {
      return interfaceLanguage === 'fr' ? 'Autre' : 'Other'
    }
    const labels = categoryLabels[categoryKey]
    if (labels) {
      const primary = interfaceLanguage === 'fr' ? labels.fr : labels.en
      if (primary && primary.trim().length > 0) return primary
      const fallback = interfaceLanguage === 'fr' ? labels.en : labels.fr
      if (fallback && fallback.trim().length > 0) return fallback
    }
    const fallbackText = (interfaceTexts?.[interfaceLanguage]?.categories?.[categoryKey]) || categoryKey
    return fallbackText
  }, [categoryLabels, interfaceLanguage])

  const orderedCategories = useMemo(() => {
    if (!categories || !categories.length) return []
    return [...categories].sort((a, b) => {
      const labelA = getCategoryLabel(a) || a
      const labelB = getCategoryLabel(b) || b
      return labelA.localeCompare(labelB, interfaceLanguage === 'fr' ? 'fr' : 'en', { sensitivity: 'base' })
    })
  }, [categories, getCategoryLabel, interfaceLanguage])

  return { categories, orderedCategories, getCategoryLabel }
}
