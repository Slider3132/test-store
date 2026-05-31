import type { Dictionary } from './dictionary'

export const localizeVariantLabel = (
  label: string | undefined,
  productDictionary: Dictionary['product'],
) => {
  switch (label) {
    case 'Color':
    case 'Колір':
      return productDictionary.color
    case 'Size':
    case 'Розмір':
      return productDictionary.size
    case 'Black':
    case 'Чорний':
      return productDictionary.black
    case 'White':
    case 'Білий':
      return productDictionary.white
    case 'Small':
    case 'Малий':
      return productDictionary.small
    case 'Medium':
    case 'Середній':
      return productDictionary.medium
    case 'Large':
    case 'Великий':
      return productDictionary.large
    case 'X Large':
    case 'Дуже великий':
      return productDictionary.xlarge
    default:
      return label
  }
}
