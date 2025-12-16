# Rich Text Formatting Guide

## Overview
The ECHO Email Template system now supports full HTML rich text formatting in both the admin console and main application. Templates can include bold, italic, colors, highlights, lists, and other formatting that will be preserved throughout the system.

## Key Features

### Admin Console
- **Rich Text Editor**: Both Corps (FR) and Corps (EN) fields have rich text toolbars
- **Formatting Options**:
  - Text styling: Bold (B), Italic (I), Underline (U), Strikethrough (S)
  - Font size: Petit, Normal, Grand, Très grand
  - Font family: Arial, Times New Roman, Courier New, Georgia, Verdana
  - Text color and highlighting
  - Text alignment: Left, Center, Right
  - Lists: Bullet points and numbered lists
  - Clear formatting option

### Storage Format
- Templates are stored in `complete_email_templates.json`
- The `body.fr` and `body.en` fields contain HTML markup
- Plain text templates are automatically converted to HTML on load
- Variables like `<<ProjectNumber_FR>>` are preserved in the HTML

### Main Application
- Templates load with all formatting intact
- Rich text editor displays formatted content
- Variables work seamlessly within formatted text
- Export functions (PDF, Word, HTML) preserve formatting

## How It Works

### Loading Templates
1. **Plain text detection**: System checks if content contains HTML tags
2. **Automatic conversion**: Plain text with `\r\n` line breaks is converted to HTML paragraphs
3. **Variable preservation**: `<<variable_name>>` patterns are escaped and displayed correctly
4. **Paragraph creation**: Double line breaks (`\n\n`) create separate `<p>` tags

### Editing Templates
1. Open template in admin console
2. Use rich text toolbar to apply formatting
3. Variables remain functional throughout editing
4. Save/export stores HTML in JSON

### Variable Handling
- Variables are detected using pattern: `/<<[^>]+>>/g`
- In HTML display, angle brackets are escaped: `&lt;&lt;VarName&gt;&gt;`
- In JSON storage, variables are preserved as: `<<VarName>>`
- System strips language suffixes (`_FR`, `_EN`) for canonical variable names

## Technical Implementation

### Admin Console (`assets/admin-simple.js`)

**Key Functions:**
- `getBodyValue(el)`: Extracts HTML from contenteditable element
- `setBodyValue(el, val)`: Sets content, converting plain text to HTML if needed
- `detectPlaceholders(t)`: Finds all `<<variables>>` in template, decoding HTML entities

**Rich Text Toolbar** (`assets/rich-text-toolbar.js`):
- JavaScript class that creates formatting toolbar
- Uses `document.execCommand` for text formatting
- Automatically attaches to contenteditable elements

### Main Application (`src/components/RichTextPillEditor.jsx`)

**Key Functions:**
- `renderContent(text)`: Detects HTML vs plain text and renders accordingly
- Preserves HTML tags when detected
- Converts plain text to paragraphs when needed
- Maintains variable pill functionality in formatted text

### HTML Detection Logic
```javascript
const hasHtmlTags = /<(br|p|div|strong|b|i|u|span|ul|ol|li|h[1-6])[>\s]/i.test(text);
```

### Paragraph Conversion
```javascript
// Split on double newlines
const paragraphs = normalized.split(/\n\n+/);

// Escape HTML except variables
const varRegex = /<<[^>]+>>/g;
// ... escape text between variables ...
// Escape angle brackets in variables: < → &lt;, > → &gt;
```

## Best Practices

### Creating New Templates
1. Write content in the Corps fields
2. Use toolbar to add formatting as needed
3. Insert variables using `<<VariableName>>` syntax
4. Test in main app to verify appearance
5. Export JSON to save changes

### Editing Existing Templates
1. Load template in admin console
2. Paragraphs appear automatically
3. Variables display as `<<VariableName>>`
4. Apply additional formatting as desired
5. Export to save

### Variable Guidelines
- Use descriptive names: `<<ClientName>>` not `<<x>>`
- Canonical form removes language suffix: `client_name` (not `client_name_fr`)
- Variables work in subject and body fields
- Can appear anywhere in formatted text

## Migration from Plain Text

All existing plain text templates are automatically converted:
1. `\r\n\r\n` → New paragraph (`</p><p>`)
2. `\r\n` within paragraph → `<br>`
3. `<<Variables>>` → Properly escaped and displayed
4. No manual conversion needed

## Compatibility

### Backwards Compatible
- Old plain text templates load correctly
- Existing exports still work
- Variable system unchanged
- All features work with both HTML and plain text

### Forward Compatible
- New HTML templates work everywhere
- Formatting preserved in exports
- Main app displays HTML natively
- Admin console edits HTML directly

## Troubleshooting

### Variables Not Showing
- Check for proper `<<>>` syntax
- Verify no extra spaces inside brackets
- Ensure angle brackets aren't double-escaped

### Formatting Not Appearing
- Verify HTML tags are present in JSON
- Check browser console for errors
- Reload page to clear cache

### Paragraph Breaks Missing
- Ensure double line breaks in source (`\n\n`)
- Check split regex: `/\n\n+/`
- Verify paragraph tags in HTML output

## Files Modified

### Core Files
- `assets/admin-simple.js` - Admin console logic
- `assets/rich-text-toolbar.js` - Formatting toolbar
- `src/components/RichTextPillEditor.jsx` - Main app editor
- `admin-simple.html` - Admin console HTML

### Configuration
- `complete_email_templates.json` - Template storage

## Recent Commits
- `Store and display HTML formatting in templates`
- `Fix variable preservation when converting plain text to HTML`
- `Fix paragraph splitting for plain text templates`
- `Fix paragraph rendering and variable display`
- `Escape angle brackets in variables for proper display`

---

**Last Updated**: December 4, 2025  
**Status**: ✅ Fully implemented and deployed
