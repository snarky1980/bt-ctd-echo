// Navy text color used throughout the app
export const NAVY_TEXT = '#1c2f4a'

// Category badge styles
export const CATEGORY_BADGE_STYLES = {
  quotes_and_approvals: { bg: '#ede9fe', border: '#c4b5fd', text: NAVY_TEXT },
  follow_ups_and_cancellations: { bg: '#ffe4e6', border: '#fecdd3', text: NAVY_TEXT },
  documents_and_formatting: { bg: '#e0f2fe', border: '#bae6fd', text: NAVY_TEXT },
  deadlines_and_delivery: { bg: '#ffedd5', border: '#fdba74', text: NAVY_TEXT },
  clarifications_and_client_instructions: { bg: '#fef3c7', border: '#fde68a', text: NAVY_TEXT },
  security_and_copyright: { bg: '#fee2e2', border: '#fecaca', text: NAVY_TEXT },
  quality_assurance: { bg: '#dcfce7', border: '#bbf7d0', text: NAVY_TEXT },
  terminology_and_glossaries: { bg: '#cffafe', border: '#a5f3fc', text: NAVY_TEXT },
  revisions_and_feedback: { bg: '#fae8ff', border: '#f0abfc', text: NAVY_TEXT },
  team_coordination: { bg: '#e0e7ff', border: '#c7d2fe', text: NAVY_TEXT },
  technical_issues: { bg: '#ccfbf1', border: '#99f6e4', text: NAVY_TEXT },
  general_inquiries: { bg: '#f1f5f9', border: '#cbd5e1', text: NAVY_TEXT },
  default: { bg: '#e6f0ff', border: '#c7dbff', text: NAVY_TEXT }
}

export const getCategoryBadgeStyle = (category = '', customColors = {}) => {
  // If custom color exists, generate dynamic style
  if (customColors[category]) {
    const baseColor = customColors[category]
    return {
      bg: baseColor + '20',  // 20% opacity for background
      border: baseColor + '80',  // 80% opacity for border
      text: baseColor
    }
  }
  // Fall back to predefined styles
  return CATEGORY_BADGE_STYLES[category] || CATEGORY_BADGE_STYLES.default
}

// Custom CSS for modern typography and variable highlighting with the EXACT original teal/sage styling
export const customEditorStyles = `
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
