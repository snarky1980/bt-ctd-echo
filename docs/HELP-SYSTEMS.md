# Help Systems Documentation

## Overview

ECHO has two separate help systems designed for different user audiences:

1. **Main App Help Center** - For end users creating emails from templates
2. **Admin Console Help Modal** - For administrators managing email templates

These systems are intentionally separated to maintain clear boundaries between user and admin interfaces.

---

## Main Application Help Center

**Location**: `src/components/HelpCenter.jsx`

**Access**: Users click the "?" help icon in the main application interface

**Audience**: End users who are:
- Selecting and using email templates
- Filling in variables
- Copying content to their email clients
- Using the M365 Copilot assistant features

### Content Sections

1. **Quick Start** - Step-by-step guide to create an email in under a minute
2. **M365 Copilot Assistant** - How to use the AI enhancement features
3. **Variables & Pills** - Understanding the variable system and real-time editing
4. **Detached Window (Popout)** - Using the variables panel in a separate window
5. **Copying & Sending** - Different methods to copy and send emails
6. **Favorites** - Managing favorite templates
7. **Keyboard Shortcuts** - Power user shortcuts
8. **Privacy & Storage** - Data handling and local storage
9. **FAQ** - Common questions with detailed answers
10. **Troubleshooting** - Solutions to common issues
11. **Contact Form** - Multi-category support request system

### Key Features

- **Bilingual**: Full French and English translations
- **Contact Form**: Integrated support request system with categories:
  - Support (access, permissions, guidance)
  - Glitch (bugs, broken features)
  - Improvement (feature suggestions)
  - Template submission (new template requests)
- **No Admin References**: Intentionally excludes any mention of the admin console to maintain user focus

### Important Notes

⚠️ **NO ADMIN CONSOLE REFERENCES**: The main app help must never mention:
- Admin console
- Template management
- Publishing workflows
- GitHub integration
- Admin-specific features

Users should only see information relevant to *using* templates, not managing them.

---

## Admin Console Help Modal

**Location**: `admin-simple.html` (inline modal) + `assets/admin-simple.js` (trigger)

**Access**: Administrators click the "Aide" button in the admin console topbar

**Audience**: Administrators who are:
- Creating and editing email templates
- Managing categories and variables
- Publishing changes to production
- Importing/exporting template data

### Content Sections

1. **🚀 Prise en main rapide** - 6-step quickstart for admin workflow
2. **✨ Formatage riche du texte** - Complete guide to HTML formatting features
   - Basic formatting (bold, italic, underline, strikethrough)
   - Headings (H1, H2, H3)
   - Lists (bullet and numbered)
   - Colors (text color and highlighting with preset menus)
   - Variable preservation in formatted text
3. **📝 Variables dynamiques** - Variable syntax, detection, and management
4. **💾 Gestion des données** - Data management features:
   - Import (JSON/Excel)
   - Export Excel
   - Download JSON
   - Reload from GitHub
   - Publish to GitHub
5. **🎨 Catégories et organisation** - Category management and color coding
6. **🔐 Sécurité et stockage** - Security model and local storage behavior
7. **⚠️ Bonnes pratiques** - Best practices for template management
8. **🐛 Dépannage** - Troubleshooting with expandable details sections

### Key Features

- **In-Modal Design**: Opens as a styled modal overlay, no separate window
- **French Only**: Admin console is primarily for internal team use
- **Comprehensive**: Covers all admin features including:
  - Rich text toolbar usage
  - Color picker dropdowns
  - GitHub publishing workflow
  - Variable detection and sync
  - Import/export workflows
  - Category management
- **Visual Hierarchy**: Uses icons, colored sections, and expandable details for easy scanning
- **Practical Examples**: Includes code examples for variable syntax

### Implementation Details

**HTML Structure** (`admin-simple.html`):
```html
<div id="modal-help" style="display:none;...">
  <div class="modal-panel">
    <div class="modal-header">
      <strong>📚 Guide d'utilisation – Console d'administration ECHO</strong>
      <button onclick="...">×</button>
    </div>
    <div class="modal-body">
      <!-- Comprehensive help content -->
    </div>
    <div class="modal-footer">
      <button class="btn primary">Fermer</button>
    </div>
  </div>
</div>
```

**JavaScript Trigger** (`assets/admin-simple.js`):
```javascript
function openHelpModal(){
  const modal = document.getElementById('modal-help');
  if (modal) modal.style.display = 'flex';
}
if (btnHelp) btnHelp.onclick = openHelpModal;
```

---

## Design Principles

### Separation of Concerns

1. **No Cross-References**
   - Main app help never mentions admin features
   - Admin help never links to main app help
   - Each system is self-contained

2. **Audience-Specific Content**
   - Main app: "How do I use this template?"
   - Admin: "How do I create and manage templates?"

3. **Different Interaction Models**
   - Main app: Full React component with contact form
   - Admin: Inline HTML modal with simpler interaction

### Content Strategy

**Main App Help Should Cover**:
- Using templates to create emails
- Understanding variables and pills
- Copying content to email clients
- Using Copilot AI features
- Managing favorites
- Keyboard shortcuts
- Troubleshooting user-facing issues

**Main App Help Should NOT Cover**:
- Creating or editing templates
- Publishing workflows
- Admin authentication
- GitHub integration
- Template management tools

**Admin Help Should Cover**:
- Complete template creation workflow
- Rich text formatting features
- Variable management and syntax
- Import/export procedures
- Publishing to GitHub
- Category management
- Security model
- Backup strategies

**Admin Help Should NOT Cover**:
- End-user features like Copilot assistant
- How to use templates (that's for end users)
- User-facing troubleshooting

---

## Maintenance Guidelines

### Updating Main App Help

**File**: `src/components/HelpCenter.jsx`

1. Edit the `translations` object for FR/EN content
2. Maintain bilingual parity - all sections must have both languages
3. Test the contact form submission workflow
4. Verify keyboard shortcuts (Escape to close)
5. Ensure no admin console references are introduced

**When to Update**:
- New user-facing features added
- Keyboard shortcuts changed
- Troubleshooting patterns identified
- Contact form categories modified

### Updating Admin Console Help

**File**: `admin-simple.html` (search for `id="modal-help"`)

1. Edit the inline HTML within the modal
2. Maintain visual consistency with existing section styles
3. Use colored backgrounds for important sections:
   - Blue (`#e0f2fe`) for critical actions like GitHub publish
   - Red (`#fef2f2`) for warnings and best practices
   - Teal (`#f0fbfb`) for key feature explanations
4. Use `<details>` elements for troubleshooting sections

**When to Update**:
- New admin features added (e.g., new import formats)
- GitHub publishing workflow changes
- Rich text toolbar features modified
- Security model changes
- New best practices identified

### Testing Checklist

**Main App Help**:
- [ ] Opens with help button click
- [ ] Closes with Escape key
- [ ] Closes with close button
- [ ] All sections display properly in FR and EN
- [ ] Contact form validates required fields
- [ ] Contact form submits successfully
- [ ] No console errors
- [ ] Responsive on mobile devices
- [ ] No admin console references visible

**Admin Console Help**:
- [ ] Opens with "Aide" button click
- [ ] Closes with × button
- [ ] Modal overlay prevents interaction with background
- [ ] All sections visible without excessive scrolling
- [ ] Expandable details sections work
- [ ] Links use correct code formatting
- [ ] Color-coded sections display properly
- [ ] Modal centers properly on different screen sizes

---

## Future Enhancements

### Main App Help
- Add video tutorials for complex features
- Interactive guided tour for first-time users
- Search functionality within help content
- Usage analytics to identify confusing areas

### Admin Console Help
- Screenshot annotations for complex workflows
- Interactive demo mode showing features
- Validation checklist before publishing
- Link to developer documentation for advanced users

---

## Related Documentation

- [RICH_TEXT_FORMATTING_GUIDE.md](../RICH_TEXT_FORMATTING_GUIDE.md) - Technical details on rich text implementation
- [SYSTEM_STATUS.md](../SYSTEM_STATUS.md) - System architecture and deployment
- [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md) - Development setup and workflows
- [ADMIN-CSV-IMPORT-GUIDE.md](./ADMIN-CSV-IMPORT-GUIDE.md) - Import procedures

---

**Last Updated**: December 5, 2025
