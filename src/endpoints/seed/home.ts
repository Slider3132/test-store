import type { Category, Media } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

type ProductArgs = {
  categories: Category[]
  darkThemeImage: Media
  metaImage: Media
}

type HomeLocale = 'ru' | 'uk'

const homeCopy = {
  uk: {
    accountCta: 'Мій акаунт',
    catalogCta: 'Відкрити каталог',
    categoryIntro: 'Оберіть напрям і переходьте одразу до потрібної частини каталогу.',
    categoryTitle: 'Категорії для швидкого старту',
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
    testimonialOneAuthor: 'Олена Коваль',
    testimonialOneQuote:
      'Швидко знайшла потрібний розмір, кошик працює зрозуміло, оформлення без зайвих полів.',
    testimonialOneRole: 'Покупчиня',
    testimonialThreeAuthor: 'Ірина Савчук',
    testimonialThreeQuote: 'Легко перемикати мову і переглядати замовлення в акаунті.',
    testimonialThreeRole: 'Постійна клієнтка',
    testimonialTitle: 'Що кажуть клієнти',
    testimonialTwoAuthor: 'Максим Руденко',
    testimonialTwoQuote:
      'Сподобалось, що товари виглядають охайно, а сторінка товару не перевантажена.',
    testimonialTwoRole: 'Покупець',
    stepOneBody: 'Переглядаєте каталог, фото, опис і доступні варіанти.',
    stepOneTitle: 'Обираєте товар',
    stepThreeBody: 'Ми обробляємо замовлення і готуємо його до доставки.',
    stepThreeTitle: 'Отримуєте замовлення',
    stepTwoBody: 'Додаєте товари в кошик і перевіряєте суму перед оплатою.',
    stepTwoTitle: 'Оформлюєте кошик',
    valueOneBody:
      'Каталог контрольований однією командою, без змішаних продавців і випадкових пропозицій.',
    valueOneTitle: 'Один продавець',
    valueThreeBody: 'Клієнтський сайт і контент підтримують українську та російську локалізацію.',
    valueThreeTitle: 'Дві мови',
    valueTwoBody: 'Категорії, пошук і сторінки товарів поступово готуємо під великий асортимент.',
    valueTwoTitle: 'Зручний каталог',
  },
  ru: {
    accountCta: 'Мой аккаунт',
    catalogCta: 'Открыть каталог',
    categoryIntro: 'Выберите направление и сразу переходите к нужной части каталога.',
    categoryTitle: 'Категории для быстрого старта',
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
    testimonialOneAuthor: 'Елена Коваль',
    testimonialOneQuote:
      'Быстро нашла нужный размер, корзина понятная, оформление без лишних полей.',
    testimonialOneRole: 'Покупательница',
    testimonialThreeAuthor: 'Ирина Савчук',
    testimonialThreeQuote: 'Легко переключать язык и просматривать заказы в аккаунте.',
    testimonialThreeRole: 'Постоянная клиентка',
    testimonialTitle: 'Что говорят клиенты',
    testimonialTwoAuthor: 'Максим Руденко',
    testimonialTwoQuote:
      'Понравилось, что товары выглядят аккуратно, а страница товара не перегружена.',
    testimonialTwoRole: 'Покупатель',
    stepOneBody: 'Просматриваете каталог, фото, описание и доступные варианты.',
    stepOneTitle: 'Выбираете товар',
    stepThreeBody: 'Мы обрабатываем заказ и готовим его к доставке.',
    stepThreeTitle: 'Получаете заказ',
    stepTwoBody: 'Добавляете товары в корзину и проверяете сумму перед оплатой.',
    stepTwoTitle: 'Оформляете корзину',
    valueOneBody:
      'Каталог контролируется одной командой, без смешанных продавцов и случайных предложений.',
    valueOneTitle: 'Один продавец',
    valueThreeBody: 'Клиентский сайт и контент поддерживают украинскую и русскую локализацию.',
    valueThreeTitle: 'Два языка',
    valueTwoBody: 'Категории, поиск и страницы товаров постепенно готовим под большой ассортимент.',
    valueTwoTitle: 'Удобный каталог',
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

const richText = (...children: (ReturnType<typeof heading> | ReturnType<typeof paragraph>)[]) => ({
  root: {
    type: 'root' as const,
    children,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const contentBlock = (
  appearance: 'cards' | 'plain' | 'quotes' | 'spotlightSteps' | 'steps',
  columns: {
    heading?: 'h2' | 'h3' | 'h4'
    size?: 'oneThird' | 'half' | 'twoThirds' | 'full'
    text: string
    title: string
  }[],
) => ({
  appearance,
  blockType: 'content' as const,
  columns: columns.map((column) => ({
    size: column.size || 'oneThird',
    richText: richText(heading(column.title, column.heading || 'h3'), paragraph(column.text)),
    enableLink: false,
  })),
})

export const homePageData: (
  args: ProductArgs,
  locale?: HomeLocale,
) => RequiredDataFromCollectionSlug<'pages'> = (
  { categories, darkThemeImage, metaImage },
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
        darkThemeMedia: darkThemeImage,
        media: metaImage,
        richText: richText(heading(copy.heroTitle, 'h1'), paragraph(copy.heroBody)),
        textTheme: 'dark',
        variant: 'split',
        verticalPadding: 'large',
        links: [
          {
            link: {
              type: 'custom',
              appearance: 'default',
              label: copy.catalogCta,
              url: '/catalog',
            },
          },
        ],
      },
      {
        appearance: 'premiumBand',
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
        appearance: 'premiumTiles',
        blockType: 'categoryHighlights',
        introContent: richText(heading(copy.categoryTitle), paragraph(copy.categoryIntro)),
        populateBy: 'selection',
        categories,
      },
      {
        appearance: 'premiumGrid',
        blockType: 'featuredProducts',
        introContent: richText(heading(copy.popularTitle), paragraph(copy.popularIntro)),
        populateBy: 'collection',
        relationTo: 'products',
        limit: 4,
      },
      contentBlock('spotlightSteps', [
        {
          title: copy.stepOneTitle,
          text: copy.stepOneBody,
        },
        {
          title: copy.stepTwoTitle,
          text: copy.stepTwoBody,
        },
        {
          title: copy.stepThreeTitle,
          text: copy.stepThreeBody,
        },
      ]),
      contentBlock('cards', [
        {
          title: copy.valueOneTitle,
          text: copy.valueOneBody,
        },
        {
          title: copy.valueTwoTitle,
          text: copy.valueTwoBody,
        },
        {
          title: copy.valueThreeTitle,
          text: copy.valueThreeBody,
        },
      ]),
      {
        appearance: 'premiumCards',
        blockType: 'testimonials',
        introContent: richText(heading(copy.testimonialTitle)),
        items: [
          {
            authorName: copy.testimonialOneAuthor,
            authorRole: copy.testimonialOneRole,
            quote: copy.testimonialOneQuote,
            rating: 5,
          },
          {
            authorName: copy.testimonialTwoAuthor,
            authorRole: copy.testimonialTwoRole,
            quote: copy.testimonialTwoQuote,
            rating: 5,
          },
          {
            authorName: copy.testimonialThreeAuthor,
            authorRole: copy.testimonialThreeRole,
            quote: copy.testimonialThreeQuote,
            rating: 5,
          },
        ],
      },
    ],
    meta: {
      description: copy.metaDescription,
      image: metaImage,
      title: copy.metaTitle,
    },
    title: copy.pageTitle,
  }
}
