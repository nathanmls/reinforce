#!/bin/bash

# Update imports from '../translations' to '@/translations'
find /Users/nathanmartins/Documents/Reinforce/website/reinforce/app -type f -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" | xargs grep -l "import.*translations.*from.*\.\.\/translations" | while read file; do
  sed -i '' 's/import { translations } from '\''\.\.\/translations'\''/import { translations } from '\''@\/translations'\''/g' "$file"
  echo "Updated: $file"
done

# Update imports from '../../translations' to '@/translations'
find /Users/nathanmartins/Documents/Reinforce/website/reinforce/app -type f -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" | xargs grep -l "import.*translations.*from.*\.\.\/\.\.\/translations" | while read file; do
  sed -i '' 's/import { translations } from '\''\.\.\/\.\.\/translations'\''/import { translations } from '\''@\/translations'\''/g' "$file"
  echo "Updated: $file"
done

# Update imports from './translations' to '@/translations'
find /Users/nathanmartins/Documents/Reinforce/website/reinforce/app -type f -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" | xargs grep -l "import.*translations.*from.*\./translations" | while read file; do
  sed -i '' 's/import { translations } from '\''\.\/translations'\''/import { translations } from '\''@\/translations'\''/g' "$file"
  echo "Updated: $file"
done

# Update imports from '@/app/translations' to '@/translations'
find /Users/nathanmartins/Documents/Reinforce/website/reinforce/app -type f -name "*.jsx" -o -name "*.tsx" -o -name "*.js" -o -name "*.ts" | xargs grep -l "import.*translations.*from.*@/app/translations" | while read file; do
  sed -i '' 's/import { translations } from '\''@\/app\/translations'\''/import { translations } from '\''@\/translations'\''/g' "$file"
  echo "Updated: $file"
done

echo "All translation imports have been updated!"
