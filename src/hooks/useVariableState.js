import { useState, useEffect, useRef, useCallback } from 'react'
import { applyAssignments, buildInitialVariables } from '../utils/template'
import { expandVariableAssignment } from '../utils/variables'
import { loadState } from '../utils/storage'

export function useVariableState(selectedTemplate, templatesData, templateLanguage) {
  const [variables, setVariables] = useState({})
  const variablesRef = useRef(variables)

  useEffect(() => {
    const savedState = loadState()
    if (savedState && savedState.variables) {
      setVariables(savedState.variables)
    }
  }, [])

  useEffect(() => {
    variablesRef.current = variables
  }, [variables])

  useEffect(() => {
    if (selectedTemplate && templatesData) {
      const initialVars = buildInitialVariables(selectedTemplate, templatesData, templateLanguage)
      setVariables(initialVars)
    } else {
      setVariables({})
    }
  }, [selectedTemplate, templateLanguage, templatesData])

  const handleInlineVariableChange = useCallback((updates) => {
    if (!updates) return
    setVariables((prev) => {
      const assignments = {}
      const preferredLang = (templateLanguage || 'fr').toUpperCase()
      Object.entries(updates).forEach(([key, rawValue]) => {
        const normalized = (rawValue ?? '').toString()
        Object.assign(assignments, expandVariableAssignment(key, normalized, {
          preferredLanguage: preferredLang,
          variables: prev
        }))
      })
      const next = applyAssignments(prev, assignments)
      return next
    })
  }, [templateLanguage])

  return {
    variables,
    setVariables,
    variablesRef,
    handleInlineVariableChange,
  }
}
