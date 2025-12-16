import React from 'react'
import { Star } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardHeader, CardTitle } from '../ui/card'

export function TemplateList({
  filteredTemplates,
  searchMatchMap,
  renderHighlighted,
  getCategoryLabel,
  getCategoryBadgeStyle,
  isFav,
  toggleFav,
  setSelectedTemplate,
  selectedTemplate,
  interfaceLanguage,
  t,
}) {
  const getMatchRanges = (templateId, field) => {
    return searchMatchMap[templateId]?.[field] || []
  }

  return (
    <div className="p-4">
      {filteredTemplates.map((template) => (
        <Card
          key={template.id}
          className={`mb-4 cursor-pointer ${selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedTemplate(template)}
        >
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  {renderHighlighted(template.title[interfaceLanguage], getMatchRanges(template.id, `title.${interfaceLanguage}`))}
                </h3>
                <p className="text-sm text-gray-500">
                  {renderHighlighted(template.description[interfaceLanguage], getMatchRanges(template.id, `description.${interfaceLanguage}`))}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleFav(template.id); }}>
                <Star className={isFav(template.id) ? 'text-yellow-400 fill-current' : 'text-gray-400'} />
              </Button>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge style={getCategoryBadgeStyle(template.category)}>
                {getCategoryLabel(template.category)}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
