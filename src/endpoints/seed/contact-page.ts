import type { Form } from '@/payload-types'

import { RequiredDataFromCollectionSlug } from 'payload'

type ProductArgs = {
  contactForm: Form
}

type ContactLocale = 'ru' | 'uk'

const contactCopy = {
  uk: {
    introTitle: "Зв'яжіться з нами",
    metaDescription:
      'Контактна сторінка магазину: форма зворотного звʼязку та інформація для клієнтів.',
    metaTitle: 'Контакти',
    title: 'Контакти',
  },
  ru: {
    introTitle: 'Свяжитесь с нами',
    metaDescription:
      'Контактная страница магазина: форма обратной связи и информация для клиентов.',
    metaTitle: 'Контакты',
    title: 'Контакты',
  },
} satisfies Record<ContactLocale, Record<string, string>>

export const contactPageData: (
  args: ProductArgs,
  locale?: ContactLocale,
) => RequiredDataFromCollectionSlug<'pages'> = ({ contactForm }, locale = 'uk') => {
  const copy = contactCopy[locale]

  return {
    slug: 'contact',
    _status: 'published',
    meta: {
      description: copy.metaDescription,
      title: copy.metaTitle,
    },
    layout: [
      {
        blockType: 'formBlock',
        enableIntro: true,
        form: contactForm,
        introContent: {
          root: {
            type: 'root',
            children: [
              {
                type: 'heading',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: copy.introTitle,
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                tag: 'h3',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
    ],
    title: copy.title,
  }
}
