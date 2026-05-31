import 'dotenv/config'

import configPromise from '@payload-config'
import sharp from 'sharp'
import { getPayload, type File, type Payload } from 'payload'

import { priceEnabledField, priceField } from '@/lib/currency'

type LocaleText = {
  ru: string
  uk: string
}

type ProductTypeKey = 'appliances' | 'clothing' | 'footwear'

type VariantOptionSeed = {
  label: LocaleText
  swatch?: string
  value: string
}

type ProductSeed = {
  attributes: Record<string, string>
  baseColorIndex: number
  category: ProductTypeKey
  description: LocaleText
  rating: number
  reviewCount: number
  slug: string
  title: LocaleText
}

type CategorySeed = {
  base: LocaleText
  description: LocaleText
  products: ProductSeed[]
  slug: string
  subcategory: {
    base: LocaleText
    description: LocaleText
    slug: string
    title: LocaleText
  }
  title: LocaleText
  type: ProductTypeKey
}

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const reuseExistingMedia = args.has('--reuse-media')
const updateHeader = !args.has('--skip-header')

const relationID = (id: number | string) => (typeof id === 'string' ? Number(id) : id)
const relationshipID = (value: unknown) => {
  if (typeof value === 'number' || typeof value === 'string') return relationID(value)
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: number | string }).id
    return id == null ? undefined : relationID(id)
  }
  return undefined
}

const productTypes: Record<
  ProductTypeKey,
  {
    attributes: Array<{
      inputType: 'boolean' | 'number' | 'select' | 'text'
      labels: LocaleText
      name: string
      options?: Array<{ label: LocaleText; value: string }>
      showInFilters?: boolean
    }>
    axes: Array<{
      affectsInventory?: boolean
      affectsMedia?: boolean
      name: keyof typeof variantOptions
    }>
    description: LocaleText
    slug: string
    title: LocaleText
  }
> = {
  appliances: {
    axes: [
      { affectsInventory: true, affectsMedia: true, name: 'color' },
      { affectsInventory: true, affectsMedia: false, name: 'appliance-power' },
    ],
    attributes: [
      {
        inputType: 'select',
        labels: { ru: 'Бренд', uk: 'Бренд' },
        name: 'brand',
        options: [
          { label: { ru: 'Nordic', uk: 'Nordic' }, value: 'nordic' },
          { label: { ru: 'Haus', uk: 'Haus' }, value: 'haus' },
          { label: { ru: 'Linea', uk: 'Linea' }, value: 'linea' },
        ],
      },
      {
        inputType: 'select',
        labels: { ru: 'Тип прибора', uk: 'Тип приладу' },
        name: 'applianceType',
        options: [
          { label: { ru: 'Кухня', uk: 'Кухня' }, value: 'kitchen' },
          { label: { ru: 'Уход', uk: 'Догляд' }, value: 'care' },
          { label: { ru: 'Дом', uk: 'Дім' }, value: 'home' },
        ],
      },
    ],
    description: {
      ru: 'Приборы: фото зависит от цвета, SKU и остатки зависят от цвета и мощности.',
      uk: 'Прилади: фото залежить від кольору, SKU і залишки залежать від кольору та потужності.',
    },
    slug: 'demo-appliances-type',
    title: { ru: 'Приборы', uk: 'Прилади' },
  },
  clothing: {
    axes: [
      { affectsInventory: true, affectsMedia: true, name: 'color' },
      { affectsInventory: true, affectsMedia: false, name: 'clothing-size' },
    ],
    attributes: [
      {
        inputType: 'select',
        labels: { ru: 'Материал', uk: 'Матеріал' },
        name: 'material',
        options: [
          { label: { ru: 'Хлопок', uk: 'Бавовна' }, value: 'cotton' },
          { label: { ru: 'Трикотаж', uk: 'Трикотаж' }, value: 'jersey' },
          { label: { ru: 'Флис', uk: 'Фліс' }, value: 'fleece' },
        ],
      },
      {
        inputType: 'select',
        labels: { ru: 'Посадка', uk: 'Посадка' },
        name: 'fit',
        options: [
          { label: { ru: 'Обычная', uk: 'Звичайна' }, value: 'regular' },
          { label: { ru: 'Оверсайз', uk: 'Оверсайз' }, value: 'oversize' },
          { label: { ru: 'Свободная', uk: 'Вільна' }, value: 'relaxed' },
        ],
      },
    ],
    description: {
      ru: 'Одежда: фото зависит от цвета, SKU и остатки зависят от цвета и размера.',
      uk: 'Одяг: фото залежить від кольору, SKU і залишки залежать від кольору та розміру.',
    },
    slug: 'demo-clothing-type',
    title: { ru: 'Одежда', uk: 'Одяг' },
  },
  footwear: {
    axes: [
      { affectsInventory: true, affectsMedia: true, name: 'color' },
      { affectsInventory: true, affectsMedia: false, name: 'shoe-size' },
    ],
    attributes: [
      {
        inputType: 'select',
        labels: { ru: 'Материал верха', uk: 'Матеріал верху' },
        name: 'upperMaterial',
        options: [
          { label: { ru: 'Кожа', uk: 'Шкіра' }, value: 'leather' },
          { label: { ru: 'Текстиль', uk: 'Текстиль' }, value: 'textile' },
          { label: { ru: 'Сетка', uk: 'Сітка' }, value: 'mesh' },
        ],
      },
      {
        inputType: 'select',
        labels: { ru: 'Назначение', uk: 'Призначення' },
        name: 'purpose',
        options: [
          { label: { ru: 'Город', uk: 'Місто' }, value: 'city' },
          { label: { ru: 'Бег', uk: 'Біг' }, value: 'running' },
          { label: { ru: 'Повседневная', uk: 'Повсякденна' }, value: 'casual' },
        ],
      },
    ],
    description: {
      ru: 'Обувь: фото зависит от цвета, SKU и остатки зависят от цвета и размера.',
      uk: 'Взуття: фото залежить від кольору, SKU і залишки залежать від кольору та розміру.',
    },
    slug: 'demo-footwear-type',
    title: { ru: 'Обувь', uk: 'Взуття' },
  },
}

const variantOptions = {
  'appliance-power': [
    { label: { ru: '700 W', uk: '700 W' }, value: '700w' },
    { label: { ru: '900 W', uk: '900 W' }, value: '900w' },
    { label: { ru: '1200 W', uk: '1200 W' }, value: '1200w' },
  ],
  'clothing-size': [
    { label: { ru: 'S', uk: 'S' }, value: 's' },
    { label: { ru: 'M', uk: 'M' }, value: 'm' },
    { label: { ru: 'L', uk: 'L' }, value: 'l' },
    { label: { ru: 'XL', uk: 'XL' }, value: 'xl' },
  ],
  color: [
    { label: { ru: 'Черный', uk: 'Чорний' }, swatch: '#111827', value: 'black' },
    { label: { ru: 'Молочный', uk: 'Молочний' }, swatch: '#f5f1e8', value: 'milk' },
    { label: { ru: 'Синий', uk: 'Синій' }, swatch: '#1d4ed8', value: 'blue' },
    { label: { ru: 'Оливковый', uk: 'Оливковий' }, swatch: '#556b2f', value: 'olive' },
    { label: { ru: 'Графит', uk: 'Графіт' }, swatch: '#374151', value: 'graphite' },
  ],
  'shoe-size': [
    { label: { ru: '40', uk: '40' }, value: '40' },
    { label: { ru: '41', uk: '41' }, value: '41' },
    { label: { ru: '42', uk: '42' }, value: '42' },
    { label: { ru: '43', uk: '43' }, value: '43' },
  ],
}

const variantTypeLabels: Record<keyof typeof variantOptions, LocaleText> = {
  'appliance-power': { ru: 'Мощность', uk: 'Потужність' },
  'clothing-size': { ru: 'Размер одежды', uk: 'Розмір одягу' },
  color: { ru: 'Цвет', uk: 'Колір' },
  'shoe-size': { ru: 'Размер обуви', uk: 'Розмір взуття' },
}

const catalog: CategorySeed[] = [
  {
    base: { ru: 'Одежда', uk: 'Одяг' },
    description: {
      ru: 'Базовая одежда для ежедневного гардероба.',
      uk: 'Базовий одяг для щоденного гардероба.',
    },
    slug: 'demo-clothing',
    subcategory: {
      base: { ru: 'Футболка', uk: 'Футболка' },
      description: {
        ru: 'Футболки, поло и легкий верх для повседневной носки.',
        uk: 'Футболки, поло і легкий верх для щоденного носіння.',
      },
      slug: 'demo-t-shirts',
      title: { ru: 'Футболки', uk: 'Футболки' },
    },
    title: { ru: 'Одежда', uk: 'Одяг' },
    type: 'clothing',
    products: [
      {
        attributes: { fit: 'regular', material: 'cotton' },
        baseColorIndex: 0,
        category: 'clothing',
        description: {
          ru: 'Плотная базовая футболка из хлопка для ежедневных образов.',
          uk: 'Щільна базова футболка з бавовни для щоденних образів.',
        },
        rating: 4.7,
        reviewCount: 34,
        slug: 'demo-basic-tee',
        title: { ru: 'Базовая футболка Core', uk: 'Базова футболка Core' },
      },
      {
        attributes: { fit: 'oversize', material: 'cotton' },
        baseColorIndex: 1,
        category: 'clothing',
        description: {
          ru: 'Свободная футболка oversize с мягкой линией плеча.',
          uk: 'Вільна футболка oversize з мʼякою лінією плеча.',
        },
        rating: 4.8,
        reviewCount: 41,
        slug: 'demo-oversize-tee',
        title: { ru: 'Oversize футболка Soft', uk: 'Oversize футболка Soft' },
      },
      {
        attributes: { fit: 'regular', material: 'jersey' },
        baseColorIndex: 2,
        category: 'clothing',
        description: {
          ru: 'Поло из плотного трикотажа для спокойного smart casual.',
          uk: 'Поло зі щільного трикотажу для спокійного smart casual.',
        },
        rating: 4.6,
        reviewCount: 22,
        slug: 'demo-polo-knit',
        title: { ru: 'Трикотажное поло Line', uk: 'Трикотажне поло Line' },
      },
      {
        attributes: { fit: 'relaxed', material: 'jersey' },
        baseColorIndex: 3,
        category: 'clothing',
        description: {
          ru: 'Лонгслив relaxed fit для прохладных дней.',
          uk: 'Лонгслів relaxed fit для прохолодних днів.',
        },
        rating: 4.5,
        reviewCount: 19,
        slug: 'demo-relaxed-longsleeve',
        title: { ru: 'Лонгслив Relaxed', uk: 'Лонгслів Relaxed' },
      },
      {
        attributes: { fit: 'relaxed', material: 'fleece' },
        baseColorIndex: 4,
        category: 'clothing',
        description: {
          ru: 'Мягкое худи из флиса для города и поездок.',
          uk: 'Мʼяке худі з флісу для міста й подорожей.',
        },
        rating: 4.9,
        reviewCount: 56,
        slug: 'demo-fleece-hoodie',
        title: { ru: 'Флисовое худи Urban', uk: 'Флісове худі Urban' },
      },
    ],
  },
  {
    base: { ru: 'Обувь', uk: 'Взуття' },
    description: {
      ru: 'Городская и спортивная обувь для ежедневного ритма.',
      uk: 'Міське та спортивне взуття для щоденного ритму.',
    },
    slug: 'demo-footwear',
    subcategory: {
      base: { ru: 'Кроссовки', uk: 'Кросівки' },
      description: {
        ru: 'Кроссовки для города, бега и повседневных комплектов.',
        uk: 'Кросівки для міста, бігу і повсякденних комплектів.',
      },
      slug: 'demo-sneakers',
      title: { ru: 'Кроссовки', uk: 'Кросівки' },
    },
    title: { ru: 'Обувь', uk: 'Взуття' },
    type: 'footwear',
    products: [
      {
        attributes: { purpose: 'running', upperMaterial: 'mesh' },
        baseColorIndex: 1,
        category: 'footwear',
        description: {
          ru: 'Легкие беговые кроссовки с дышащим верхом.',
          uk: 'Легкі бігові кросівки з дихаючим верхом.',
        },
        rating: 4.8,
        reviewCount: 48,
        slug: 'demo-running-sneaker',
        title: { ru: 'Беговые кроссовки Aero', uk: 'Бігові кросівки Aero' },
      },
      {
        attributes: { purpose: 'city', upperMaterial: 'leather' },
        baseColorIndex: 0,
        category: 'footwear',
        description: {
          ru: 'Минималистичные кожаные кроссовки для города.',
          uk: 'Мінімалістичні шкіряні кросівки для міста.',
        },
        rating: 4.7,
        reviewCount: 31,
        slug: 'demo-leather-city-sneaker',
        title: { ru: 'Кожаные кроссовки City', uk: 'Шкіряні кросівки City' },
      },
      {
        attributes: { purpose: 'casual', upperMaterial: 'textile' },
        baseColorIndex: 2,
        category: 'footwear',
        description: {
          ru: 'Повседневная пара с мягкой посадкой и текстильным верхом.',
          uk: 'Повсякденна пара з мʼякою посадкою і текстильним верхом.',
        },
        rating: 4.5,
        reviewCount: 27,
        slug: 'demo-casual-textile-sneaker',
        title: { ru: 'Текстильные кроссовки Daily', uk: 'Текстильні кросівки Daily' },
      },
      {
        attributes: { purpose: 'running', upperMaterial: 'mesh' },
        baseColorIndex: 3,
        category: 'footwear',
        description: {
          ru: 'Спортивная модель с устойчивой подошвой.',
          uk: 'Спортивна модель зі стабільною підошвою.',
        },
        rating: 4.6,
        reviewCount: 36,
        slug: 'demo-sport-stable-sneaker',
        title: { ru: 'Спортивные кроссовки Track', uk: 'Спортивні кросівки Track' },
      },
      {
        attributes: { purpose: 'city', upperMaterial: 'leather' },
        baseColorIndex: 4,
        category: 'footwear',
        description: {
          ru: 'Премиальная городская модель с лаконичным силуэтом.',
          uk: 'Преміальна міська модель з лаконічним силуетом.',
        },
        rating: 4.9,
        reviewCount: 44,
        slug: 'demo-premium-city-sneaker',
        title: { ru: 'Премиальные кроссовки Mono', uk: 'Преміальні кросівки Mono' },
      },
    ],
  },
  {
    base: { ru: 'Приборы', uk: 'Прилади' },
    description: {
      ru: 'Небольшие домашние приборы для кухни и ежедневного ухода.',
      uk: 'Невеликі домашні прилади для кухні та щоденного догляду.',
    },
    slug: 'demo-appliances',
    subcategory: {
      base: { ru: 'Кухонный прибор', uk: 'Кухонний прилад' },
      description: {
        ru: 'Кухонные приборы с понятными характеристиками и конфигурациями.',
        uk: 'Кухонні прилади зі зрозумілими характеристиками та конфігураціями.',
      },
      slug: 'demo-kitchen-appliances',
      title: { ru: 'Кухонные приборы', uk: 'Кухонні прилади' },
    },
    title: { ru: 'Приборы', uk: 'Прилади' },
    type: 'appliances',
    products: [
      {
        attributes: { applianceType: 'kitchen', brand: 'nordic' },
        baseColorIndex: 0,
        category: 'appliances',
        description: {
          ru: 'Компактный блендер для смузи, соусов и быстрых завтраков.',
          uk: 'Компактний блендер для смузі, соусів і швидких сніданків.',
        },
        rating: 4.7,
        reviewCount: 29,
        slug: 'demo-compact-blender',
        title: { ru: 'Компактный блендер Nordic', uk: 'Компактний блендер Nordic' },
      },
      {
        attributes: { applianceType: 'kitchen', brand: 'haus' },
        baseColorIndex: 1,
        category: 'appliances',
        description: {
          ru: 'Электрочайник с лаконичным корпусом и быстрым нагревом.',
          uk: 'Електрочайник з лаконічним корпусом і швидким нагрівом.',
        },
        rating: 4.6,
        reviewCount: 25,
        slug: 'demo-electric-kettle',
        title: { ru: 'Электрочайник Haus', uk: 'Електрочайник Haus' },
      },
      {
        attributes: { applianceType: 'kitchen', brand: 'linea' },
        baseColorIndex: 2,
        category: 'appliances',
        description: {
          ru: 'Тостер на две секции с аккуратным управлением.',
          uk: 'Тостер на дві секції з акуратним керуванням.',
        },
        rating: 4.4,
        reviewCount: 18,
        slug: 'demo-two-slot-toaster',
        title: { ru: 'Тостер Linea', uk: 'Тостер Linea' },
      },
      {
        attributes: { applianceType: 'kitchen', brand: 'nordic' },
        baseColorIndex: 3,
        category: 'appliances',
        description: {
          ru: 'Кофемолка с несколькими режимами помола.',
          uk: 'Кавомолка з кількома режимами помелу.',
        },
        rating: 4.8,
        reviewCount: 39,
        slug: 'demo-coffee-grinder',
        title: { ru: 'Кофемолка Nordic Grind', uk: 'Кавомолка Nordic Grind' },
      },
      {
        attributes: { applianceType: 'kitchen', brand: 'haus' },
        baseColorIndex: 4,
        category: 'appliances',
        description: {
          ru: 'Ручной миксер для теста, кремов и домашних десертов.',
          uk: 'Ручний міксер для тіста, кремів і домашніх десертів.',
        },
        rating: 4.5,
        reviewCount: 21,
        slug: 'demo-hand-mixer',
        title: { ru: 'Ручной миксер Haus', uk: 'Ручний міксер Haus' },
      },
    ],
  },
]

const palette = [
  ['#111827', '#f8fafc', '#d1d5db'],
  ['#1d4ed8', '#eff6ff', '#bfdbfe'],
  ['#556b2f', '#f7fee7', '#d9f99d'],
  ['#7c2d12', '#fff7ed', '#fed7aa'],
  ['#374151', '#f3f4f6', '#cbd5e1'],
]

const fileFromBuffer = (name: string, data: Buffer): File => ({
  data,
  mimetype: 'image/webp',
  name,
  size: data.byteLength,
})

const escapeSvgText = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const richText = (text: string) => ({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text,
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
})

const productArtwork = ({
  accent,
  color,
  dark,
  index,
  light,
  type,
}: {
  accent: string
  color: string
  dark: string
  index: number
  light: string
  type: ProductTypeKey
}) => {
  const rotate = (index % 5) - 2
  const opacity = color.toLowerCase() === '#f5f1e8' ? '0.96' : '1'

  if (type === 'clothing') {
    return `<g filter="url(#shadow)" transform="translate(${index % 2 ? 12 : -14} ${index % 3 ? 2 : -8}) rotate(${rotate} 600 610)">
      <path d="M390 316 L486 254 L548 306 C578 330 622 330 652 306 L714 254 L810 316 L760 456 L704 440 L704 910 L496 910 L496 440 L440 456 Z" fill="${color}" opacity="${opacity}"/>
      <path d="M548 306 C578 330 622 330 652 306 C640 364 560 364 548 306 Z" fill="${light}" opacity="0.55"/>
      <path d="M496 440 L496 910 L704 910 L704 440" fill="none" stroke="${dark}" stroke-opacity="0.14" stroke-width="10"/>
      <circle cx="674" cy="420" r="20" fill="${accent}" opacity="0.8"/>
    </g>`
  }

  if (type === 'footwear') {
    return `<g filter="url(#shadow)" transform="translate(${index % 2 ? 8 : -22} ${index % 4 ? 18 : -12}) rotate(${rotate} 600 690)">
      <path d="M310 700 C410 640 520 616 642 640 C734 658 812 676 908 660 C934 712 906 780 822 796 L426 796 C354 796 308 762 310 700 Z" fill="${color}"/>
      <path d="M420 624 C494 548 608 516 720 554 L748 644 C650 626 536 618 420 678 Z" fill="${accent}" opacity="0.35"/>
      <path d="M354 800 L866 800" stroke="${dark}" stroke-opacity="0.28" stroke-width="28" stroke-linecap="round"/>
      <path d="M488 650 L708 674" stroke="${light}" stroke-opacity="0.62" stroke-width="14" stroke-linecap="round"/>
    </g>`
  }

  return `<g filter="url(#shadow)" transform="translate(${index % 2 ? -18 : 16} ${index % 3 ? 8 : -10}) rotate(${rotate} 600 610)">
    <rect x="436" y="300" width="328" height="500" rx="64" fill="${color}"/>
    <rect x="488" y="366" width="224" height="192" rx="38" fill="${light}" opacity="0.76"/>
    <rect x="512" y="606" width="176" height="26" rx="13" fill="${accent}" opacity="0.8"/>
    <circle cx="600" cy="698" r="44" fill="${dark}" opacity="0.18"/>
    <path d="M430 780 L770 780" stroke="${dark}" stroke-opacity="0.22" stroke-width="26" stroke-linecap="round"/>
  </g>`
}

const imageBuffer = async ({
  accentIndex,
  color = '#111827',
  kind,
  title,
  type,
}: {
  accentIndex: number
  color?: string
  kind: 'category' | 'product'
  title: string
  type: ProductTypeKey
}) => {
  const [dark, light, accent] = palette[accentIndex % palette.length]
  const width = kind === 'product' ? 1200 : 1600
  const height = kind === 'product' ? 1200 : 820
  const safeTitle = escapeSvgText(title)
  const artwork =
    kind === 'product'
      ? productArtwork({ accent, color, dark, index: accentIndex, light, type })
      : `<g filter="url(#shadow)">
          <rect x="870" y="140" width="420" height="520" rx="76" fill="#fff"/>
          <rect x="955" y="235" width="250" height="320" rx="52" fill="${dark}"/>
          <rect x="130" y="238" width="620" height="42" rx="21" fill="${dark}" opacity="0.92"/>
          <rect x="130" y="358" width="480" height="24" rx="12" fill="${dark}" opacity="0.35"/>
          <rect x="130" y="438" width="360" height="24" rx="12" fill="${dark}" opacity="0.2"/>
        </g>`

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${light}"/>
          <stop offset="0.58" stop-color="#ffffff"/>
          <stop offset="1" stop-color="${accent}"/>
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="28" stdDeviation="26" flood-color="#000" flood-opacity="0.16"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="${width * 0.78}" cy="${height * 0.22}" r="${height * 0.18}" fill="${accent}" opacity="${kind === 'product' ? '0.24' : '0.34'}"/>
      <circle cx="${width * 0.18}" cy="${height * 0.82}" r="${height * 0.2}" fill="${dark}" opacity="0.07"/>
      ${
        kind === 'product'
          ? `<rect x="92" y="92" width="220" height="32" rx="16" fill="${dark}" opacity="0.14"/>
             <rect x="92" y="146" width="150" height="18" rx="9" fill="${dark}" opacity="0.1"/>`
          : ''
      }
      ${artwork}
      <text x="42" y="${height - 42}" fill="${dark}" font-family="Arial, sans-serif" font-size="${kind === 'product' ? '24' : '26'}" font-weight="700" opacity="0.24">${safeTitle}</text>
    </svg>`

  return sharp(Buffer.from(svg)).webp({ effort: 4, quality: 84 }).toBuffer()
}

const findBySlug = async (payload: Payload, collection: string, slug: string) => {
  const result = await payload.find({
    collection: collection as any,
    limit: 1,
    locale: 'uk',
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs[0]
}

const createMedia = async (payload: Payload, title: string, slug: string, buffer: Buffer) => {
  const filename = `${slug}.webp`
  const existing = await payload.find({
    collection: 'media',
    limit: 1,
    where: {
      filename: {
        equals: filename,
      },
    },
  })

  if (existing.docs[0]) return existing.docs[0]

  return payload.create({
    collection: 'media',
    data: {
      alt: title,
    },
    file: fileFromBuffer(filename, buffer),
  })
}

const upsertLocalized = async ({
  collection,
  data,
  payload,
  ruData,
}: {
  collection: string
  data: any
  payload: Payload
  ruData: any
}) => {
  const existing = await findBySlug(payload, collection, data.slug)
  const doc = existing
    ? await payload.update({
        collection: collection as any,
        data,
        id: existing.id,
      })
    : await payload.create({
        collection: collection as any,
        data,
      })

  await payload.update({
    collection: collection as any,
    data: ruData,
    id: doc.id,
    locale: 'ru',
  })

  return doc
}

const upsertVariantType = async (payload: Payload, name: keyof typeof variantOptions) => {
  const existing = await payload.find({
    collection: 'variantTypes',
    limit: 1,
    where: {
      name: {
        equals: name,
      },
    },
  })

  const variantType =
    existing.docs[0] ||
    (await payload.create({
      collection: 'variantTypes',
      data: {
        label: variantTypeLabels[name].uk,
        name,
      },
    }))

  await payload.update({
    collection: 'variantTypes',
    data: {
      label: variantTypeLabels[name].ru,
    },
    id: variantType.id,
    locale: 'ru',
  })

  const options = []
  for (const option of variantOptions[name]) {
    const optionResult = await payload.find({
      collection: 'variantOptions',
      limit: 1,
      where: {
        and: [
          {
            variantType: {
              equals: variantType.id,
            },
          },
          {
            value: {
              equals: option.value,
            },
          },
        ],
      },
    })

    const savedOption =
      optionResult.docs[0] ||
      (await payload.create({
          collection: 'variantOptions',
          data: {
            label: option.label.uk,
            swatch: 'swatch' in option ? option.swatch : undefined,
            value: option.value,
            variantType: variantType.id,
          } as any,
        }))

    await payload.update({
      collection: 'variantOptions',
      data: {
        label: option.label.ru,
      },
      id: savedOption.id,
      locale: 'ru',
    })

    options.push(savedOption)
  }

  return { options, variantType }
}

const localizedOptions = (
  options: NonNullable<(typeof productTypes)[ProductTypeKey]['attributes'][number]['options']>,
  locale: 'ru' | 'uk',
) =>
  options.map((option) => ({
    label: option.label[locale],
    value: option.value,
  }))

const upsertProductType = async (
  payload: Payload,
  typeKey: ProductTypeKey,
  variantTypesByName: Record<string, { options: any[]; variantType: any }>,
) => {
  const seed = productTypes[typeKey]

  return upsertLocalized({
    collection: 'productTypes',
    payload,
    data: {
      attributes: seed.attributes.map((attribute) => ({
        inputType: attribute.inputType,
        label: attribute.labels.uk,
        name: attribute.name,
        options: attribute.options ? localizedOptions(attribute.options, 'uk') : undefined,
        showInFilters: attribute.showInFilters ?? true,
      })),
      description: seed.description.uk,
      slug: seed.slug,
      title: seed.title.uk,
      variantAxes: seed.axes.map((axis) => ({
        affectsInventory: axis.affectsInventory ?? true,
        affectsMedia: axis.affectsMedia ?? false,
        showInFilters: true,
        variantType: variantTypesByName[axis.name].variantType.id,
      })),
    },
    ruData: {
      attributes: seed.attributes.map((attribute) => ({
        label: attribute.labels.ru,
        name: attribute.name,
        options: attribute.options ? localizedOptions(attribute.options, 'ru') : undefined,
      })),
      description: seed.description.ru,
      title: seed.title.ru,
    },
  })
}

const attributeValues = (product: ProductSeed, locale: 'ru' | 'uk') =>
  Object.entries(product.attributes).map(([name, value]) => {
    const attribute = productTypes[product.category].attributes.find((item) => item.name === name)
    return {
      label: attribute?.labels[locale] || name,
      name,
      value,
    }
  })

const createProduct = async ({
  category,
  indexBase,
  mediaPool,
  payload,
  product,
  productType,
  rootCategoryID,
  subcategoryID,
  variantTypesByName,
}: {
  category: CategorySeed
  indexBase: number
  mediaPool: any[]
  payload: Payload
  product: ProductSeed
  productType: any
  rootCategoryID: number
  subcategoryID: number
  variantTypesByName: Record<string, { options: any[]; variantType: any }>
}) => {
  const typeSeed = productTypes[category.type]
  const axes = typeSeed.axes.map((axis) => variantTypesByName[axis.name])
  const allColorOptions = variantTypesByName.color.options
  const secondaryAxis = axes.find((axis) => axis.variantType.name !== 'color')
  const secondaryOptions = secondaryAxis?.options.slice(0, 3) || []
  const colorStart = product.baseColorIndex % allColorOptions.length
  const colorOptions = [
    allColorOptions[colorStart],
    allColorOptions[(colorStart + 1) % allColorOptions.length],
  ].filter(Boolean)
  const price = 890 + indexBase * 95
  const compareAtPrice = Math.round(price * 1.22)
  const galleryItems = await Promise.all(
    colorOptions.map(async (colorOption, colorIndex) => {
      const color = typeof colorOption.swatch === 'string' ? colorOption.swatch : '#111827'
      const media = reuseExistingMedia
        ? mediaPool[(indexBase + colorIndex) % mediaPool.length]
        : await createMedia(
            payload,
            `${product.title.uk} ${colorOption.label.uk}`,
            `${product.slug}-${colorOption.value}`,
            await imageBuffer({
              accentIndex: indexBase * 7 + colorIndex,
              color,
              kind: 'product',
              title: `${product.title.uk} ${colorOption.label.uk}`,
              type: category.type,
            }),
          )

      return { image: media.id, variantOption: colorOption.id }
    }),
  )

  payload.logger.info(`  Product: ${product.slug}`)
  const savedProduct = await upsertLocalized({
    collection: 'products',
    payload,
    data: {
      _status: 'published',
      attributeValues: attributeValues(product, 'uk'),
      availableVariantOptions: [...colorOptions, ...secondaryOptions].map((option) => option.id),
      categories: [rootCategoryID, subcategoryID],
      compareAtPrice,
      currency: 'UAH',
      description: richText(product.description.uk),
      enableVariants: true,
      gallery: galleryItems,
      inventory: 20 + indexBase,
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              richText: richText(
                'Характеристики та варіанти цього товару створені через схему виду товару в адмінці.',
              ),
              size: 'full',
            },
          ],
        },
      ],
      mediaVariantType: variantTypesByName.color.variantType.id,
      meta: {
        description: product.description.uk,
        image: galleryItems[0].image,
        title: product.title.uk,
      },
      [priceEnabledField]: true,
      [priceField]: Math.round(price * 100),
      price,
      productType: productType.id,
      reviewSummary: {
        rating: product.rating,
        reviewCount: product.reviewCount,
      },
      reviews: [
        {
          author: 'Олена',
          rating: 5,
          text: 'Товар виглядає як на фото, варіанти обираються зрозуміло.',
        },
        {
          author: 'Максим',
          rating: 4,
          text: 'Зручно, що характеристики й доступні кольори видно одразу.',
        },
      ],
      slug: product.slug,
      title: product.title.uk,
      variantTypes: axes.map((axis) => axis.variantType.id),
    },
    ruData: {
      description: richText(product.description.ru),
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              richText: richText(
                'Характеристики и варианты этого товара созданы через схему типа товара в админке.',
              ),
              size: 'full',
            },
          ],
        },
      ],
      meta: {
        description: product.description.ru,
        image: galleryItems[0].image,
        title: product.title.ru,
      },
      reviews: [
        {
          author: 'Елена',
          rating: 5,
          text: 'Товар выглядит как на фото, варианты выбираются понятно.',
        },
        {
          author: 'Максим',
          rating: 4,
          text: 'Удобно, что характеристики и доступные цвета видны сразу.',
        },
      ],
      title: product.title.ru,
    },
  })

  await payload.delete({
    collection: 'variants',
    depth: 0,
    where: {
      product: {
        equals: savedProduct.id,
      },
    },
  })

  const variantOptionGroups = secondaryOptions.length
    ? colorOptions.flatMap((colorOption) =>
        secondaryOptions.map((secondaryOption) => [colorOption, secondaryOption]),
      )
    : colorOptions.map((colorOption) => [colorOption])

  for (const [variantIndex, options] of variantOptionGroups.entries()) {
    const mediaOption = options.find(
      (option) =>
        relationshipID(option.variantType) === relationID(variantTypesByName.color.variantType.id),
    )
    const variantMedia = galleryItems.find((item) => item.variantOption === mediaOption?.id)?.image

    await payload.create({
      collection: 'variants',
      depth: 0,
      data: {
        _status: 'published',
        compareAtPrice,
        currency: 'UAH',
        inventory: variantIndex % 5 === 0 ? 0 : 8 + variantIndex,
        image: variantMedia,
        options: options.map((option) => option.id),
        [priceEnabledField]: true,
        [priceField]: Math.round((price + variantIndex * 15) * 100),
        price: price + variantIndex * 15,
        product: savedProduct.id,
        title: `${product.title.uk} / ${options.map((option) => option.label.uk).join(' / ')}`,
      } as any,
    })
  }

  return relationID(savedProduct.id)
}

async function main() {
  const categoryCount = catalog.length * 2
  const productCount = catalog.reduce((total, category) => total + category.products.length, 0)

  if (dryRun) {
    console.info(
      [
        `Dry run: ${categoryCount} категорій, ${productCount} товарів, 3 схеми товарів.`,
        reuseExistingMedia
          ? 'Media mode: reuse existing media.'
          : `Media mode: generate ${categoryCount + productCount * 2} optimized WebP images.`,
      ].join('\n'),
    )
    return
  }

  const payload = await getPayload({ config: configPromise })
  const variantTypesByName: Record<string, { options: any[]; variantType: any }> = {}

  for (const name of Object.keys(variantOptions) as Array<keyof typeof variantOptions>) {
    variantTypesByName[name] = await upsertVariantType(payload, name)
  }

  const productTypesByKey: Record<ProductTypeKey, any> = {
    appliances: await upsertProductType(payload, 'appliances', variantTypesByName),
    clothing: await upsertProductType(payload, 'clothing', variantTypesByName),
    footwear: await upsertProductType(payload, 'footwear', variantTypesByName),
  }

  const mediaPool: any[] = []

  if (reuseExistingMedia) {
    const mediaResult = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 20,
    })
    mediaPool.push(...mediaResult.docs)
  }

  const rootCategoryIDs: number[] = []
  let productIndex = 0

  for (const [categoryIndex, categorySeed] of catalog.entries()) {
    const productType = productTypesByKey[categorySeed.type]
    const rootImage = reuseExistingMedia
      ? mediaPool[categoryIndex % mediaPool.length]
      : await createMedia(
          payload,
          categorySeed.title.uk,
          `${categorySeed.slug}-cover`,
          await imageBuffer({
            accentIndex: categoryIndex,
            kind: 'category',
            title: categorySeed.title.uk,
            type: categorySeed.type,
          }),
        )

    payload.logger.info(`Category: ${categorySeed.slug}`)
    const rootCategory = await upsertLocalized({
      collection: 'categories',
      payload,
      data: {
        description: categorySeed.description.uk,
        image: rootImage.id,
        productType: productType.id,
        showInMegaMenu: true,
        slug: categorySeed.slug,
        title: categorySeed.title.uk,
      },
      ruData: {
        description: categorySeed.description.ru,
        title: categorySeed.title.ru,
      },
    })
    const rootCategoryID = relationID(rootCategory.id)
    rootCategoryIDs.push(rootCategoryID)

    const subImage = reuseExistingMedia
      ? mediaPool[(categoryIndex + 1) % mediaPool.length]
      : await createMedia(
          payload,
          categorySeed.subcategory.title.uk,
          `${categorySeed.subcategory.slug}-cover`,
          await imageBuffer({
            accentIndex: categoryIndex + 10,
            kind: 'category',
            title: categorySeed.subcategory.title.uk,
            type: categorySeed.type,
          }),
        )

    const subcategory = await upsertLocalized({
      collection: 'categories',
      payload,
      data: {
        description: categorySeed.subcategory.description.uk,
        image: subImage.id,
        parent: rootCategoryID,
        productType: productType.id,
        showInMegaMenu: true,
        slug: categorySeed.subcategory.slug,
        title: categorySeed.subcategory.title.uk,
      },
      ruData: {
        description: categorySeed.subcategory.description.ru,
        title: categorySeed.subcategory.title.ru,
      },
    })
    const subcategoryID = relationID(subcategory.id)
    const productIDs: number[] = []

    for (const product of categorySeed.products) {
      productIndex += 1
      productIDs.push(
        await createProduct({
          category: categorySeed,
          indexBase: productIndex,
          mediaPool,
          payload,
          product,
          productType,
          rootCategoryID,
          subcategoryID,
          variantTypesByName,
        }),
      )
    }

    await payload.update({
      collection: 'categories',
      data: {
        featuredProducts: productIDs.slice(0, 4),
      },
      id: rootCategoryID,
    } as any)

    await payload.update({
      collection: 'categories',
      data: {
        featuredProducts: productIDs.slice(0, 4),
      },
      id: subcategoryID,
    } as any)
  }

  if (updateHeader) {
    const navItemsUk = [
      {
        enableMegaMenu: true,
        link: {
          label: 'Каталог',
          type: 'custom',
          url: '/catalog',
        },
        megaMenuCategories: rootCategoryIDs,
        showInHeader: true,
      },
    ]
    const navItemsRu = [
      {
        enableMegaMenu: true,
        link: {
          label: 'Каталог товаров',
          type: 'custom',
          url: '/catalog',
        },
        megaMenuCategories: rootCategoryIDs,
        showInHeader: true,
      },
    ]

    await payload.updateGlobal({
      slug: 'header',
      data: { navItems: navItemsUk } as any,
      locale: 'uk',
    })

    await payload.updateGlobal({
      slug: 'header',
      data: { navItems: navItemsRu } as any,
      locale: 'ru',
    })
  }

  payload.logger.info(
    `Demo catalog seed complete: ${categoryCount} categories, ${productCount} products`,
  )
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
