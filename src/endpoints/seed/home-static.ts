import { RequiredDataFromCollectionSlug } from 'payload'

type HomeLocale = 'ru' | 'uk'

const homeCopy = {
  uk: {
    accountCta: 'Мій акаунт',
    catalogCta: 'Відкрити каталог',
    ctaBody: 'Перейдіть до товарів або відкрийте акаунт, щоб побачити свої замовлення.',
    ctaTitle: 'Готові подивитися каталог?',
    heroBody:
      'Зібрали речі, які легко поєднуються між собою: футболки, шапки та аксесуари для спокійного щоденного гардероба.',
    heroTitle: 'Базовий одяг і аксесуари на кожен день',
    metaDescription:
      'Онлайн-магазин базового одягу та аксесуарів із каталогом, кошиком і швидким оформленням замовлення.',
    metaTitle: 'Магазин одягу та аксесуарів',
    pageTitle: 'Головна',
    popularIntro: 'Добірка товарів, з яких зручно почати знайомство з магазином.',
    popularTitle: 'Популярні товари',
  },
  ru: {
    accountCta: 'Мой аккаунт',
    catalogCta: 'Открыть каталог',
    ctaBody: 'Перейдите к товарам или откройте аккаунт, чтобы посмотреть свои заказы.',
    ctaTitle: 'Готовы посмотреть каталог?',
    heroBody:
      'Собрали вещи, которые легко сочетаются между собой: футболки, шапки и аксессуары для спокойного повседневного гардероба.',
    heroTitle: 'Базовая одежда и аксессуары на каждый день',
    metaDescription:
      'Интернет-магазин базовой одежды и аксессуаров с каталогом, корзиной и быстрым оформлением заказа.',
    metaTitle: 'Магазин одежды и аксессуаров',
    pageTitle: 'Главная',
    popularIntro: 'Подборка товаров, с которых удобно начать знакомство с магазином.',
    popularTitle: 'Популярные товары',
  },
} satisfies Record<HomeLocale, Record<string, string>>

const textNode = (text: string) => ({
  type: 'text' as const,
  detail: 0,
  format: 0,
  mode: 'normal' as const,
  style: '',
  text,
  version: 1,
})

const paragraph = (text: string) => ({
  type: 'paragraph' as const,
  children: [textNode(text)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
  version: 1,
})

const heading = (text: string, tag = 'h2') => ({
  type: 'heading' as const,
  children: [textNode(text)],
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  tag,
  version: 1,
})

const richText = (...children: ReturnType<typeof heading | typeof paragraph>[]) => ({
  root: {
    type: 'root' as const,
    children,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

export const homeStaticData: (locale?: HomeLocale) => RequiredDataFromCollectionSlug<'pages'> = (
  locale = 'uk',
) => {
  const copy = homeCopy[locale]

  return {
    slug: 'home',
    _status: 'published',
    layout: [
      {
        backgroundColor: '#f6f3ef',
        backgroundType: 'color',
        blockType: 'hero',
        richText: richText(heading(copy.heroTitle, 'h1'), paragraph(copy.heroBody)),
        textTheme: 'dark',
        variant: 'centered',
        verticalPadding: 'large',
      },
      {
        blockType: 'cta',
        richText: richText(heading(copy.ctaTitle, 'h2'), paragraph(copy.ctaBody)),
        links: [
          {
            link: {
              type: 'custom',
              appearance: 'default',
              label: copy.catalogCta,
              url: '/catalog',
            },
          },
          {
            link: {
              type: 'custom',
              appearance: 'outline',
              label: copy.accountCta,
              url: '/account',
            },
          },
        ],
      },
      {
        blockType: 'archive',
        introContent: richText(heading(copy.popularTitle), paragraph(copy.popularIntro)),
        populateBy: 'collection',
        relationTo: 'products',
        limit: 4,
      },
    ],
    meta: {
      description: copy.metaDescription,
      title: copy.metaTitle,
    },
    title: copy.pageTitle,
  }
}
