import { useMemo, useCallback } from 'react'
import { resolveVariableValue } from '../utils/variables.js'

export function useVariableProcessor(variablesRef, templateLanguage) {
  const replaceVariablesWithValues = useCallback((text, overrideValues) => {
    if (!text) return ''
    const sourceValues = overrideValues || variablesRef.current || {}
    const language = (templateLanguage || 'fr')
    return String(text ?? '').replace(/<<([^>]+)>>/g, (match, varName) => {
      const resolved = resolveVariableValue(sourceValues, varName, language)
      if (resolved === '__DELETED__') {
        return ''
      }
      if (resolved && resolved.trim().length) {
        return resolved
      }
      const direct = sourceValues[varName]
      if (direct !== undefined && direct !== null) {
        const asString = String(direct)
        if (asString === '__DELETED__') {
          return ''
        }
        if (asString.trim().length) return asString
      }
      return match
    })
  }, [templateLanguage, variablesRef])

  const replaceVariablesInHTML = (htmlText, values, fallbackPlainText = '') => {
    if (!htmlText) {
      return { html: '', text: fallbackPlainText || '' }
    }

    const ensureHtmlString = (input = '') => {
      const raw = String(input ?? '')
      if (!raw.trim()) return ''
      if (/[<>&]/.test(raw) && /<\/?[a-z]/i.test(raw)) {
        return raw
      }
      return String(raw)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\r\n|\r/g, '\n')
        .replace(/\n/g, '<br>')
    }

    const wrapper = document.createElement('div')
    wrapper.innerHTML = ensureHtmlString(htmlText)

    const makeOutlookFriendly = (element) => {
      element.querySelectorAll('*').forEach((el) => {
        if (['BR', 'HR'].includes(el.tagName)) return
        
        const computedStyle = window.getComputedStyle(el)
        let newStyle = ''
        
        const fontSize = computedStyle.fontSize
        if (fontSize && fontSize !== '16px' && fontSize !== '14px') {
          newStyle += `font-size: ${fontSize}; `
        }
        
        const color = computedStyle.color
        const colorRgb = color.replace(/\s/g, '')
        if (color && colorRgb !== 'rgb(0,0,0)' && colorRgb !== 'rgba(0,0,0,1)') {
          newStyle += `color: ${color}; `
        }
        
        const bgColor = computedStyle.backgroundColor
        const bgColorRgb = bgColor.replace(/\s/g, '')
        if (bgColor && 
            bgColorRgb !== 'rgba(0,0,0,0)' && 
            bgColorRgb !== 'transparent' && 
            bgColorRgb !== 'rgb(255,255,255)' && 
            bgColorRgb !== 'rgba(255,255,255,1)') {
          newStyle += `background-color: ${bgColor}; `
        }
        
        const fontWeight = computedStyle.fontWeight
        if (fontWeight && (fontWeight === 'bold' || parseInt(fontWeight) >= 700)) {
          newStyle += `font-weight: bold; `
        }
        
        const fontStyle = computedStyle.fontStyle
        if (fontStyle === 'italic') {
          newStyle += `font-style: italic; `
        }
        
        const textDecoration = computedStyle.textDecoration
        if (textDecoration && !textDecoration.includes('none')) {
          newStyle += `text-decoration: ${textDecoration}; `
        }
        
        const fontFamily = computedStyle.fontFamily
        if (fontFamily && fontFamily !== 'Arial' && !fontFamily.startsWith('-apple-system')) {
          newStyle += `font-family: ${fontFamily}; `
        }
        
        if (newStyle) {
          el.setAttribute('style', newStyle.trim())
        }
      })

      element.querySelectorAll('ul, ol').forEach((list) => {
        const currentStyle = list.getAttribute('style') || ''
        list.setAttribute('style', currentStyle + ' margin: 0; padding-left: 40px;')
      })

      element.querySelectorAll('li').forEach((li) => {
        const currentStyle = li.getAttribute('style') || ''
        li.setAttribute('style', currentStyle + ' margin: 0; padding: 0;')
      })
    }

    makeOutlookFriendly(wrapper)

    wrapper.querySelectorAll('br[data-line-break]').forEach((node) => {
      node.removeAttribute('data-line-break')
    })

    const cssEscape = (value = '') => {
      try {
        if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
          return CSS.escape(value)
        }
      } catch {}
      return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&')
    }

    const convertValueToHtml = (value = '') => {
      const raw = String(value ?? '')
      if (/<[a-z][\s\S]*>/i.test(raw)) {
        return raw.replace(/\r\n|\r/g, '\n').replace(/\n/g, '<br>')
      }
      return raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\r\n|\r/g, '\n')
        .replace(/\n/g, '<br>')
    }

    const stripPillMetadata = (element) => {
      if (!element || element.nodeType !== Node.ELEMENT_NODE) return
      element.classList?.remove('var-pill', 'filled', 'empty', 'focused')
      if (element.classList && element.classList.length === 0) {
        element.removeAttribute('class')
      }
      const attrsToRemove = ['data-var', 'data-value', 'data-display', 'data-template', 'contenteditable', 'spellcheck']
      attrsToRemove.forEach(attr => element.removeAttribute(attr))
      Array.from(element.children || []).forEach(stripPillMetadata)
    }

    const setCloneContent = (target, htmlString = '') => {
      target.innerHTML = ''
      if (!htmlString) return
      const frag = document.createRange().createContextualFragment(htmlString)
      target.appendChild(frag)
    }

    const PILL_TEMPLATE_TOKEN = '__RT_PILL_VALUE__'

    Object.entries(values || {}).forEach(([varName, value]) => {
      const nodes = wrapper.querySelectorAll(`[data-var="${cssEscape(varName)}"]`)
      nodes.forEach((node) => {
        const replacementValue = (value !== undefined && value !== null && String(value).length)
          ? String(value)
          : `<<${varName}>>`
        const placeholder = `<<${varName}>>`
        
        const pillClone = node.cloneNode(false)
        
        const injectAndReplace = (htmlString) => {
          setCloneContent(pillClone, htmlString)
          stripPillMetadata(pillClone)
          node.replaceWith(pillClone)
        }
        
        const template = node.getAttribute('data-template') || node.dataset?.template
        if (template && replacementValue !== placeholder) {
          const sanitized = convertValueToHtml(replacementValue)
          const applied = template.replace(PILL_TEMPLATE_TOKEN, sanitized)
          injectAndReplace(applied)
        } else if (node.innerHTML && replacementValue !== placeholder) {
          injectAndReplace(node.innerHTML)
        } else {
          pillClone.textContent = replacementValue
          stripPillMetadata(pillClone)
          node.replaceWith(pillClone)
        }
      })
    })

    makeOutlookFriendly(wrapper)

    const htmlResult = wrapper.innerHTML

    if (fallbackPlainText) {
      return { html: htmlResult, text: fallbackPlainText }
    }

    const plainText = wrapper.innerText.replace(/\r\n/g, '\n')

    return { html: htmlResult, text: plainText }
  }

  return { replaceVariablesWithValues, replaceVariablesInHTML }
}
