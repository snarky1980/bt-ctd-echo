import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import LexicalEditor from './lexical/LexicalEditor.jsx'
import { useToast } from './components/ui/toast.jsx'
import { getCategoryBadgeStyle } from './constants/categories.js'
import { interfaceTexts } from './constants/interfaceTexts.js'
import { useTemplateState } from './hooks/useTemplateState.js'
import { useVariableState } from './hooks/useVariableState.js'
import { useTemplateSearch } from './hooks/useTemplateSearch.jsx'
import { useVariableProcessor } from './hooks/useVariableProcessor.js'
import { useDebounce } from './hooks/useDebounce.js'
import { useCategory } from './utils/category.js'
import { Header } from './components/app/Header.jsx';
import { TemplateList } from './components/app/TemplateList.jsx';
import { SearchAndFilter } from './components/app/SearchAndFilter.jsx';
import { EditorPanel } from './components/app/EditorPanel.jsx'
import { VariablesPanel } from './components/app/VariablesPanel.jsx'
import { saveState, clearState, loadState, getDefaultState } from './utils/storage.js'
import {
  extractVariablesFromPills,
  extractVariablesFromTemplate,
  stripRichTextForSync
} from './utils/extraction.js'
import { applyAssignments } from './utils/template.js'
import { expandVariableAssignment, normalizeVarKey } from './utils/variables.js'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './components/ui/tooltip.jsx'
import { Button } from './components/ui/button.jsx'
import { Input } from './components/ui/input.jsx'
import { Badge } from './components/ui/badge.jsx'
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card.jsx'
import { ScrollArea } from './components/ui/scroll-area.jsx'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './components/ui/select.jsx'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable.jsx'
import { Bot, Languages, Search, ChevronDown, ChevronUp, Clipboard, ClipboardCheck, Trash2 } from 'lucide-react'
import AISidebar from './components/AISidebar'
import HelpCenter from './components/HelpCenter.jsx'
import echoLogo from './assets/echo-logo.svg'
import './App.css'

// Custom CSS for modern typography and variable highlighting with the EXACT original teal/sage styling
const customEditorStyles = `
  /* Translation Bureau Brand Colors - EXACT MATCH from original design */
  :root {
    /* ECHO brand additions */
    
    --tb-teal: #aca868;         /* Deeper muted gold */
    --tb-teal-light: #aca868;   /* Muted gold - lighter */
    --tb-teal-dark: #a69235;    /* Dark muted gold */
    --tb-sage: #b5af70;         /* Deeper muted gold */
    --tb-sage-light: #b5af70;   /* Muted gold - lighter */
    --tb-mint: #fefbe8;         /* Very light gold - background */
    --tb-cream: #fefefe;        /* Clean white */
  }

  /* Modern typography base */
  * {
    font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Enhanced variable highlighting styles */
  .variable-highlight {
    background-color: #fef3c7;
    color: #d97706;
    padding: 3px 6px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 15px;
    border: 1px solid #f59e0b;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    letter-spacing: 0.005em;
  }

  /* Subtle, non-blocking underline cues for variable regions in the editor overlay */
  mark.var-highlight {
    background: transparent !important;
    color: transparent !important; /* keep caret/text from being doubled visually */
    border-bottom: 2px dotted rgba(0, 0, 0, 0.5); /* default cue color */
    padding: 0 0 0.05em 0; /* minimal padding for consistent underline */
  }
  mark.var-highlight.filled {
    border-bottom-color: rgba(44, 61, 80, 0.9); /* stronger navy when filled */
  }
  mark.var-highlight.empty {
    border-bottom-color: rgba(156, 163, 175, 0.8); /* gray when empty */
  }
  
  /* Persistent, elegant scrollbar for easy mouse dragging */
  [data-slot="scroll-area-scrollbar"] {
    opacity: 1 !important;
    visibility: visible !important;
    display: flex !important;
    width: 20px !important;
    padding: 4px !important;
    background: linear-gradient(to right, rgba(255,255,255,0.4), rgba(241, 245, 249, 0.9)) !important;
    border-left: 1px solid rgba(203, 180, 74, 0.15) !important;
    pointer-events: auto !important;
    transition: background 0.2s ease !important;
  }
  
  [data-slot="scroll-area-scrollbar"]:hover {
    background: linear-gradient(to right, rgba(255,255,255,0.5), rgba(241, 245, 249, 1)) !important;
  }
  
  /* Smooth but responsive scrolling */
  [data-radix-scroll-area-viewport] {
    scroll-behavior: auto;
    overscroll-behavior: contain;
  }
  
  [data-slot="scroll-area-thumb"] {
    background: linear-gradient(135deg, #aca868 0%, #b5af70 50%, #cbb44a 100%) !important;
    opacity: 1 !important;
    border-radius: 10px !important;
    width: 12px !important;
    min-height: 50px !important;
    box-shadow: 0 2px 6px rgba(138, 133, 53, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    transition: all 0.15s ease-out !important;
    border: 1px solid rgba(138, 133, 53, 0.2) !important;
    will-change: transform, box-shadow !important;
  }
  
  [data-slot="scroll-area-thumb"]:active {
    background: linear-gradient(135deg, #8a8535 0%, #9a8f45 50%, #a69235 100%) !important;
    box-shadow: 0 1px 3px rgba(138, 133, 53, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
    transform: scaleX(1.05) !important;
    transition: all 0.05s ease-out !important;
  }
  
  [data-slot="scroll-area-scrollbar"]:hover [data-slot="scroll-area-thumb"] {
    background: linear-gradient(135deg, #b5af70 0%, #cbb44a 50%, #d4c05e 100%) !important;
    box-shadow: 0 3px 8px rgba(138, 133, 53, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
    transform: scaleX(1.12) !important;
    border-color: rgba(138, 133, 53, 0.3) !important;
  }
  
  /* Remove visual artifacts in inputs */
  input[type="text"], input[type="number"], input {
    list-style: none !important;
    list-style-type: none !important;
    background-image: none !important;
  }
  
  input::before, input::after {
    content: none !important;
    display: none !important;
  }
  
  /* Remove dots/bullets artifacts */
  input::-webkit-list-button {
    display: none !important;
  }
  
  input::-webkit-calendar-picker-indicator {
    display: none !important;
  }
  
  /* Modern editor typography */
  .editor-container {
    position: relative;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  }
  
  .editor-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    padding: 16px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.7;
    letter-spacing: 0.01em;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow: hidden;
    color: transparent;
    z-index: 1;
  }
  
  /* Variable highlighting using <mark> tags in contentEditable */
  mark.var-highlight {
    display: inline;
    padding: 2px 6px;
    border-radius: 6px;
    font-weight: 600;
    background: rgba(203, 180, 74, 0.5); /* warm yellow/amber */
    color: #8a7530; /* navy text */
    border: 1px solid rgba(184, 162, 60, 0.5);
    font-style: normal;
  }
  mark.var-highlight.filled {
    background: rgba(203, 180, 74, 0.7);
    border-color: rgba(184, 162, 60, 0.8);
    font-weight: 700;
  }
  mark.var-highlight.empty {
    background: rgba(203, 180, 74, 0.35);
    border-color: rgba(184, 162, 60, 0.45);
    color: #8a7530;
    font-style: italic;
  }
  /* Focus assist: when a variable input is focused, outline matching marks */
  mark.var-highlight.focused {
    outline: 3px solid rgba(29, 78, 216, 0.9);
    border: 1px solid rgba(29, 78, 216, 0.8);
    box-shadow: 0 0 0 5px rgba(29, 78, 216, 0.25), 0 0 16px rgba(29, 78, 216, 0.35), inset 0 0 0 1px rgba(219, 234, 254, 0.8);
    background: rgba(219, 234, 254, 0.95);
    color: #1e3a8a;
    font-weight: 600;
    transition: outline-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease, border-color 160ms ease;
    animation: pulse-focus 1.5s ease-in-out infinite;
  }
  mark.var-highlight.hovered {
    outline: 2px solid rgba(96, 165, 250, 0.6);
    border: 1px solid rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 3px rgba(191, 219, 254, 0.4);
    background: rgba(219, 234, 254, 0.5);
    color: #1e40af;
    transition: outline-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease, border-color 160ms ease;
  }

  @keyframes pulse-focus {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.92;
    }
  }
  
  .editor-textarea {
    position: relative;
    z-index: 2;
    background: transparent !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    font-weight: 400;
    letter-spacing: 0.01em;
  }
  
  /* Input field typography improvements */
  input, textarea {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif !important;
    font-weight: 400;
    letter-spacing: 0.01em;
  }
  
  /* Resizable popup styles */
  .resizable-popup {
    resize: both;
    overflow: auto;
    position: relative;
  }
  
  .resizable-popup::-webkit-resizer {
    display: none; /* Hide default resizer completely */
  }
  
  /* Custom resize handle */
  .custom-resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: nw-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.6;
    transition: opacity 0.2s;
    pointer-events: none; /* Let browser handle resize */
  }
  
  .resizable-popup:hover .custom-resize-handle {
    opacity: 1;
  }

  /* Search hit highlight */
  mark.search-hit {
    background: #fff3bf;
    border-radius: 3px;
    padding: 0 2px;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.04);
  }
`

// Constants
const EDITOR_MIN_HEIGHT = 200
const EDITOR_MAX_HEIGHT = 800
const DEBOUNCE_DELAY = 300
const LANGUAGE_SUFFIXES = ['FR', 'EN']

// Main App Component
function App () {
  // Toast notifications
  const toast = useToast()

  // Inject custom styles for variable highlighting
  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = customEditorStyles
    document.head.appendChild(styleElement)
    return () => document.head.removeChild(styleElement)
  }, [])

  // Debug flag via ?debug=1
  const debug = useMemo(() => {
    try { return new URLSearchParams(window.location.search).has('debug') } catch { return false }
  }, [])

  // Load saved state
  const skipSavedState = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('reset') === '1'
    } catch {
      return false
    }
  }, [])

  const savedState = useMemo(() => (skipSavedState ? getDefaultState() : loadState()), [skipSavedState])

  useEffect(() => {
    if (!skipSavedState) return
    clearState()
    try {
      localStorage.removeItem('ea_last_template_id')
      localStorage.removeItem('ea_last_template_lang')
    } catch {}
    try {
      const url = new URL(window.location.href)
      url.searchParams.delete('reset')
      window.history.replaceState(null, '', url.toString())
    } catch {}
  }, [skipSavedState])
  
  // State for template data
  const [templatesData, setTemplatesData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Separate interface language from template language
  const [interfaceLanguage, setInterfaceLanguage] = useState(savedState.interfaceLanguage || 'fr') // Interface language
  const [templateLanguage, setTemplateLanguage] = useState(savedState.templateLanguage || 'fr')   // Template language
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState(savedState.selectedTemplateId || null)
  const [searchQuery, setSearchQuery] = useState(savedState.searchQuery || '')
  const [selectedCategory, setSelectedCategory] = useState(savedState.selectedCategory || 'all')
  const { categories, orderedCategories, getCategoryLabel } = useCategory(templatesData, interfaceLanguage)
  
  const [finalSubject, setFinalSubject] = useState('') // Final editable version
  const [finalBody, setFinalBody] = useState('') // Final editable version
  const [variables, setVariables] = useState(savedState.variables || {})
  // Preference: Strict Classic Outlook (avoid ms-outlook/mailto to reduce New Outlook/Web)
  const [strictClassic, setStrictClassic] = useState(() => {
    if (typeof savedState.strictClassic !== 'undefined') return !!savedState.strictClassic
    try { return localStorage.getItem('ea_strict_classic') === '1' } catch (e) { return false }
  })

  const variablesRef = useRef(variables)
  const finalSubjectRef = useRef(finalSubject)
  const finalBodyRef = useRef(finalBody)
  const bodyEditorRef = useRef(null)
  const subjectEditorRef = useRef(null)
  const selectedTemplateRef = useRef(selectedTemplate)
  const templateLanguageRef = useRef(templateLanguage)
  const syncFromTextRef = useRef(null)
  const focusFromPopoutRef = useRef(false)

  useEffect(() => { variablesRef.current = variables }, [variables])
  useEffect(() => { finalSubjectRef.current = finalSubject }, [finalSubject])
  useEffect(() => { finalBodyRef.current = finalBody }, [finalBody])

  // Persist Strict Classic preference
  useEffect(() => {
    try { localStorage.setItem('ea_strict_classic', strictClassic ? '1' : '0') } catch (e) {}
  }, [strictClassic])
  useEffect(() => { selectedTemplateRef.current = selectedTemplate }, [selectedTemplate])
  useEffect(() => { templateLanguageRef.current = templateLanguage }, [templateLanguage])
  const [favorites, setFavorites] = useState(savedState.favorites || [])
  const [favoritesOnly, setFavoritesOnly] = useState(savedState.favoritesOnly || false)
  const [copySuccess, setCopySuccess] = useState(null) // tracks which button was clicked: 'subject', 'body', 'all', or null
  const [showVariablePopup, setShowVariablePopup] = useState(false)
  const [showHelpCenter, setShowHelpCenter] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [preferPopout, setPreferPopout] = useState(() => {
    try { return localStorage.getItem('ea_prefer_popout') === 'true' } catch { return false }
  })
  const [showHighlights, setShowHighlights] = useState(() => {
    const saved = localStorage.getItem('ea_show_highlights')
    return saved === null ? true : saved === 'true'
  })
  const supportEmail = useMemo(() => {
    try {
      const envEmail = import.meta?.env?.VITE_SUPPORT_EMAIL
      if (typeof envEmail === 'string') {
        const trimmed = envEmail.trim()
        if (trimmed) return trimmed
      }
    } catch {}
    return 'echo-support@jskennedy.net'
  }, [])
  const supportFormEndpoint = useMemo(() => {
    try {
      const endpoint = import.meta?.env?.VITE_SUPPORT_FORM_ENDPOINT
      if (typeof endpoint === 'string' && endpoint.trim().length) {
        return endpoint.trim()
      }
    } catch {}
    return null
  }, [])
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = Number(localStorage.getItem('ea_left_width'))
    return Number.isFinite(saved) && saved >= 340 && saved <= 680 ? saved : 480
  })
  const isDragging = useRef(false)
  const [varPopupPos, setVarPopupPos] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ea_var_popup_pos_v3') || 'null')
      if (saved && typeof saved.top === 'number' && typeof saved.left === 'number' && typeof saved.width === 'number' && typeof saved.height === 'number') return saved
    } catch {}
    // Default: compact single-column pane sized for four cards tall
    return { top: 80, left: 80, width: 470, height: 700 }
  })
  const varPopupRef = useRef(null)
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, origTop: 0, origLeft: 0 })
  // Vars popup UX state
  const [varsFilter, setVarsFilter] = useState('')
  const [focusedVar, setFocusedVar] = useState(null)
  const varInputRefs = useRef({})
  const [varsPinned, setVarsPinned] = useState(true)
  const [varsMinimized, setVarsMinimized] = useState(false)
  const [pillPos, setPillPos] = useState({ right: 16, bottom: 16 })
  const [isFullscreen, setIsFullscreen] = useState(() => {
    try { return !!(document.fullscreenElement || document.webkitFullscreenElement) } catch { return false }
  })
  // Cross-window sync for variables (main <-> pop-out)
  const varsChannelRef = useRef(null)
  const varsSenderIdRef = useRef(Math.random().toString(36).slice(2))
  const popoutChannelRef = useRef(null)
  const popoutSenderIdRef = useRef(Math.random().toString(36).slice(2))
  const pendingPopoutSnapshotRef = useRef(null)
  const varsRemoteUpdateRef = useRef(false)
  const skipPopoutBroadcastRef = useRef({ pending: false, templateId: null, templateLanguage: null })
  const manualEditRef = useRef({ subject: false, body: false })
  const pendingTemplateIdRef = useRef(null)
  const canUseBC = typeof window !== 'undefined' && 'BroadcastChannel' in window

  const updateFocusHighlight = useCallback((varName) => {
    try {
      const normalized = normalizeVarKey(varName)
      const marks = document.querySelectorAll('mark.var-highlight')
      const pills = document.querySelectorAll('.var-pill')

      marks.forEach((node) => {
        const nodeKey = node.getAttribute('data-var')
        const isMatch = normalized && normalizeVarKey(nodeKey) === normalized
        node.classList.toggle('focused', !!isMatch)
      })

      pills.forEach((node) => {
        const nodeKey = node.getAttribute('data-var')
        const isMatch = normalized && normalizeVarKey(nodeKey) === normalized
        node.classList.toggle('focused', !!isMatch)
      })
    } catch (err) {
      console.warn('Failed to update focus highlight', err)
    }
  }, [])

  const scrollFocusIntoView = useCallback((varName) => {
    const normalized = normalizeVarKey(varName)
    if (!normalized) return
    requestAnimationFrame(() => {
      const pill = Array.from(document.querySelectorAll('.var-pill')).find((node) => normalizeVarKey(node.getAttribute('data-var')) === normalized)
      const mark = pill ? null : Array.from(document.querySelectorAll('mark.var-highlight')).find((node) => normalizeVarKey(node.getAttribute('data-var')) === normalized)
      const target = pill || mark
      if (!target) return
      try {
        target.scrollIntoView({ block: 'center', behavior: 'smooth' })
      } catch {}
    })
  }, [])

  const updateHoverHighlight = useCallback((varName) => {
    try {
      const normalized = normalizeVarKey(varName)
      const marks = document.querySelectorAll('mark.var-highlight')
      const pills = document.querySelectorAll('.var-pill')

      marks.forEach((node) => {
        const nodeKey = node.getAttribute('data-var')
        const isMatch = normalized && normalizeVarKey(nodeKey) === normalized
        node.classList.toggle('hovered', !!isMatch)
      })

      pills.forEach((node) => {
        const nodeKey = node.getAttribute('data-var')
        const isMatch = normalized && normalizeVarKey(nodeKey) === normalized
        node.classList.toggle('hovered', !!isMatch)
      })
    } catch (err) {
      console.warn('Failed to update hover highlight', err)
    }
  }, [])

  // Keep highlight visible briefly after blur for better visual continuity
  const focusClearTimerRef = useRef(null)

  const flagSkipPopoutBroadcast = () => {
    skipPopoutBroadcastRef.current = {
      pending: true,
      templateId: selectedTemplateRef.current?.id || null,
      templateLanguage: templateLanguageRef.current || null
    }
  }
  // Focus → outline matching marks/pills; blur clears after a short delay
  useEffect(() => {
    if (focusClearTimerRef.current) { clearTimeout(focusClearTimerRef.current); focusClearTimerRef.current = null }
    if (focusedVar) {
      updateFocusHighlight(focusedVar)
    } else {
      focusClearTimerRef.current = setTimeout(() => updateFocusHighlight(null), 300)
    }
    return () => { if (focusClearTimerRef.current) { clearTimeout(focusClearTimerRef.current); focusClearTimerRef.current = null } }
  }, [focusedVar, updateFocusHighlight])

  // Listen for pill focus events dispatched from PillComponent
  useEffect(() => {
    const handler = (e) => {
      const { key } = e.detail || {}
      setFocusedVar(key || null)
    }
    window.addEventListener('ea-focus-variable', handler)
    return () => window.removeEventListener('ea-focus-variable', handler)
  }, [])

  // Track hover over pills and marks to sync with popout
  useEffect(() => {
    let currentHoveredVar = null

    const handleMouseOver = (e) => {
      const target = e.target
      if (!target) return

      // Check if hovering over a pill or mark
      const pill = target.closest('.var-pill')
      const mark = target.closest('mark.var-highlight')
      const element = pill || mark

      if (element) {
        const varName = element.getAttribute('data-var')
        if (varName && varName !== currentHoveredVar) {
          currentHoveredVar = varName
          updateHoverHighlight(varName)
          
          // Broadcast to popout
          if (popoutChannelRef.current) {
            try {
              popoutChannelRef.current.postMessage({
                type: 'variableHovered',
                varName,
                sender: popoutSenderIdRef.current
              })
            } catch (e) {
              console.error('Failed to send hover update:', e)
            }
          }
        }
      } else if (currentHoveredVar) {
        currentHoveredVar = null
        updateHoverHighlight(null)
        
        // Broadcast clear to popout
        if (popoutChannelRef.current) {
          try {
            popoutChannelRef.current.postMessage({
              type: 'variableHovered',
              varName: null,
              sender: popoutSenderIdRef.current
            })
          } catch (e) {
            console.error('Failed to send hover clear:', e)
          }
        }
      }
    }

    document.addEventListener('mouseover', handleMouseOver, true)
    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true)
      if (currentHoveredVar) {
        updateHoverHighlight(null)
      }
    }
  }, [updateHoverHighlight])

  const handleInlineVariableChange = useCallback((updates) => {
    if (!updates) return
    setVariables((prev) => {
      const assignments = {}
      const preferredLang = (templateLanguageRef.current || 'fr').toUpperCase()
      Object.entries(updates).forEach(([key, rawValue]) => {
        const normalized = (rawValue ?? '').toString()
        Object.assign(assignments, expandVariableAssignment(key, normalized, {
          preferredLanguage: preferredLang,
          variables: prev
        }))
      })
      const next = applyAssignments(prev, assignments)
      if (next !== prev) {
        variablesRef.current = next
      }
      return next
    })
  }, [])

  // Refresh outlines if content updates while focused
  useEffect(() => {
    if (!focusedVar) return
    requestAnimationFrame(() => updateFocusHighlight(focusedVar))
  }, [variables, showHighlights, focusedVar, updateFocusHighlight])

  // Clear any lingering highlight when switching template or language
  useEffect(() => {
    updateFocusHighlight(null)
  }, [selectedTemplateId, templateLanguage, updateFocusHighlight])
  // Export menu state (replaces <details> for reliability)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef(null)
  
  // References for keyboard shortcuts
  const searchRef = useRef(null) // Reference for focus on search (Ctrl+J)

  // Template list interaction states
  const [pressedCardId, setPressedCardId] = useState(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const itemRefs = useRef({})
  const [favLiveMsg, setFavLiveMsg] = useState('')
  // Virtualization and mobile
  const viewportRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportH, setViewportH] = useState(600)
  const [showMobileTemplates, setShowMobileTemplates] = useState(false)
  // Pop-out (child window) mode: render variables only when ?varsOnly=1
  const varsOnlyMode = useMemo(() => {
    try { return new URLSearchParams(window.location.search).get('varsOnly') === '1' } catch { return false }
  }, [])

  // Auto-open variables popup in vars-only mode
  useEffect(() => {
    if (varsOnlyMode) setShowVariablePopup(true)
  }, [varsOnlyMode])

  // In varsOnly mode, make the popup fill the window and follow resize
  useEffect(() => {
    if (!varsOnlyMode) return
    const setFull = () => setVarPopupPos(p => ({ ...p, top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }))
    setFull()
    const onResize = () => setFull()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [varsOnlyMode])

  // Track fullscreen state (pop-out only)
  useEffect(() => {
    const onFs = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement))
      // adjust size again when entering/exiting fullscreen
      if (varsOnlyMode) setVarPopupPos(p => ({ ...p, top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }))
    }
    document.addEventListener('fullscreenchange', onFs)
    document.addEventListener('webkitfullscreenchange', onFs)
    return () => {
      document.removeEventListener('fullscreenchange', onFs)
      document.removeEventListener('webkitfullscreenchange', onFs)
    }
  }, [varsOnlyMode])

  const toggleFullscreen = () => {
    try {
      const el = document.documentElement
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement)
      if (!isFs) {
        if (el.requestFullscreen) el.requestFullscreen()
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
      } else {
        if (document.exitFullscreen) document.exitFullscreen()
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
      }
    } catch {}
  }

  // Automatically save important preferences with debouncing for variables
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveState({
        interfaceLanguage,
        templateLanguage,
        searchQuery,
        selectedCategory,
        selectedTemplateId,
        variables,
        favorites,
        favoritesOnly
      })
    }, 300) // 300ms debounce
    
    return () => clearTimeout(timeoutId)
  }, [interfaceLanguage, templateLanguage, searchQuery, selectedCategory, selectedTemplateId, variables, favorites, favoritesOnly])

  // Persist pane sizes
  useEffect(() => {
    try {
      localStorage.setItem('ea_left_width', String(leftWidth))
    } catch {}
  }, [leftWidth])

  // Persist highlight visibility
  useEffect(() => {
    try {
      localStorage.setItem('ea_show_highlights', String(showHighlights))
    } catch {}
  }, [showHighlights])

  // Persist popup position/size
  useEffect(() => {
    try { localStorage.setItem('ea_var_popup_pos_v3', JSON.stringify(varPopupPos)) } catch {}
  }, [varPopupPos])

  // Persist popout preference
  useEffect(() => {
    try { localStorage.setItem('ea_prefer_popout', String(preferPopout)) } catch {}
  }, [preferPopout])

  // Persist last used template and language for robust popout fallback
  useEffect(() => {
    try {
      if (selectedTemplateId) localStorage.setItem('ea_last_template_id', selectedTemplateId)
      if (templateLanguage) localStorage.setItem('ea_last_template_lang', templateLanguage)
    } catch {}
  }, [selectedTemplateId, templateLanguage])

  // Smart function to open variables (popup or popout based on preference)
  const openVariables = useCallback(() => {
    if (preferPopout && selectedTemplate?.variables?.length > 0) {
      // Auto-open popout (single-column, approx 470x700)
      const url = new URL(window.location.href)
      url.searchParams.set('varsOnly', '1')
      if (selectedTemplate?.id) url.searchParams.set('id', selectedTemplate.id)
      if (templateLanguage) url.searchParams.set('lang', templateLanguage)
      // Calculate optimal size based on number of variables
      const varCount = selectedTemplate?.variables?.length || 0
      
      // Base dimensions - responsive width that allows 2 columns by default
      const cardHeight = 110 // estimated height per card
      const headerHeight = 60 // header bar height
      const padding = 40 // total padding
      
      // Start with a good width for 2 columns (responsive breakpoint)
      let w = 720
      
      // Calculate height based on 2-column layout
      const rows = Math.ceil(varCount / 2)
      let h = Math.max(400, Math.min(900, headerHeight + (rows * cardHeight) + padding))
      
      // Clamp to available screen space
      const availW = (window.screen?.availWidth || window.innerWidth) - 40
      const availH = (window.screen?.availHeight || window.innerHeight) - 80
      w = Math.min(w, availW)
      h = Math.min(h, availH)
      
      const left = Math.max(0, Math.floor(((window.screen?.availWidth || window.innerWidth) - w) / 2))
      const top = Math.max(0, Math.floor(((window.screen?.availHeight || window.innerHeight) - h) / 3))
      // Important: open a blank window with features so size is respected
      // Some environments ignore features when opening a URL directly
      // Note: alwaysRaised is a Firefox-specific feature that helps keep window on top
      const features = `popup=yes,width=${Math.round(w)},height=${Math.round(h)},left=${left},top=${top},toolbar=0,location=0,menubar=0,status=0,scrollbars=1,resizable=1,alwaysRaised=yes`
      const win = window.open('', '_blank', features)
      if (win) {
        try {
          // Minimal loading state to avoid white flash
          win.document.write('<!doctype html><title>Loading…</title><style>html,body{height:100%;margin:0;font:14px system-ui, -apple-system, Segoe UI, Roboto, sans-serif;display:grid;place-items:center;color:#6b7280;background:#fff}</style><div>Loading…</div>')
        } catch {}
        try { win.location.replace(url.toString()) } catch { try { win.location.href = url.toString() } catch {} }
        try { win.focus() } catch {}
      }
      
      // Auto-close the popup when popout opens successfully
      if (win) {
        setVarsMinimized(false)
        setVarsPinned(false)
        setShowVariablePopup(false)
        
        // Notify other components that popout opened
        if (canUseBC) {
          try {
            const channel = new BroadcastChannel('email-assistant-sync')
            channel.postMessage({ type: 'popoutOpened', timestamp: Date.now() })
            channel.close()
          } catch (e) {
            console.log('BroadcastChannel not available for popout sync')
          }
        }
        
        // Listen for when popout window closes
        const checkClosed = setInterval(() => {
          if (win.closed) {
            clearInterval(checkClosed)
            // Notify that popout closed
            if (canUseBC) {
              try {
                const channel = new BroadcastChannel('email-assistant-sync')
                channel.postMessage({ type: 'popoutClosed', timestamp: Date.now() })
                channel.close()
              } catch (e) {
                console.log('BroadcastChannel not available for popout close sync')
              }
            }
          }
        }, 1000)
      }
    } else {
      // Open popup
      setShowVariablePopup(true)
      
      // Notify that variables popup opened
      if (canUseBC) {
        try {
          const channel = new BroadcastChannel('email-assistant-sync')
          channel.postMessage({ type: 'variablesPopupOpened', timestamp: Date.now() })
          channel.close()
        } catch (e) {
          console.log('BroadcastChannel not available for popup sync')
        }
      }
    }
  }, [preferPopout, selectedTemplate, templateLanguage])

  // Setup BroadcastChannel for variables syncing
  useEffect(() => {
    if (!canUseBC) return
    try {
      const ch = new BroadcastChannel('ea_vars')
      varsChannelRef.current = ch

      ch.onmessage = (ev) => {
        const msg = ev?.data || {}
        if (!msg || msg.sender === varsSenderIdRef.current) return
        const applyTemplateMeta = (m) => {
          if (m?.templateLanguage && (m.templateLanguage === 'fr' || m.templateLanguage === 'en')) {
            setTemplateLanguage(m.templateLanguage)
          }
          if (m?.templateId) {
            if (templatesData?.templates?.length) {
              const found = templatesData.templates.find(t => t.id === m.templateId)
              if (found) setSelectedTemplate(found)
            } else {
              pendingTemplateIdRef.current = m.templateId
            }
          }
        }
        if (msg.type === 'update' && (msg.variables || msg.templateId || msg.templateLanguage || msg.hasOwnProperty('focusedVar'))) {
          if (msg.variables && typeof msg.variables === 'object') {
            varsRemoteUpdateRef.current = true
            setVariables(prev => {
              const next = { ...prev, ...msg.variables }
              variablesRef.current = next
              return next
            })
          }
          if (msg.hasOwnProperty('focusedVar')) {
            setFocusedVar(msg.focusedVar)
          }
          // Skip showHighlights sync via BroadcastChannel to prevent interference
          // showHighlights will be synced only via localStorage fallback
          applyTemplateMeta(msg)
        } else if (msg.type === 'request_state') {
          ch.postMessage({ type: 'state', variables, templateId: selectedTemplate?.id || null, templateLanguage, focusedVar, sender: varsSenderIdRef.current })
        } else if (msg.type === 'state') {
          if (msg.variables) {
            varsRemoteUpdateRef.current = true
            setVariables(prev => {
              const next = { ...prev, ...msg.variables }
              variablesRef.current = next
              return next
            })
          }
          if (msg.hasOwnProperty('focusedVar')) {
            setFocusedVar(msg.focusedVar)
          }
          // Skip showHighlights sync via BroadcastChannel to prevent interference
          // showHighlights will be synced only via localStorage fallback
          applyTemplateMeta(msg)
        }
      }
      if (varsOnlyMode) {
        setTimeout(() => {
          try { ch.postMessage({ type: 'request_state', sender: varsSenderIdRef.current }) } catch {}
        }, 50)
      }
      return () => { try { ch.close() } catch {} }
    } catch {}
  }, [])

  // Listen for variable updates from the new Variables popout window
  useEffect(() => {
    if (!canUseBC) return
    try {
      const channel = new BroadcastChannel('email-assistant-sync')
      popoutChannelRef.current = channel
      
      channel.onmessage = (event) => {
        const msg = event.data
        if (!msg || msg.sender === popoutSenderIdRef.current) return
        
        // Handle hover synchronization from popout
        if (msg.type === 'variableHovered') {
          updateHoverHighlight(msg.varName || null)
          return
        }
        
        // Handle variable changes from popout
        if (msg.type === 'variableChanged' && msg.allVariables) {
          varsRemoteUpdateRef.current = true
          flagSkipPopoutBroadcast()
          const next = { ...msg.allVariables }
          variablesRef.current = next
          setVariables(next)
          // Purge any pills whose variables are now marked deleted
          try {
            Object.entries(next).forEach(([k,v]) => {
              if (v === '__DELETED__') {
                const base = k.replace(/_(FR|EN)$/i,'')
                document.querySelectorAll('.var-pill').forEach(pill => {
                  const pv = pill.getAttribute('data-var') || ''
                  if (pv === k || pv.replace(/_(FR|EN)$/i,'') === base) {
                    pill.remove()
                  }
                })
              }
            })
          } catch {}
          return
        }

        if (msg.type === 'variableDeleted' && msg.varName) {
          const { varName } = msg
          varsRemoteUpdateRef.current = true
          flagSkipPopoutBroadcast()
          const next = msg.allVariables
            ? { ...msg.allVariables }
            : { ...variablesRef.current, [varName]: '__DELETED__' }
          variablesRef.current = next
          setVariables(next)

          if (varName) {
            setFinalSubject(prev => {
              const base = typeof prev === 'string' ? prev : finalSubjectRef.current || ''
              const updated = removeVariablePlaceholderFromText(base, varName)
              finalSubjectRef.current = updated
              return updated
            })
            setFinalBody(prev => {
              const base = typeof prev === 'string' ? prev : finalBodyRef.current || ''
              const updated = removeVariablePlaceholderFromText(base, varName)
              finalBodyRef.current = updated
              return updated
            })
            // Remove any existing pill DOM nodes for this variable (and language variants)
            try {
              const baseName = varName.replace(/_(FR|EN)$/i,'')
              document.querySelectorAll('.var-pill').forEach(pill => {
                const pv = pill.getAttribute('data-var') || ''
                if (pv === varName || pv.replace(/_(FR|EN)$/i,'') === baseName) {
                  pill.remove()
                }
              })
            } catch {}
          }
          return
        }

        if (msg.type === 'variableRestored' && msg.varName) {
          const { varName, value = '' } = msg
          varsRemoteUpdateRef.current = true
          flagSkipPopoutBroadcast()
          const next = msg.allVariables
            ? { ...msg.allVariables }
            : (() => {
                const assignments = expandVariableAssignment(varName, value, {
                  preferredLanguage: (templateLanguageRef.current || 'fr').toUpperCase(),
                  variables: variablesRef.current
                })
                return applyAssignments(variablesRef.current, assignments)
              })()
          variablesRef.current = next
          setVariables(next)

          const latestTemplate = selectedTemplateRef.current
          const latestLanguage = templateLanguageRef.current || templateLanguage
          const subjectTemplate = latestTemplate?.subject?.[latestLanguage] || ''
          const bodyTemplate = latestTemplate?.body?.[latestLanguage] || ''

          const subjectHasVar = !!findTemplatePlaceholderForVar(subjectTemplate, varName)
          if (subjectHasVar) {
            setFinalSubject(prev => {
              const base = typeof prev === 'string' ? prev : finalSubjectRef.current || ''
              const updated = ensurePlaceholderInText(base, subjectTemplate, varName)
              finalSubjectRef.current = updated
              return updated
            })
          }

          const bodyHasVar = !!findTemplatePlaceholderForVar(bodyTemplate, varName)
          if (bodyHasVar) {
            setFinalBody(prev => {
              const base = typeof prev === 'string' ? prev : finalBodyRef.current || ''
              const updated = ensurePlaceholderInText(base, bodyTemplate, varName)
              finalBodyRef.current = updated
              return updated
            })
          }

          return
        }

        if (msg.type === 'focusedVar') {
          focusFromPopoutRef.current = true
          const next = msg.varName ?? null
          setFocusedVar(next)
          updateFocusHighlight(next)
          scrollFocusIntoView(next)
          return
        }

        if (msg.type === 'popoutOpened' || msg.type === 'popoutReady') {
          console.log(`🔄 ${msg.type === 'popoutReady' ? 'Popout ready' : 'Popout opened'}, extracting current values from editors...`)

          setTimeout(() => {
            // ALWAYS extract from editors when popout opens to get latest values
            // This ensures any edits made in the main window pills are captured
            let latestVariables = null
            
            try {
              const runSync = syncFromTextRef.current
              const syncResult = typeof runSync === 'function' ? runSync() : null
              if (syncResult?.variables) {
                latestVariables = { ...syncResult.variables }
                console.log('🔄 Extracted variables from editors:', latestVariables)
              }
            } catch (syncError) {
              console.error('Failed to extract variables while preparing popout snapshot:', syncError)
            }

            // Fallback to snapshot or current variables if extraction failed
            if (!latestVariables && pendingPopoutSnapshotRef.current) {
              latestVariables = { ...pendingPopoutSnapshotRef.current }
              console.log('🔄 Using pending snapshot:', latestVariables)
            }

            if (!latestVariables) {
              latestVariables = { ...variablesRef.current }
              console.log('🔄 Using current variables ref:', latestVariables)
            }

            pendingPopoutSnapshotRef.current = null

            console.log('🔄 Sending variables to popout:', latestVariables)

            try {
              channel.postMessage({
                type: 'variablesUpdated',
                variables: latestVariables,
                templateId: selectedTemplateRef.current?.id || null,
                templateLanguage: templateLanguageRef.current || templateLanguage,
                sender: popoutSenderIdRef.current
              })
              console.log('🔄 Sent variables to popout successfully')
            } catch (e) {
              console.error('Failed to send variables snapshot to popout:', e)
            }
          }, 60)
          return
        }
        
        // Handle sync request from popout
        if (msg.type === 'syncFromText') {
          console.log('🔄 Received syncFromText request from popout')
          
          // Extract current values from editors
          setTimeout(() => {
            const runSync = syncFromTextRef.current
            const result = typeof runSync === 'function' ? runSync() : { success: false, updated: false, variables: { ...variablesRef.current } }
            
            console.log('🔄 Sync result:', result)
            
            // Send back the extracted variables
            try {
              console.log('🔄 Sending sync result back to popout:', result.variables)
              channel.postMessage({
                type: 'syncComplete',
                success: result.success,
                updated: result.updated,
                variables: result.variables,
                sender: popoutSenderIdRef.current
              })
            } catch (e) {
              console.error('Failed to send sync result:', e)
            }
          }, 50) // Small delay to ensure state consistency
          return
        }
      }
      
      return () => {
        try {
          channel.close()
        } catch (e) {
          console.error('Error closing BroadcastChannel:', e)
        }
        popoutChannelRef.current = null
      }
    } catch (e) {
      console.error('BroadcastChannel not available:', e)
    }
  }, [])

  // Emit updates when local variables change (avoid echo loops) with debouncing
  useEffect(() => {
    if (!canUseBC) return
    if (varsRemoteUpdateRef.current) { varsRemoteUpdateRef.current = false; return }
    
    const snapshot = { ...variables }
    const timeoutId = setTimeout(() => {
      const ch = varsChannelRef.current
      if (!ch) return
      try { ch.postMessage({ type: 'update', variables: snapshot, sender: varsSenderIdRef.current }) } catch {}
    }, 90) // slightly faster to improve perceived latency
    
    return () => clearTimeout(timeoutId)
  }, [variables])

  // Emit selected template and language so pop-out stays in sync
  useEffect(() => {
    if (!canUseBC) return
    const activeTemplateId = selectedTemplateRef.current?.id || selectedTemplateId || null
    const ch = varsChannelRef.current
    if (!ch) return
    const payload = { type: 'update', templateId: activeTemplateId, templateLanguage, sender: varsSenderIdRef.current }
    try { ch.postMessage(payload) } catch {}
    // Also notify popout channel directly for immediate template-language sync
    const popCh = popoutChannelRef.current
    if (popCh) {
      try { popCh.postMessage({ type: 'variablesUpdated', variables: { ...variablesRef.current }, templateId: activeTemplateId, templateLanguage, sender: varsSenderIdRef.current }) } catch {}
    }
  }, [selectedTemplateId, templateLanguage])

  useEffect(() => {
    if (!canUseBC) return
    const channel = popoutChannelRef.current
    if (!channel) return

    const activeTemplateId = selectedTemplateRef.current?.id || selectedTemplateId || null
    const skipMeta = skipPopoutBroadcastRef.current
    if (skipMeta?.pending && skipMeta.templateId === activeTemplateId && skipMeta.templateLanguage === (templateLanguage || null)) {
      skipPopoutBroadcastRef.current = { pending: false, templateId: null, templateLanguage: null }
      return
    }
    skipPopoutBroadcastRef.current = { pending: false, templateId: null, templateLanguage: null }

    try {
      channel.postMessage({
        type: 'variablesUpdated',
        variables: { ...variables }, // send fresh shallow copy to avoid mutation references
        templateId: activeTemplateId,
        templateLanguage,
        sender: popoutSenderIdRef.current
      })
    } catch (e) {
      console.error('Failed to broadcast variables to popout:', e)
    }
  }, [variables, selectedTemplateId, templateLanguage])

  // Emit focused variable changes immediately for real-time visual feedback
  useEffect(() => {
    // Primary: BroadcastChannel for immediate sync
    if (focusFromPopoutRef.current) {
      focusFromPopoutRef.current = false
    } else if (canUseBC) {
      const ch = varsChannelRef.current
      if (ch) {
        try {
          ch.postMessage({ type: 'update', focusedVar, sender: varsSenderIdRef.current })
        } catch {}
      }

      const popoutChannel = popoutChannelRef.current
      if (popoutChannel) {
        try {
          popoutChannel.postMessage({
            type: 'focusedVar',
            varName: focusedVar ?? null,
            normalizedVar: normalizeVarKey(focusedVar) || null,
            sender: popoutSenderIdRef.current
          })
        } catch {}
      }
    }
    
    // Fallback: localStorage with minimal delay
    const timeoutId = setTimeout(() => {
      if (focusFromPopoutRef.current) return
      try {
        localStorage.setItem('ea_focused_var', JSON.stringify({ 
          focusedVar, 
          normalizedVar: normalizeVarKey(focusedVar) || null,
          timestamp: Date.now(),
          sender: varsSenderIdRef.current 
        }))
      } catch {}
    }, 50) // Small delay to let BroadcastChannel work first
    
    return () => clearTimeout(timeoutId)
  }, [focusedVar])

  // Emit showHighlights changes for cross-window sync
  useEffect(() => {
    // Primary: BroadcastChannel for immediate sync
    if (canUseBC) {
      const ch = varsChannelRef.current
      if (ch) {
        // showHighlights sync disabled via BroadcastChannel - using localStorage only
      }
    }
    
    // Fallback: localStorage with minimal delay
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('ea_show_highlights_sync', JSON.stringify({ 
          showHighlights, 
          timestamp: Date.now(),
          sender: varsSenderIdRef.current 
        }))
      } catch {}
    }, 50) // Small delay to let BroadcastChannel work first
    
    return () => clearTimeout(timeoutId)
  }, [showHighlights])

  // Listen for localStorage changes (fallback for cross-window sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'ea_focused_var' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          // Only update if it's from a different sender and recent
          if (data.sender !== varsSenderIdRef.current && (Date.now() - data.timestamp) < 5000) {
            setFocusedVar(data.focusedVar)
          }
        } catch {}
      } else if (e.key === 'ea_show_highlights_sync' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          // Only update if it's from a different sender and recent
          if (data.sender !== varsSenderIdRef.current && (Date.now() - data.timestamp) < 5000) {
            setShowHighlights(data.showHighlights)
          }
        } catch {}
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Apply pending remote template once templates load
  useEffect(() => {
    const pid = pendingTemplateIdRef.current
    if (!pid || !templatesData?.templates?.length) return
    const found = templatesData.templates.find(t => t.id === pid)
    if (found) setSelectedTemplate(found)
    pendingTemplateIdRef.current = null
  }, [templatesData])

  // Autofocus first empty variable when popup opens
  useEffect(() => {
    if (!showVariablePopup || varsMinimized) return
    const t = setTimeout(() => {
      try {
        if (!selectedTemplate || !selectedTemplate.variables || selectedTemplate.variables.length === 0) return
        // find first empty variable by template order
        const firstEmpty = selectedTemplate.variables.find(vn => !(variables[vn] || '').trim()) || selectedTemplate.variables[0]
        const el = varInputRefs.current[firstEmpty]
        if (el && typeof el.focus === 'function') { el.focus(); el.select?.() }
      } catch {}
    }, 0)
    return () => clearTimeout(t)
  }, [showVariablePopup, varsMinimized])

  // Outside click to auto-minimize when not pinned
  useEffect(() => {
    if (!showVariablePopup || varsPinned || varsMinimized) return
    const onDown = (e) => {
      if (!varPopupRef.current) return
      if (!varPopupRef.current.contains(e.target)) {
        setVarsMinimized(true)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [showVariablePopup, varsPinned, varsMinimized])

  // Smart paste-to-fill: parse lines like "var: value" or "var = value" and map to known variables (case/diacritic-insensitive)
  const handleVarsSmartPaste = (text) => {
    if (!text || !selectedTemplate) return
    const lines = String(text).split(/\r?\n/)
    const map = {}
    const norm = (s='') => s.normalize('NFD').replace(/\p{Diacritic}+/gu,'').toLowerCase().trim()
    const known = selectedTemplate.variables
    const byDesc = {}
    for (const vn of known) {
      const info = templatesData?.variables?.[vn]
      const keys = [vn]
      if (info?.description) {
        const dfr = info.description.fr || ''
        const den = info.description.en || ''
        keys.push(dfr, den)
      }
      byDesc[vn] = keys.map(norm).filter(Boolean)
    }
    for (const line of lines) {
      const m = line.match(/^\s*([^:=]+?)\s*[:=-]\s*(.+)\s*$/)
      if (!m) continue
      const keyN = norm(m[1])
      const val = m[2]
      // find best variable with key match by name or description words
      let target = null
      for (const vn of known) {
        if (byDesc[vn].some(k => keyN.includes(k) || k.includes(keyN))) { target = vn; break }
      }
      if (!target) {
        // fallback: exact variable name within
        target = known.find(vn => norm(vn) === keyN)
      }
      if (target) map[target] = val
    }
    if (Object.keys(map).length) {
      setVariables(prev => {
        const assignments = {}
        const preferredLang = (templateLanguageRef.current || 'fr').toUpperCase()
        Object.entries(map).forEach(([varName, value]) => {
          Object.assign(assignments, expandVariableAssignment(varName, value, {
            preferredLanguage: preferredLang,
            variables: prev
          }))
        })
        const next = applyAssignments(prev, assignments)
        if (next !== prev) {
          variablesRef.current = next
        }
        return next
      })
      // focus first mapped field
      const first = Object.keys(map)[0]
      const el = varInputRefs.current[first]
      if (el) el.focus()
    }
  }

  // Close export menu on outside click or ESC
  useEffect(() => {
    if (!showExportMenu) return
    const onDocClick = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false)
      }
    }
    const onEsc = (e) => { if (e.key === 'Escape') setShowExportMenu(false) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [showExportMenu])

  const t = interfaceTexts[interfaceLanguage]

  // Get interface-specific placeholder text
  const getPlaceholderText = () => {
    return interfaceLanguage === 'fr' ? 'Sélectionnez un modèle' : 'Select a template'
  }

  // Set initial empty editors so contentEditable placeholder shows
  useEffect(() => {
    if (!selectedTemplate) {
      finalSubjectRef.current = ''
      finalBodyRef.current = ''
      setFinalSubject('')
      setFinalBody('')
    }
  }, [interfaceLanguage]) // Update when interface language changes

  // Load template data on startup
  useEffect(() => {
    const tryLoadAdminDataset = () => {
      try {
        const adminLocal = localStorage.getItem('ea_admin_templates_data')
        if (adminLocal) {
          const parsed = JSON.parse(adminLocal)
          if (parsed && typeof parsed === 'object' && Array.isArray(parsed.templates) && parsed.templates.length) {
            if (debug) console.log('[EA][Debug] Using locally published admin templates dataset')
            return parsed
          }
        }
      } catch (e) {
        if (debug) console.warn('[EA][Debug] local admin dataset parse failed', e)
      }
      return null
    }

    const fetchTemplatesFromSources = async () => {
      if (debug) console.log('[EA][Debug] Fetching templates (prefer raw main data)...')
      const RAW_MAIN = (import.meta?.env?.VITE_TEMPLATES_URL) || 'https://raw.githubusercontent.com/snarky1980/echo-bt-ctd-gestion/main/complete_email_templates.json'
      const RAW_GHPAGES = 'https://raw.githubusercontent.com/snarky1980/echo-bt-ctd-gestion/gh-pages/complete_email_templates.json'
      const LOCAL_URL = './complete_email_templates.json'
      const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : '/'
      const ABSOLUTE_URL = (BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/') + 'complete_email_templates.json'
      const ts = Date.now()
      const withBust = (u) => u + (u.includes('?') ? '&' : '?') + 'cb=' + ts
      const candidates = [withBust(RAW_MAIN), withBust(RAW_GHPAGES), withBust(ABSOLUTE_URL), withBust(LOCAL_URL)]

      let loaded = null
      let lastErr = null
      for (const url of candidates) {
        try {
          if (debug) console.log('[EA][Debug] Try fetch', url)
          const resp = await fetch(url, { cache: 'no-cache' })
          if (!resp.ok) throw new Error('HTTP ' + resp.status)
          const j = await resp.json()
          loaded = j
          break
        } catch (e) {
          lastErr = e
          if (debug) console.warn('[EA][Debug] fetch candidate failed', url, e?.message || e)
        }
      }
      if (!loaded) throw lastErr || new Error('No template source reachable')
      return loaded
    }

    const loadTemplatesData = async () => {
      const canonicalDataset = CANONICAL_TEMPLATES
      const adminDataset = tryLoadAdminDataset()
      if (adminDataset) {
        setTemplatesData(mergeTemplateDatasets(adminDataset, canonicalDataset))
        setLoading(false)
        try {
          const fallbackDataset = await fetchTemplatesFromSources()
          if (fallbackDataset) {
            setTemplatesData((prev) => mergeTemplateDatasets(prev || canonicalDataset, fallbackDataset))
            if (debug) console.log('[EA][Debug] Admin dataset merged with fallback metadata')
          }
        } catch (fallbackError) {
          if (debug) console.warn('[EA][Debug] Fallback template fetch failed', fallbackError)
        }
        return
      }

      setTemplatesData(canonicalDataset)
      try {
        const remoteData = await fetchTemplatesFromSources()
        if (remoteData) {
          setTemplatesData(mergeTemplateDatasets(remoteData, canonicalDataset))
          if (debug) console.log('[EA][Debug] Templates loaded:', remoteData?.templates?.length)
        }
      } catch (error) {
        console.error('Error loading templates data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTemplatesData()
  }, [debug])

  /**
   * AUTO-REFRESH: Poll for template updates from admin console
   * Checks metadata.updatedAt timestamp every 30 seconds and reloads if changed
   */
  const lastKnownUpdatedAt = useRef(null)
  useEffect(() => {
    if (!templatesData) return
    
    // Initialize with current timestamp
    if (!lastKnownUpdatedAt.current) {
      lastKnownUpdatedAt.current = templatesData?.metadata?.updatedAt || null
    }
    
    const checkForUpdates = async () => {
      try {
        const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : '';
        const url = (BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/') + 'complete_email_templates.json?t=' + Date.now()
        
        const resp = await fetch(url, { cache: 'no-store' })
        if (!resp.ok) return
        
        const json = await resp.json()
        const remoteUpdatedAt = json?.metadata?.updatedAt || null
        
        // If timestamp changed, reload templates
        if (remoteUpdatedAt && remoteUpdatedAt !== lastKnownUpdatedAt.current) {
          console.log('[EA] Template update detected, reloading...', { old: lastKnownUpdatedAt.current, new: remoteUpdatedAt })
          lastKnownUpdatedAt.current = remoteUpdatedAt
          
          // Preserve current template selection
          const currentTemplateId = selectedTemplate?.id || null
          
          // Update templates data
          setTemplatesData(json)
          
          // Re-select the same template if it still exists
          if (currentTemplateId) {
            const stillExists = json.templates.find(t => t.id === currentTemplateId)
            if (stillExists) {
              setSelectedTemplate(stillExists)
              // Force rebuild variables for the updated template
              lastRebuiltTemplateId.current = null
            } else {
              // Template was deleted, clear selection
              setSelectedTemplate(null)
              console.log('[EA] Selected template was deleted')
            }
          }
        }
      } catch (e) {
        // Silently fail - polling shouldn't disrupt user experience
        if (debug) console.warn('[EA][Debug] Update check failed:', e)
      }
    }
    
    // Poll every 30 seconds
    const interval = setInterval(checkForUpdates, 30000)
    
    return () => clearInterval(interval)
  }, [templatesData, selectedTemplate, debug])

  // Auto-select first template after load to avoid "no template" UX if user hasn't picked one
  useEffect(() => {
    if (!loading || selectedTemplate || !templatesData?.templates?.length) return
    if (!selectedTemplateId) {
      if (debug) console.log('[EA][Debug] Template load complete without saved selection; awaiting user pick')
      return
    }
    const templateToSelect = templatesData.templates.find(t => t.id === selectedTemplateId)
    if (!templateToSelect) {
      if (debug) console.warn('[EA][Debug] Saved template id not found in catalog:', selectedTemplateId)
      return
    }
    setSelectedTemplate(templateToSelect)
    if (debug) console.log('[EA][Debug] Auto-selected restored template:', templateToSelect.id)
  }, [loading, templatesData, selectedTemplate, selectedTemplateId, debug])

  /**
   * URL PARAMETER SUPPORT FOR DEEP LINK SHARING
   */
  useEffect(() => {
    if (!templatesData) return
    
    // Read current URL parameters
    const params = new URLSearchParams(window.location.search)
    const templateId = params.get('id')
    const langParam = params.get('lang')
    
    // Apply language from URL if specified and valid
    if (langParam && ['fr', 'en'].includes(langParam)) {
      setTemplateLanguage(langParam)
      setInterfaceLanguage(langParam)
    }
    
    // Pre-select template from URL
    if (templateId) {
      const template = templatesData.templates.find(t => t.id === templateId)
      if (template) {
        setSelectedTemplate(template)
      }
    }
  }, [templatesData]) // Triggers when templates are loaded

  /**
   * REBUILD VARIABLES WHEN TEMPLATE CHANGES
   * Ensures popout receives correct variables for the selected template
   */
  const lastRebuiltTemplateId = useRef(null)
  useEffect(() => {
    if (!selectedTemplate || !templatesData) return
    
    // Only rebuild if template actually changed (avoid rebuilding on every re-render)
    if (lastRebuiltTemplateId.current === selectedTemplate.id) return
    lastRebuiltTemplateId.current = selectedTemplate.id
    
    // Rebuild variables with the new template's variable list
    const newVariables = buildInitialVariables(selectedTemplate, templatesData, templateLanguage)
    variablesRef.current = newVariables
    setVariables(newVariables)
    
    if (debug) console.log('[EA][Debug] Rebuilt variables for template:', selectedTemplate.id, 'vars:', Object.keys(newVariables).slice(0, 5))
    
    // Notify popout if BroadcastChannel is available (popout listens on this channel)
    setTimeout(() => {
      try {
        const channel = popoutChannelRef.current
        if (channel) {
          channel.postMessage({
            type: 'variablesUpdated',
            variables: newVariables,
            templateId: selectedTemplate.id,
            templateLanguage: templateLanguageRef.current || templateLanguage,
            sender: popoutSenderIdRef.current
          })
          if (debug) console.log('[EA][Debug] Notified popout of new template variables via BroadcastChannel')
        }
      } catch (e) {
        if (debug) console.error('Failed to notify popout:', e)
      }
    }, 100)
  }, [selectedTemplate, templatesData, templateLanguage, debug])

  /**
   * KEYBOARD SHORTCUTS FOR PROFESSIONAL UX
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter: Copy all (main quick action)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        if (selectedTemplate) {
          copyToClipboard('all')
        }
        return
      }
      
      // Ctrl/Cmd + J: Copy subject only
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault()
        if (selectedTemplate) {
          copyToClipboard('subject')
        }
      }
      
      // Ctrl/Cmd + Shift + Enter: Open plain-text compose draft
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter') {
        e.preventDefault()
        if (selectedTemplate) {
          composePlainTextEmailDraft()
        }
      }
  // (Removed stray conditional referencing undefined variables from earlier experimental code)
      // Ctrl/Cmd + /: Focus on search (search shortcut)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        if (searchRef.current) {
          searchRef.current.focus()
        }
      }
      
      // Variables popup keyboard shortcuts (only when popup is open)
      if (showVariablePopup && selectedTemplate) {
        // Escape: Minimize variables popup
        if (e.key === 'Escape') {
          e.preventDefault()
          setVarsMinimized(true)
        }
        
        // Ctrl/Cmd + Enter: Close and apply variables
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          setShowVariablePopup(false)
        }
        
        // Ctrl/Cmd + R: Reset all fields to examples
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
          e.preventDefault()
          if (templatesData) {
            const initialVars = buildInitialVariables(selectedTemplate, templatesData, templateLanguage)
            setVariables(prev => {
              const next = applyAssignments(prev, initialVars)
              if (next !== prev) {
                variablesRef.current = next
              }
              return next
            })
          }
        }
        
        // Ctrl/Cmd + Shift + V: Smart paste
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'v') {
          e.preventDefault()
          const clip = (navigator.clipboard && navigator.clipboard.readText) ? navigator.clipboard.readText() : Promise.resolve('')
          clip.then(text => handleVarsSmartPaste(text || ''))
        }
      }
    }

    // Attach keyboard events globally
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedTemplate, showVariablePopup, templatesData, variables, handleVarsSmartPaste])
  


  // Filter templates based on search and category
  // Advanced search with exact-first + conservative fuzzy, bilingual fields, synonyms, AND/OR, quoted phrases and match highlighting
  const debouncedSearchQuery = useDebounce(searchQuery, 150)

  // Memoize search results for performance
  const { filteredTemplates, searchMatchMap, getMatchRanges, renderHighlighted: renderHighlightedFromHook } = useTemplateSearch(
    templatesData,
    debouncedSearchQuery,
    selectedCategory,
    favorites,
    favoritesOnly
  )

  const renderHighlighted = useCallback((text, key) => {
    const ranges = getMatchRanges(key, text)
    return renderHighlightedFromHook(text, ranges)
  }, [getMatchRanges, renderHighlightedFromHook])

  const handleTemplateSelect = useCallback((templateId) => {
    const template = templatesData?.templates.find(t => t.id === templateId)
    if (!template) return
    setSelectedTemplate(template)
    setSelectedTemplateId(templateId)
    const lang = templateLanguageRef.current || templateLanguage
    setTemplateLanguage(lang)
    // Reset variables to avoid stale data
    setVariables({})
    // Clear focused variable on new template select
    setFocusedVar(null)
    // Close variable popup if open
    setShowVariablePopup(false)
    // Scroll to top on new template load
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [templatesData, setSelectedTemplate, setSelectedTemplateId, setTemplateLanguage, setVariables, setFocusedVar, setShowVariablePopup])

  // Render variable input fields based on template and language
  const renderVariableInputs = useCallback(() => {
    if (!selectedTemplate) return null
    const varNames = Array.isArray(selectedTemplate.variables) ? selectedTemplate.variables : []
    if (!varNames.length) return null

    return varNames.map((varName) => {
      const key = varName
      const value = variables[key] || ''
      const isFilled = value !== '' && value !== undefined
      const isFocused = focusedVar === key

      return (
        <div key={key} className="flex items-center gap-2 py-2">
          <div className="flex-1">
            <Label htmlFor={key} className="text-sm font-medium">
              {key}
            </Label>
            <div className="relative">
              <Input
                id={key}
                value={value}
                onChange={(e) => {
                  const newValue = e.target.value
                  setVariables((prev) => ({ ...prev, [key]: newValue }))
                  // Update focus highlight immediately on change
                  if (isFocused) {
                    updateFocusHighlight(key)
                  }
                }}
                onFocus={() => setFocusedVar(key)}
                onBlur={() => {
                  setFocusedVar(null)
                  // Optionally, sync back to pills on blur
                  // syncFromText()
                                                             }}
                className={`pr-10 ${isFilled ? 'bg-muted' : ''}`}
                placeholder={`Enter value for ${key}`}
                spellCheck="false"
                autoComplete="off"
              />
              {isFilled && (
                <Button
                  variant="icon"
                  size="icon"
                  onClick={() => {
                    setVariables((prev) => ({ ...prev, [key]: '' }))
                    // Clear focus highlight on clear
                    if (isFocused) {
                      updateFocusHighlight(key)
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  title="Clear variable"
                >
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )
    })
  }, [selectedTemplate, variables, focusedVar, updateFocusHighlight])

  // Debugging and development tools
  if (debug) {
    window.__EA__ = {
      variables: () => ({ ...variables }),
      templatesData: () => ({ ...templatesData }),
      selectedTemplate: () => ({ ...selectedTemplate }),
      setVariables: (newVars) => setVariables((prev) => ({ ...prev, ...newVars })),
      resetVariables: () => setVariables({}),
      setSelectedTemplate: (id) => {
        const template = templatesData?.templates.find(t => t.id === id)
        if (template) {
          setSelectedTemplate(template)
          setSelectedTemplateId(id)
          setTemplateLanguage(templateLanguageRef.current || templateLanguage)
        }
      },
      debugLog: (msg) => console.log('[EA Debug]', msg),
      debugError: (err) => console.error('[EA Error]', err),
    }
  }

  return (
    <TooltipProvider>
      <div className="h-screen w-screen bg-background text-foreground flex flex-col">
        {/* Header */}
        <header className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <span className="text-muted-foreground">{t.subtitle}</span>
          </div>
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setShowAIPanel(!showAIPanel)}>
                  <Bot className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI Assistant</p>
              </TooltipContent>
            </Tooltip>
            <Select value={interfaceLanguage} onValueChange={setInterfaceLanguage}>
              <SelectTrigger className="w-[180px]">
                <Languages className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t.interfaceLanguage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-grow flex">
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* Left Panel: Templates */}
            <ResizablePanel defaultSize={35} minSize={20}>
              <div className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">{t.selectTemplate}</h2>
                  <Badge variant="secondary">{filteredTemplates.length} {t.templatesCount}</Badge>
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t.searchPlaceholder}
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={t.allCategories} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {t.categories[cat] || cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ScrollArea className="flex-grow">
                  <div className="space-y-2">
                    {filteredTemplates.map(template => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer hover:bg-muted/50 ${selectedTemplate?.id === template.id ? 'border-primary' : ''}`}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                          <p><strong>{t.subject}:</strong> {template.subject[templateLanguage] || template.subject.fr}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Center Panel: Editor */}
            <ResizablePanel defaultSize={65} minSize={30}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70} minSize={50} onResize={handleEditorResize}>
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">{t.editEmail}</h2>
                      <div className="flex items-center gap-2">
                        <Select value={templateLanguage} onValueChange={setTemplateLanguage}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t.templateLanguage} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleCopyToClipboard}>
                              {isCopied ? <ClipboardCheck className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-5" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy to Clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleClearEditor}>
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Clear Editor</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="subject" className="text-sm font-medium">{t.subject}</label>
                      <Input
                        id="subject"
                        ref={subjectEditorRef}
                        value={finalSubject}
                        onChange={(e) => setFinalSubject(e.target.value)}
                      />
                    </div>
                    <div className="flex-grow" style={{ height: `${editorHeight}px` }}>
                      {isRichText
                        ? (
                          <RichTextPillEditor
                            initialValue={finalBody}
                            onChange={setFinalBody}
                            variableAssignments={variables}
                            variables={variables}
                            templateLanguage={templateLanguage}
                          />
                          )
                        : (
                          <SimplePillEditor
                            value={finalBody}
                            onChange={setFinalBody}
                            variableAssignments={variables}
                            onVariableChange={handleInlineVariableChange}
                            variables={variables}
                            templateLanguage={templateLanguage}
                          />
                          )}
                    </div>
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Bottom Panel: Variables */}
                <ResizablePanel defaultSize={30} minSize={10} collapsible>
                  <div className="p-4 h-full">
                    <div
                      className="flex items-center justify-between cursor-pointer mb-4"
                      onClick={() => setIsVariablesOpen(!isVariablesOpen)}
                    >
                      <h2 className="text-lg font-semibold">{t.variables}</h2>
                      {isVariablesOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                    </div>
                    {isVariablesOpen && (
                      <ScrollArea className="h-[calc(100%-2rem)]">
                        {renderVariableInputs()}
                      </ScrollArea>
                    )}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            {/* Right Panel: AI Sidebar */}
            {showAIPanel && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={25} minSize={15} collapsible>
                  <AISidebar
                    subject={finalSubject}
                    body={finalBody}
                    variables={variables}
                    template={selectedTemplate}
                    language={templateLanguage}
                    onUpdateContent={({ subject, body }) => {
                      setFinalSubject(subject)
                      setFinalBody(body)
                    }}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
        <Toaster />
      </div>
    </TooltipProvider>
  )
}

export default App
