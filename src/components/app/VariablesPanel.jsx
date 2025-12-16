import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { ClipboardPaste } from 'lucide-react'

export function VariablesPanel({
  selectedTemplate,
  variables,
  setVariables,
  handleVarsSmartPaste,
  varInputRefs,
  t,
}) {
  if (!selectedTemplate || !selectedTemplate.variables || selectedTemplate.variables.length === 0) {
    return null
  }

  return (
    <div className="w-1/3 p-4 border-l">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t.variables}</h2>
        <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.readText().then(handleVarsSmartPaste)}>
          <ClipboardPaste />
        </Button>
      </div>
      <div className="space-y-4">
        {selectedTemplate.variables.map((varName) => (
          <Card key={varName}>
            <CardHeader>
              <CardTitle>{varName}</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                ref={(el) => (varInputRefs.current[varName] = el)}
                value={variables[varName] || ''}
                onChange={(e) => setVariables({ ...variables, [varName]: e.target.value })}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
