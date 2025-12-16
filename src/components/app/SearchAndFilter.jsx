import React from 'react'
import { Star } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

export function SearchAndFilter({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  favoritesOnly,
  setFavoritesOnly,
  orderedCategories,
  getCategoryLabel,
  t,
}) {
  return (
    <div className="p-4 space-y-4">
      <Input
        placeholder={t.searchPlaceholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="flex items-center space-x-2">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder={t.allCategories} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allCategories}</SelectItem>
            {orderedCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={favoritesOnly ? 'secondary' : 'ghost'}
          onClick={() => setFavoritesOnly(!favoritesOnly)}
        >
          <Star className="mr-2 h-4 w-4" />
          {t.favorites}
        </Button>
      </div>
    </div>
  )
}
