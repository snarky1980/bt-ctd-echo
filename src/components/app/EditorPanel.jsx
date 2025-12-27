import React from 'react'
import { Button } from '../ui/button'
import SimplePillEditor from '../SimplePillEditor'
import RichTextPillEditor from '../RichTextPillEditor'
import { RotateCcw, Copy } from 'lucide-react'

export function EditorPanel({
  selectedTemplate,
  templateLanguage,
  setTemplateLanguage,
  finalSubject,
  setFinalSubject,
  finalBody,
  setFinalBody,
  handleResetClick,
  copyToClipboard,
  t,
}) {
  if (!selectedTemplate) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        {t.noTemplate}
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t.editEmail}</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm">{t.templateLanguage}</span>
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setTemplateLanguage('fr')}
              className={`px-3 py-1 text-sm font-semibold rounded-md ${templateLanguage === 'fr' ? 'bg-white shadow' : ''}`}
            >
              FR
            </button>
            <button
              onClick={() => setTemplateLanguage('en')}
              className={`px-3 py-1 text-sm font-semibold rounded-md ${templateLanguage === 'en' ? 'bg-white shadow' : ''}`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
      <div>
        <label className="font-semibold">{t.subject}</label>
        <SimplePillEditor
          value={finalSubject}
          onChange={setFinalSubject}
        />
      </div>
      <div>
        <label className="font-semibold">{t.body}</label>
        <RichTextPillEditor
          value={finalBody}
          onChange={setFinalBody}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={handleResetClick}>
          <RotateCcw className="mr-2 h-4 w-4" /> {t.reset}
        </Button>
        <Button onClick={() => copyToClipboard('all')}>
          <Copy className="mr-2 h-4 w-4" /> {t.copyAll}
        </Button>
      </div>
    </div>
  )
}
