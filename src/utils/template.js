import { LANGUAGE_SUFFIXES, normalizeVarKey } from './variables'
import canonicalTemplatesRaw from '../../complete_email_templates.json'

const hasText = (value) => typeof value === 'string' && value.trim().length > 0

const normalizeVariableEntry = (entry = {}) => {
  const textValue = (value) => (typeof value === 'string' ? value : '')
  const normalized = { ...entry }
  const desc = entry?.description || {}
  normalized.description = {
    fr: textValue(desc.fr),
    en: textValue(desc.en)
  }
  const example = entry?.example
  if (example && typeof example === 'object') {
    normalized.example = {
      fr: textValue(example.fr),
      en: textValue(example.en)
    }
  } else if (typeof example === 'string') {
    normalized.example = { fr: example, en: example }
  } else {
    normalized.example = { fr: '', en: '' }
  }
  normalized.format = entry?.format || 'text'
  if (entry?.examples) {
    normalized.examples = entry.examples
  }
  return normalized
}

const normalizeVariableLibrary = (library = {}) => {
  const normalized = {}
  Object.entries(library || {}).forEach(([key, value]) => {
    normalized[key] = normalizeVariableEntry(value || {})
  })
  return normalized
}

const mergeVariableLibraries = (primaryVars = {}, fallbackVars = {}) => {
  const merged = {}
  const keys = new Set([
    ...Object.keys(fallbackVars || {}),
    ...Object.keys(primaryVars || {})
  ])
  keys.forEach((key) => {
    const primaryEntry = primaryVars[key]
    const fallbackEntry = fallbackVars[key]
    if (!primaryEntry && !fallbackEntry) return
    const combined = {
      format: primaryEntry?.format || fallbackEntry?.format || 'text',
      description: {
        fr: hasText(primaryEntry?.description?.fr)
          ? primaryEntry.description.fr
          : (fallbackEntry?.description?.fr || ''),
        en: hasText(primaryEntry?.description?.en)
          ? primaryEntry.description.en
          : (fallbackEntry?.description?.en || '')
      },
      example: {
        fr: hasText(primaryEntry?.example?.fr)
          ? primaryEntry.example.fr
          : (fallbackEntry?.example?.fr || ''),
        en: hasText(primaryEntry?.example?.en)
          ? primaryEntry.example.en
          : (fallbackEntry?.example?.en || '')
      }
    }
    const examples = primaryEntry?.examples || fallbackEntry?.examples
    if (examples) combined.examples = examples
    merged[key] = combined
  })
  return merged
}

export const mergeTemplateDatasets = (primary = {}, fallback = null) => {
  const normalizedPrimaryVars = normalizeVariableLibrary(primary?.variables || {})
  if (!fallback) {
    return {
      ...primary,
      variables: normalizedPrimaryVars
    }
  }
  const normalizedFallbackVars = normalizeVariableLibrary(fallback?.variables || {})
  const merged = {
    ...(fallback || {}),
    ...(primary || {})
  }
  merged.metadata = {
    ...(fallback?.metadata || {}),
    ...(primary?.metadata || {})
  }
  merged.templates = (Array.isArray(primary?.templates) && primary.templates.length)
    ? primary.templates
    : (fallback?.templates || [])
  merged.variables = mergeVariableLibraries(normalizedPrimaryVars, normalizedFallbackVars)
  return merged
}

export const CANONICAL_TEMPLATES = mergeTemplateDatasets(canonicalTemplatesRaw, null)

export const buildInitialVariables = (template, templatesData, langOverride) => {
  const seed = {}
  if (!template?.variables || !Array.isArray(template.variables)) return seed
  template.variables.forEach((baseName) => {
    const variants = new Set([baseName])
    LANGUAGE_SUFFIXES.forEach((suffix) => variants.add(`${baseName}_${suffix}`))
    variants.forEach((key) => {
      // For base (unsuffixed) variable prefer templateLanguage-specific default
      if (key === baseName) {
        const info = resolveVariableInfo(templatesData, baseName)
        if (info) {
          const lang = (langOverride || 'fr').toLowerCase()
          // Support object example { fr, en }
          if (info.example && typeof info.example === 'object') {
            seed[key] = info.example[lang] ?? info.example.fr ?? info.example.en ?? ''
            return
          }
          // Support examples map
          if (info.examples && info.examples[lang]) {
            seed[key] = info.examples[lang]
            return
          }
        }
      }
      seed[key] = guessSampleValue(templatesData, key)
    })
  })
  return seed
}

export const resolveVariableInfo = (templatesData, name = '') => {
  if (!templatesData?.variables || !name) return null
  if (templatesData.variables[name]) return templatesData.variables[name]
  const base = name.replace(/_(FR|EN)$/i, '')
  return templatesData.variables[base] || null
}

export const guessSampleValue = (templatesData, name = '') => {
  const info = resolveVariableInfo(templatesData, name)
  const suffixMatch = (name || '').match(/_(FR|EN)$/i)
  const suffix = suffixMatch ? suffixMatch[1].toUpperCase() : null

  // Prefer per-language examples when available.
  // Support legacy string example and new object shape { fr, en }.
  const rawExample = (() => {
    const exObj = info?.example && typeof info.example === 'object' && (info.example.fr || info.example.en) ? info.example : null
    const getFromExampleObject = (lang) => {
      if (!exObj) return null
      if (lang === 'EN') return exObj.en ?? exObj.fr ?? ''
      if (lang === 'FR') return exObj.fr ?? exObj.en ?? ''
      return exObj.fr ?? exObj.en ?? ''
    }
    if (suffix === 'EN') return info?.examples?.en ?? getFromExampleObject('EN') ?? (typeof info?.example === 'string' ? info.example : '') ?? ''
    if (suffix === 'FR') return info?.examples?.fr ?? getFromExampleObject('FR') ?? (typeof info?.example === 'string' ? info.example : '') ?? ''
    // Base (no suffix): prefer FR then EN
    return (info?.examples?.fr
      ?? info?.examples?.en
      ?? getFromExampleObject('FR')
      ?? (typeof info?.example === 'string' ? info.example : '')
      ?? '')
  })()
  const normalized = (name || '').toLowerCase()

  // Heuristic: determine intended kind
  const kind = (() => {
    if (info?.format) return info.format
    if (/date|jour|day/.test(normalized)) return 'date'
    if (/heure|time/.test(normalized)) return 'time'
    if (/(montant|total|amount|price|cost|refund|credit|deposit|payment)/.test(normalized)) return 'currency'
    if (/(nombre|count|num|quant)/.test(normalized)) return 'number'
    return 'text'
  })()

  // Map common FR placeholder to EN
  const mapFrPlaceholderToEn = (s = '') => {
    const trimmed = String(s).trim()
    if (!trimmed) return ''
    if (/^valeur\s+à\s+d[ée]finir$/i.test(trimmed)) return 'To be defined'
    return trimmed
  }

  // Build EN-friendly example if needed
  const toEnSample = (example, k) => {
    const val = String(example || '').trim()
    if (!val) {
      // Fallbacks by kind
      if (k === 'date') return '2025-07-15'
      if (k === 'time') return '09:00'
      if (k === 'currency') return '$1,250.00'
      if (k === 'number') return '0'
      return 'Example'
    }
    // URLs and emails are language-agnostic
    if (/^https?:\/\//i.test(val) || /@/.test(val)) return val
    // Common FR placeholder phrase
    const mapped = mapFrPlaceholderToEn(val)
    if (mapped !== val) return mapped
    if (k === 'currency') {
      // Convert FR-styled currency like "3 425,50 $" -> "$3,425.50"
      const m = val.match(/([0-9][0-9\s\u00A0.,]*)\s*\$/)
      if (m) {
        const digits = m[1]
          .replace(/\u00A0|\s/g, '') // remove thin/normal spaces
          .replace(/\.(?=\d{3})/g, '') // remove thousand dots if any
          .replace(/,(\d{2})$/, '.$1') // decimal comma -> dot
        // Insert commas for thousands
        const parts = digits.split('.')
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        return `$${parts.join('.')}`
      }
      // If it already looks EN-ish
      if (/^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/.test(val)) return val.startsWith('$') ? val : `$${val}`
      return '$1,250.00'
    }
    if (k === 'date') {
      return val
    }
    if (k === 'time') return '09:00'
    return val
  }

  // Build FR-friendly example fallback
  const toFrSample = (example, k) => {
    const val = String(example || '').trim()
    if (!val) {
      if (k === 'date') return new Date().toISOString().slice(0, 10)
      if (k === 'time') return '09:00'
      if (k === 'currency') return '2 890,00 $'
      if (k === 'number') return '0'
      return '…'
    }
    return val
  }

  if (suffix === 'EN') {
    return toEnSample(rawExample, kind)
  }
  if (suffix === 'FR') {
    return toFrSample(rawExample, kind)
  }

  // Base (no suffix): keep as dataset provides or generic by kind
  if (rawExample) return rawExample
  switch (kind) {
    case 'date':
      return new Date().toISOString().slice(0, 10)
    case 'time':
      return '09:00'
    case 'currency':
      return '2 890,00 $'
    case 'number':
      return '0'
    default:
      return '…'
  }
}

export const findTemplatePlaceholderForVar = (templateText = '', varName = '') => {
  if (!templateText || !varName) return null
  const normalizedTarget = normalizeVarKey(varName)
  if (!normalizedTarget) return null
  const regex = /<<([^>]+)>>/g
  let match
  while ((match = regex.exec(templateText)) !== null) {
    if (normalizeVarKey(match[1]) === normalizedTarget) {
      return match[0]
    }
  }
  return null
}

export const cleanupWhitespace = (text = '') => text
  .replace(/[ \t]{2,}/g, ' ')
  .replace(/\s+([,.;:!?])/g, '$1')
  .replace(/[ \t]+\n/g, '\n')
  .replace(/\n[ \t]+/g, '\n')
  .replace(/\n{3,}/g, '\n\n')

export const removeVariablePlaceholderFromText = (text = '', varName = '') => {
  if (!text || !varName) return text
  const normalizedTarget = normalizeVarKey(varName)
  if (!normalizedTarget) return text

  const pattern = /(\s*)<<([^>]+)>>(\s*)/g
  const updated = text.replace(pattern, (fullMatch, leading = '', innerName = '', trailing = '') => {
    if (normalizeVarKey(innerName) !== normalizedTarget) return fullMatch

    const hasLeadingNewline = /\n/.test(leading)
    const hasTrailingNewline = /\n/.test(trailing)
    if (hasLeadingNewline && hasTrailingNewline) return '\n\n'
    if (hasLeadingNewline || hasTrailingNewline) return '\n'
    return ' '
  })

  return cleanupWhitespace(updated)
}

export const ensurePlaceholderInText = (text = '', templateText = '', varName = '') => {
  if (!templateText || !varName) return text || ''
  const placeholder = findTemplatePlaceholderForVar(templateText, varName) || `<<${varName}>>`
  const source = text || ''
  if (source.includes(placeholder)) return source

  const varIndex = templateText.indexOf(placeholder)
  if (varIndex === -1) return source

  const beforeSegments = templateText.substring(0, varIndex).split(/<<[^>]+>>/)
  const beforeAnchor = beforeSegments[beforeSegments.length - 1] || ''
  const afterSegments = templateText.substring(varIndex + placeholder.length).split(/<<[^>]+>>/)
  const afterAnchor = afterSegments[0] || ''

  let insertPos = source.length

  if (afterAnchor) {
    const afterIdx = source.indexOf(afterAnchor)
    if (afterIdx !== -1) {
      insertPos = afterIdx
    }
  }

  if (insertPos === source.length && beforeAnchor) {
    const beforeIdx = source.lastIndexOf(beforeAnchor)
    if (beforeIdx !== -1) {
      insertPos = beforeIdx + beforeAnchor.length
    }
  }

  let working = source
  if (insertPos === working.length && !beforeAnchor && !afterAnchor && working.length > 0 && !/\n$/.test(working)) {
    working += '\n'
    insertPos = working.length
  }

  const charBefore = insertPos > 0 ? working[insertPos - 1] : ''
  const charAfter = insertPos < working.length ? working[insertPos] : ''
  const needsSpaceBefore = charBefore && !/[\s([\n]/.test(charBefore)
  const needsSpaceAfter = charAfter && !/[\s,.;:!?)/\]]/.test(charAfter)

  let insertion = placeholder
  if (needsSpaceBefore) insertion = ` ${insertion}`
  if (needsSpaceAfter) insertion = `${insertion} `

  const updated = working.slice(0, insertPos) + insertion + working.slice(insertPos)
  return cleanupWhitespace(updated)
}

export const applyAssignments = (prev = {}, assignments = {}) => {
  const keys = Object.keys(assignments || {})
  if (!keys.length) return prev
  let hasDiff = false
  const next = { ...prev }
  keys.forEach((key) => {
    const normalized = (assignments[key] ?? '').toString()
    if ((next[key] ?? '') !== normalized) {
      next[key] = normalized
      hasDiff = true
    }
  })
  return hasDiff ? next : prev
}
