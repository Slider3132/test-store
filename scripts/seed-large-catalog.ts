import 'dotenv/config'

import configPromise from '@payload-config'
import sharp from 'sharp'
import { getPayload, type File, type Payload } from 'payload'

import { priceEnabledField, priceField } from '@/lib/currency'

type CatalogCategorySeed = {
  title: string
  titleRu: string
  slug: string
  description: string
  descriptionRu: string
  subcategories: Array<{
    title: string
    titleRu: string
    slug: string
    productBase: string
    productBaseRu: string
  }>
}

const categories: CatalogCategorySeed[] = [
  {
    title: 'Одяг',
    titleRu: 'Одежда',
    slug: 'demo-clothing',
    description: 'Базовий одяг для щоденного гардероба.',
    descriptionRu: 'Базовая одежда для повседневного гардероба.',
    subcategories: [
      {
        title: 'Футболки',
        titleRu: 'Футболки',
        slug: 'demo-t-shirts',
        productBase: 'Футболка',
        productBaseRu: 'Футболка',
      },
      {
        title: 'Світшоти',
        titleRu: 'Свитшоты',
        slug: 'demo-sweatshirts',
        productBase: 'Світшот',
        productBaseRu: 'Свитшот',
      },
      {
        title: 'Сорочки',
        titleRu: 'Рубашки',
        slug: 'demo-shirts',
        productBase: 'Сорочка',
        productBaseRu: 'Рубашка',
      },
      {
        title: 'Штани',
        titleRu: 'Брюки',
        slug: 'demo-pants',
        productBase: 'Штани',
        productBaseRu: 'Брюки',
      },
      {
        title: 'Куртки',
        titleRu: 'Куртки',
        slug: 'demo-jackets',
        productBase: 'Куртка',
        productBaseRu: 'Куртка',
      },
    ],
  },
  {
    title: 'Взуття',
    titleRu: 'Обувь',
    slug: 'demo-footwear',
    description: 'Міське взуття для роботи, прогулянок і подорожей.',
    descriptionRu: 'Городская обувь для работы, прогулок и путешествий.',
    subcategories: [
      {
        title: 'Кросівки',
        titleRu: 'Кроссовки',
        slug: 'demo-sneakers',
        productBase: 'Кросівки',
        productBaseRu: 'Кроссовки',
      },
      {
        title: 'Черевики',
        titleRu: 'Ботинки',
        slug: 'demo-boots',
        productBase: 'Черевики',
        productBaseRu: 'Ботинки',
      },
      {
        title: 'Лофери',
        titleRu: 'Лоферы',
        slug: 'demo-loafers',
        productBase: 'Лофери',
        productBaseRu: 'Лоферы',
      },
      {
        title: 'Сандалі',
        titleRu: 'Сандалии',
        slug: 'demo-sandals',
        productBase: 'Сандалі',
        productBaseRu: 'Сандалии',
      },
      {
        title: 'Домашнє взуття',
        titleRu: 'Домашняя обувь',
        slug: 'demo-home-shoes',
        productBase: 'Домашні капці',
        productBaseRu: 'Домашние тапочки',
      },
    ],
  },
  {
    title: 'Аксесуари',
    titleRu: 'Аксессуары',
    slug: 'demo-accessories',
    description: 'Деталі, які завершують образ і додають зручності.',
    descriptionRu: 'Детали, которые завершают образ и добавляют удобство.',
    subcategories: [
      {
        title: 'Сумки',
        titleRu: 'Сумки',
        slug: 'demo-bags',
        productBase: 'Сумка',
        productBaseRu: 'Сумка',
      },
      {
        title: 'Рюкзаки',
        titleRu: 'Рюкзаки',
        slug: 'demo-backpacks',
        productBase: 'Рюкзак',
        productBaseRu: 'Рюкзак',
      },
      {
        title: 'Головні убори',
        titleRu: 'Головные уборы',
        slug: 'demo-headwear',
        productBase: 'Кепка',
        productBaseRu: 'Кепка',
      },
      {
        title: 'Ремені',
        titleRu: 'Ремни',
        slug: 'demo-belts',
        productBase: 'Ремінь',
        productBaseRu: 'Ремень',
      },
      {
        title: 'Гаманці',
        titleRu: 'Кошельки',
        slug: 'demo-wallets',
        productBase: 'Гаманець',
        productBaseRu: 'Кошелек',
      },
    ],
  },
  {
    title: 'Електроніка',
    titleRu: 'Электроника',
    slug: 'demo-electronics',
    description: 'Техніка й аксесуари для повсякденних задач.',
    descriptionRu: 'Техника и аксессуары для повседневных задач.',
    subcategories: [
      {
        title: 'Навушники',
        titleRu: 'Наушники',
        slug: 'demo-headphones',
        productBase: 'Навушники',
        productBaseRu: 'Наушники',
      },
      {
        title: 'Зарядні пристрої',
        titleRu: 'Зарядные устройства',
        slug: 'demo-chargers',
        productBase: 'Зарядний пристрій',
        productBaseRu: 'Зарядное устройство',
      },
      {
        title: 'Кабелі',
        titleRu: 'Кабели',
        slug: 'demo-cables',
        productBase: 'Кабель',
        productBaseRu: 'Кабель',
      },
      {
        title: 'Павербанки',
        titleRu: 'Пауэрбанки',
        slug: 'demo-powerbanks',
        productBase: 'Павербанк',
        productBaseRu: 'Пауэрбанк',
      },
      {
        title: 'Аксесуари для телефону',
        titleRu: 'Аксессуары для телефона',
        slug: 'demo-phone-accessories',
        productBase: 'Чохол',
        productBaseRu: 'Чехол',
      },
    ],
  },
  {
    title: 'Дім',
    titleRu: 'Дом',
    slug: 'demo-home',
    description: 'Корисні речі для кухні, ванної та зберігання.',
    descriptionRu: 'Полезные вещи для кухни, ванной и хранения.',
    subcategories: [
      {
        title: 'Кухня',
        titleRu: 'Кухня',
        slug: 'demo-kitchen',
        productBase: 'Кухонний набір',
        productBaseRu: 'Кухонный набор',
      },
      {
        title: 'Ванна',
        titleRu: 'Ванная',
        slug: 'demo-bath',
        productBase: 'Набір для ванної',
        productBaseRu: 'Набор для ванной',
      },
      {
        title: 'Зберігання',
        titleRu: 'Хранение',
        slug: 'demo-storage',
        productBase: 'Органайзер',
        productBaseRu: 'Органайзер',
      },
      {
        title: 'Текстиль',
        titleRu: 'Текстиль',
        slug: 'demo-home-textile',
        productBase: 'Текстильний набір',
        productBaseRu: 'Текстильный набор',
      },
      {
        title: 'Декор',
        titleRu: 'Декор',
        slug: 'demo-decor',
        productBase: 'Декор',
        productBaseRu: 'Декор',
      },
    ],
  },
  {
    title: 'Спорт',
    titleRu: 'Спорт',
    slug: 'demo-sport',
    description: 'Товари для тренувань, активного відпочинку й відновлення.',
    descriptionRu: 'Товары для тренировок, активного отдыха и восстановления.',
    subcategories: [
      {
        title: 'Фітнес',
        titleRu: 'Фитнес',
        slug: 'demo-fitness',
        productBase: 'Фітнес аксесуар',
        productBaseRu: 'Фитнес аксессуар',
      },
      {
        title: 'Йога',
        titleRu: 'Йога',
        slug: 'demo-yoga',
        productBase: 'Килимок',
        productBaseRu: 'Коврик',
      },
      {
        title: 'Біг',
        titleRu: 'Бег',
        slug: 'demo-running',
        productBase: 'Аксесуар для бігу',
        productBaseRu: 'Аксессуар для бега',
      },
      {
        title: 'Туризм',
        titleRu: 'Туризм',
        slug: 'demo-outdoor',
        productBase: 'Туристичний аксесуар',
        productBaseRu: 'Туристический аксессуар',
      },
      {
        title: 'Відновлення',
        titleRu: 'Восстановление',
        slug: 'demo-recovery',
        productBase: 'Масажний аксесуар',
        productBaseRu: 'Массажный аксессуар',
      },
    ],
  },
  {
    title: 'Краса',
    titleRu: 'Красота',
    slug: 'demo-beauty',
    description: 'Доглядові товари для щоденних ритуалів.',
    descriptionRu: 'Уходовые товары для ежедневных ритуалов.',
    subcategories: [
      {
        title: 'Догляд за обличчям',
        titleRu: 'Уход за лицом',
        slug: 'demo-face-care',
        productBase: 'Засіб для обличчя',
        productBaseRu: 'Средство для лица',
      },
      {
        title: 'Догляд за тілом',
        titleRu: 'Уход за телом',
        slug: 'demo-body-care',
        productBase: 'Засіб для тіла',
        productBaseRu: 'Средство для тела',
      },
      {
        title: 'Волосся',
        titleRu: 'Волосы',
        slug: 'demo-hair-care',
        productBase: 'Засіб для волосся',
        productBaseRu: 'Средство для волос',
      },
      {
        title: 'Аромати',
        titleRu: 'Ароматы',
        slug: 'demo-fragrance',
        productBase: 'Аромат',
        productBaseRu: 'Аромат',
      },
      {
        title: 'Інструменти',
        titleRu: 'Инструменты',
        slug: 'demo-beauty-tools',
        productBase: 'Бʼюті інструмент',
        productBaseRu: 'Бьюти инструмент',
      },
    ],
  },
  {
    title: 'Дитячі товари',
    titleRu: 'Детские товары',
    slug: 'demo-kids',
    description: 'Речі для дітей, навчання й активних ігор.',
    descriptionRu: 'Вещи для детей, обучения и активных игр.',
    subcategories: [
      {
        title: 'Одяг для дітей',
        titleRu: 'Одежда для детей',
        slug: 'demo-kids-clothing',
        productBase: 'Дитяча річ',
        productBaseRu: 'Детская вещь',
      },
      {
        title: 'Іграшки',
        titleRu: 'Игрушки',
        slug: 'demo-toys',
        productBase: 'Іграшка',
        productBaseRu: 'Игрушка',
      },
      {
        title: 'Навчання',
        titleRu: 'Обучение',
        slug: 'demo-learning',
        productBase: 'Навчальний набір',
        productBaseRu: 'Учебный набор',
      },
      {
        title: 'Догляд',
        titleRu: 'Уход',
        slug: 'demo-kids-care',
        productBase: 'Дитячий догляд',
        productBaseRu: 'Детский уход',
      },
      {
        title: 'Прогулянки',
        titleRu: 'Прогулки',
        slug: 'demo-strollers',
        productBase: 'Аксесуар для прогулянок',
        productBaseRu: 'Аксессуар для прогулок',
      },
    ],
  },
  {
    title: 'Офіс',
    titleRu: 'Офис',
    slug: 'demo-office',
    description: 'Предмети для робочого простору та навчання.',
    descriptionRu: 'Предметы для рабочего пространства и учебы.',
    subcategories: [
      {
        title: 'Канцелярія',
        titleRu: 'Канцелярия',
        slug: 'demo-stationery',
        productBase: 'Канцелярський набір',
        productBaseRu: 'Канцелярский набор',
      },
      {
        title: 'Організація столу',
        titleRu: 'Организация стола',
        slug: 'demo-desk-setup',
        productBase: 'Органайзер для столу',
        productBaseRu: 'Органайзер для стола',
      },
      {
        title: 'Блокноти',
        titleRu: 'Блокноты',
        slug: 'demo-notebooks',
        productBase: 'Блокнот',
        productBaseRu: 'Блокнот',
      },
      {
        title: 'Папки',
        titleRu: 'Папки',
        slug: 'demo-folders',
        productBase: 'Папка',
        productBaseRu: 'Папка',
      },
      {
        title: 'Аксесуари для ноутбука',
        titleRu: 'Аксессуары для ноутбука',
        slug: 'demo-laptop-accessories',
        productBase: 'Аксесуар для ноутбука',
        productBaseRu: 'Аксессуар для ноутбука',
      },
    ],
  },
  {
    title: 'Подорожі',
    titleRu: 'Путешествия',
    slug: 'demo-travel',
    description: 'Компактні товари для дороги, валізи й організації багажу.',
    descriptionRu: 'Компактные товары для дороги, чемодана и организации багажа.',
    subcategories: [
      {
        title: 'Валізи',
        titleRu: 'Чемоданы',
        slug: 'demo-luggage',
        productBase: 'Валіза',
        productBaseRu: 'Чемодан',
      },
      {
        title: 'Органайзери',
        titleRu: 'Органайзеры',
        slug: 'demo-travel-organizers',
        productBase: 'Дорожній органайзер',
        productBaseRu: 'Дорожный органайзер',
      },
      {
        title: 'Подушки',
        titleRu: 'Подушки',
        slug: 'demo-travel-pillows',
        productBase: 'Дорожня подушка',
        productBaseRu: 'Дорожная подушка',
      },
      {
        title: 'Пляшки',
        titleRu: 'Бутылки',
        slug: 'demo-bottles',
        productBase: 'Пляшка',
        productBaseRu: 'Бутылка',
      },
      {
        title: 'Адаптери',
        titleRu: 'Адаптеры',
        slug: 'demo-adapters',
        productBase: 'Дорожній адаптер',
        productBaseRu: 'Дорожный адаптер',
      },
    ],
  },
]

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const updateHeader = !args.has('--skip-header')

const relationID = (id: number | string) => (typeof id === 'string' ? Number(id) : id)

const richText = (text: string) => ({
  root: {
    children: [
      {
        children: [
          { detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 },
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

const palette = [
  ['#111827', '#93c5fd', '#e5e7eb'],
  ['#0f172a', '#f59e0b', '#f8fafc'],
  ['#18181b', '#a7f3d0', '#f4f4f5'],
  ['#1f2937', '#c4b5fd', '#f9fafb'],
  ['#172554', '#fca5a5', '#eff6ff'],
]

const fileFromBuffer = (name: string, data: Buffer): File => ({
  name,
  data,
  mimetype: 'image/webp',
  size: data.byteLength,
})

const imageBuffer = async ({
  kind,
  index,
  title,
}: {
  kind: 'category' | 'subcategory' | 'product'
  index: number
  title: string
}) => {
  const [dark, accent, light] = palette[index % palette.length]
  const width = kind === 'product' ? 1400 : 1600
  const height = kind === 'product' ? 1400 : 900
  const shape = kind === 'product' ? 'product' : kind === 'category' ? 'hero' : 'tile'
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="${light}"/>
          <stop offset="0.55" stop-color="#ffffff"/>
          <stop offset="1" stop-color="${accent}"/>
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="32" stdDeviation="28" flood-color="#000" flood-opacity="0.18"/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="${width * 0.78}" cy="${height * 0.24}" r="${height * 0.18}" fill="${accent}" opacity="0.28"/>
      <circle cx="${width * 0.18}" cy="${height * 0.82}" r="${height * 0.22}" fill="${dark}" opacity="0.08"/>
      ${
        shape === 'product'
          ? `<g filter="url(#shadow)">
              <rect x="${width * 0.29}" y="${height * 0.22}" width="${width * 0.42}" height="${height * 0.56}" rx="70" fill="#fff"/>
              <rect x="${width * 0.37}" y="${height * 0.31}" width="${width * 0.26}" height="${height * 0.38}" rx="42" fill="${dark}"/>
              <circle cx="${width * 0.5}" cy="${height * 0.29}" r="42" fill="${light}"/>
              <rect x="${width * 0.43}" y="${height * 0.73}" width="${width * 0.14}" height="24" rx="12" fill="${accent}"/>
            </g>`
          : `<g filter="url(#shadow)">
              <rect x="${width * 0.52}" y="${height * 0.16}" width="${width * 0.3}" height="${height * 0.58}" rx="46" fill="#fff"/>
              <rect x="${width * 0.58}" y="${height * 0.26}" width="${width * 0.18}" height="${height * 0.36}" rx="32" fill="${dark}"/>
              <rect x="${width * 0.12}" y="${height * 0.28}" width="${width * 0.34}" height="34" rx="17" fill="${dark}" opacity="0.92"/>
              <rect x="${width * 0.12}" y="${height * 0.39}" width="${width * 0.26}" height="18" rx="9" fill="${dark}" opacity="0.35"/>
              <rect x="${width * 0.12}" y="${height * 0.46}" width="${width * 0.2}" height="18" rx="9" fill="${dark}" opacity="0.22"/>
            </g>`
      }
      <text x="48" y="${height - 54}" fill="${dark}" font-family="Arial, sans-serif" font-size="34" font-weight="700" opacity="0.22">${title.replaceAll('&', '&amp;')}</text>
    </svg>`

  return sharp(Buffer.from(svg)).webp({ quality: 82, effort: 4 }).toBuffer()
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

  if (existing.docs[0]) {
    return existing.docs[0]
  }

  return payload.create({
    collection: 'media',
    data: {
      alt: title,
    },
    file: fileFromBuffer(filename, buffer),
  })
}

const findBySlug = async (
  payload: Payload,
  collection: 'categories' | 'products',
  slug: string,
) => {
  const result = await payload.find({
    collection,
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

const upsertCategory = async (
  payload: Payload,
  {
    data,
    ruData,
  }: {
    data: any
    ruData: any
  },
) => {
  const existing = await findBySlug(payload, 'categories', data.slug)
  const category = existing
    ? await payload.update({
        collection: 'categories',
        data,
        id: existing.id,
      })
    : await payload.create({
        collection: 'categories',
        data,
      } as any)

  await updateRu(payload, 'categories', category.id, ruData)

  return category
}

const upsertProduct = async (
  payload: Payload,
  {
    data,
    ruData,
  }: {
    data: any
    ruData: any
  },
) => {
  const existing = await findBySlug(payload, 'products', data.slug)
  const product = existing
    ? await payload.update({
        collection: 'products',
        data,
        id: existing.id,
      })
    : await payload.create({
        collection: 'products',
        data,
      } as any)

  await updateRu(payload, 'products', product.id, ruData)

  return product
}

const updateRu = async (
  payload: Payload,
  collection: 'categories' | 'products',
  id: number | string,
  data: any,
) =>
  payload.update({
    collection,
    id,
    data,
    locale: 'ru',
  })

async function main() {
  const categoryCount = categories.length
  const subcategoryCount = categories.reduce(
    (total, category) => total + category.subcategories.length,
    0,
  )
  const productCount = subcategoryCount * 10
  const mediaCount = categoryCount + subcategoryCount + productCount
  const storageMode =
    process.env.S3_BUCKET &&
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY
      ? 'Supabase/S3 через Payload storage adapter'
      : 'локальний public/media, бо S3 env неповні'

  if (dryRun) {
    console.info(
      [
        `Dry run: ${categoryCount} категорій, ${subcategoryCount} підкатегорій, ${productCount} товарів.`,
        `Буде створено або оновлено до ${mediaCount} WebP-зображень.`,
        `Storage mode: ${storageMode}.`,
        `Header update: ${updateHeader ? 'так' : 'ні'}.`,
      ].join('\n'),
    )
    return
  }

  const payload = await getPayload({ config: configPromise })
  const productIDsByRootCategory = new Map<string, number[]>()
  const rootCategoryIDs: number[] = []

  payload.logger.info(
    `Creating large demo catalog: ${categoryCount} categories, ${subcategoryCount} subcategories, ${productCount} products`,
  )
  payload.logger.info(`Media storage: ${storageMode}`)

  for (const [categoryIndex, categorySeed] of categories.entries()) {
    payload.logger.info(
      `Seeding category ${categoryIndex + 1}/${categories.length}: ${categorySeed.title}`,
    )

    const categoryMedia = await createMedia(
      payload,
      categorySeed.title,
      `${categorySeed.slug}-cover`,
      await imageBuffer({ kind: 'category', index: categoryIndex, title: categorySeed.title }),
    )
    const rootCategory = await upsertCategory(payload, {
      data: {
        description: categorySeed.description,
        image: categoryMedia.id,
        showInMegaMenu: true,
        slug: categorySeed.slug,
        title: categorySeed.title,
      },
      ruData: {
        description: categorySeed.descriptionRu,
        title: categorySeed.titleRu,
      },
    })
    rootCategoryIDs.push(relationID(rootCategory.id))

    productIDsByRootCategory.set(categorySeed.slug, [])

    for (const [subcategoryIndex, subcategorySeed] of categorySeed.subcategories.entries()) {
      const seedIndex = categoryIndex * 5 + subcategoryIndex
      const subcategoryMedia = await createMedia(
        payload,
        subcategorySeed.title,
        `${subcategorySeed.slug}-cover`,
        await imageBuffer({ kind: 'subcategory', index: seedIndex, title: subcategorySeed.title }),
      )
      const subcategory = await upsertCategory(payload, {
        data: {
          description: `${subcategorySeed.title} для зручного щоденного використання.`,
          image: subcategoryMedia.id,
          parent: rootCategory.id,
          showInMegaMenu: true,
          slug: subcategorySeed.slug,
          title: subcategorySeed.title,
        },
        ruData: {
          description: `${subcategorySeed.titleRu} для удобного ежедневного использования.`,
          title: subcategorySeed.titleRu,
        },
      })

      const subcategoryProductIDs: number[] = []

      for (let productIndex = 1; productIndex <= 10; productIndex++) {
        const productTitle = `${subcategorySeed.productBase} ${String(productIndex).padStart(2, '0')}`
        const productTitleRu = `${subcategorySeed.productBaseRu} ${String(productIndex).padStart(2, '0')}`
        const productSlug = `${subcategorySeed.slug}-product-${String(productIndex).padStart(2, '0')}`
        const productMedia = await createMedia(
          payload,
          productTitle,
          productSlug,
          await imageBuffer({
            kind: 'product',
            index: categoryIndex * 50 + subcategoryIndex * 10 + productIndex,
            title: productTitle,
          }),
        )
        const price = 399 + categoryIndex * 120 + subcategoryIndex * 45 + productIndex * 17
        const product = await upsertProduct(payload, {
          data: {
            _status: 'published',
            categories: [relationID(rootCategory.id), relationID(subcategory.id)],
            currency: 'UAH',
            description: richText(
              `${productTitle} з демо-каталогу. Опис можна замінити реальними характеристиками товару.`,
            ),
            gallery: [{ image: productMedia.id }],
            inventory: 24 + productIndex,
            layout: [],
            meta: {
              description: `${productTitle} з демо-каталогу.`,
              image: productMedia.id,
              title: productTitle,
            },
            [priceEnabledField]: true,
            [priceField]: Math.round(price * 100),
            price,
            relatedProducts: [],
            slug: productSlug,
            title: productTitle,
          },
          ruData: {
            description: richText(
              `${productTitleRu} из демо-каталога. Описание можно заменить реальными характеристиками товара.`,
            ),
            meta: {
              description: `${productTitleRu} из демо-каталога.`,
              image: productMedia.id,
              title: productTitleRu,
            },
            title: productTitleRu,
          },
        })

        subcategoryProductIDs.push(relationID(product.id))
        productIDsByRootCategory.get(categorySeed.slug)?.push(relationID(product.id))
      }

      await payload.update({
        collection: 'categories',
        id: subcategory.id,
        data: {
          featuredProducts: subcategoryProductIDs.slice(0, 3),
        },
      } as any)
    }

    await payload.update({
      collection: 'categories',
      id: rootCategory.id,
      data: {
        featuredProducts: productIDsByRootCategory.get(categorySeed.slug)?.slice(0, 3) || [],
      },
    } as any)
  }

  if (updateHeader) {
    const navItems = [
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

    await payload.updateGlobal({
      slug: 'header',
      data: { navItems } as any,
      locale: 'uk',
    })

    await payload.updateGlobal({
      slug: 'header',
      data: { navItems } as any,
      locale: 'ru',
    })
  }

  payload.logger.info('Large demo catalog seed complete')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
