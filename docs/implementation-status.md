# Статус реалізації ecommerce-проєкту

Дата оновлення: 2026-05-19

Цей документ фіксує, що вже реалізовано в проєкті після стартового Payload Ecommerce Template, які рішення були прийняті, як зараз працює каталог, CMS, seed-дані, локалізація, фільтри, media та адмінка.

## Короткий підсумок

Проєкт перетворено зі стандартного Payload ecommerce starter на основу single-seller ecommerce з локалізованим storefront, CMS-керованими сторінками, каталогом категорій, товарами, варіантами, базовими фільтрами, корзиною, акаунтом, checkout flow і demo-каталогом у Supabase/Postgres.

Поточний напрям:

- `catalog` є основною точкою входу в категорії та підкатегорії.
- `shop` використовується як універсальна товарна видача з фільтрами, сортуванням, пагінацією і grid/list controls.
- Головна сторінка має керуватися через CMS-блоки, а не хардкодом.
- Категорії, товари, media, варіанти й product type schema керуються через Payload admin.
- Demo-каталог можна повністю очистити, перестворити й перевірити скриптами.

## Коміти

Основні етапи вже закомічені:

- `91a171e feat: add localized commerce catalog foundation`
- `1357d81 feat: add product type variants and demo catalog seed`
- `e5c98e7 feat: adapt product filters to product type schema`
- `5df5411 feat: generate distinct demo product imagery`

## Локалізація

Реалізовано базову двомовність для storefront:

- українська;
- російська;
- locale-aware UI labels;
- перемикач мови в header;
- локалізовані сторінки, категорії, товари, seed-контент;
- частина admin labels перекладена через `src/i18n/adminLabels.ts`.

Ключові файли:

- `src/i18n/config.ts`
- `src/i18n/dictionary.ts`
- `src/i18n/request.ts`
- `src/i18n/client.ts`
- `src/i18n/adminLabels.ts`

Поточна логіка: контент у Payload може мати окремі значення для `uk` і `ru`. Storefront читає локалізований контент відповідно до активної локалі.

## Header

Header був перероблений під ecommerce UX:

- логотип веде на головну;
- основний пункт меню “Каталог” відкриває mega menu;
- глобальний пошук винесений у header;
- додані іконки мови, теми, акаунта і кошика;
- кошик має icon/badge;
- акаунт має dropdown з діями;
- прибрано старий чорний dashboard/logout bar;
- header зроблено sticky, щоб кошик/акаунт були доступні під час скролу.

Ключові файли:

- `src/components/Header/index.tsx`
- `src/components/Header/index.client.tsx`
- `src/components/Header/MobileMenu.tsx`
- `src/components/Header/HeaderSearch.tsx`
- `src/components/Header/index.css`
- `src/globals/Header.ts`

Важливе правило: навігаційні пункти не мають хардкодитись у компонентах, якщо вони є в CMS. Для header використовується global `Header`.

## Footer

Footer очищено від зайвих template-посилань типу `Source Code` і дефолтного Payload wording.

Поточний принцип:

- footer не має дублювати адмінські dev-links;
- посилання на адмінку логічніше тримати в account/admin menu або в службовій зоні, а не як головний footer CTA;
- footer має бути внизу сторінки навіть при короткому контенті.

Ключові файли:

- `src/components/Footer/index.tsx`
- `src/components/Footer/menu.tsx`
- `src/globals/Footer.ts`

## CMS-керована головна сторінка

Головна сторінка переведена в бік CMS/page-builder підходу:

- hero section;
- premium-looking content blocks;
- блок популярних товарів;
- блок категорій/швидкого старту;
- “як ми працюємо”;
- testimonials;
- CTA.

Головна не має лишатися шаблонним Payload welcome page. Контент має редагуватися через Pages у Payload admin.

Ключові файли:

- `src/collections/Pages/index.ts`
- `src/blocks/RenderBlocks.tsx`
- `src/heros/RenderHero.tsx`
- `src/heros/SplitImpact/index.tsx`
- `src/endpoints/seed/home.ts`
- `src/endpoints/seed/home-static.ts`

## CMS-блоки

Додано/адаптовано блоки під ecommerce/premium layout:

- `Call to Action`
- `Плитка категорій`
- `Підбірка товарів`
- `Отзывы / Відгуки`
- `Content`
- `Media Block`
- `Archive`
- `Carousel`
- `Three Item Grid`
- `Banner`
- `Form Block`

Для admin block picker додано прев’ю:

- `public/admin/block-previews/*.svg`
- `src/blocks/blockPreview.ts`

Ключові блоки:

- `src/blocks/CategoryHighlights/*`
- `src/blocks/FeaturedProducts/*`
- `src/blocks/Testimonials/*`
- `src/blocks/ThreeItemGrid/*`
- `src/blocks/Carousel/*`
- `src/blocks/CallToAction/*`
- `src/blocks/Banner/*`

## Каталог і Shop

Поточна концепція:

- `/catalog` показує дерево категорій.
- `/catalog/[slug]` показує сторінку конкретної категорії або підкатегорії.
- `/shop` є товарною видачею.
- `/shop?category=<id>` показує товари в межах категорії.

Різниця:

- `catalog` відповідає за навігацію, структуру, breadcrumb, підкатегорії, category hero.
- `shop` відповідає за список товарів, фільтри, сортування, пагінацію, grid controls.

Для великого каталогу це правильніше, ніж тримати все тільки на `/shop`.

Ключові файли:

- `src/app/(app)/catalog/page.tsx`
- `src/app/(app)/catalog/[slug]/page.tsx`
- `src/app/(app)/shop/page.tsx`
- `src/app/(app)/shop/layout.tsx`
- `src/components/ProductListing/index.tsx`
- `src/components/ProductListing/ListingPagination.tsx`
- `src/components/ProductListing/ViewModeToggle.tsx`
- `src/utilities/categoryBreadcrumbs.ts`
- `src/utilities/categoryLinks.ts`
- `src/utilities/getCategoryDescendantIDs.ts`

## Mega Menu

Mega menu зроблено як каталогічний патерн, а не просто nav dropdown:

- пункт “Каталог” у header відкриває меню;
- категорії беруться з Payload;
- підтримується `showInMegaMenu`;
- є `megaMenuCategories` у global Header;
- категорії можуть мати `featuredProducts`;
- мобільна навігація має окрему поведінку.

Ключові файли:

- `src/globals/Header.ts`
- `src/components/Header/index.client.tsx`
- `src/components/Header/MobileMenu.tsx`
- `src/components/Admin/CategoryCascadeView.tsx`

## Категорії

Категорії підтримують:

- `title`;
- `description`;
- `parent`;
- `productType`;
- `showInMegaMenu`;
- `featuredProducts`;
- `image`;
- `slug`;
- приховане `adminTitle`.

`adminTitle` потрібен для зручного вибору категорій у relationship dropdown. Замість плоского списку типу `Шкіряні`, `Шкіряні`, `Швидкі`, тепер category title для адмінки має виглядати як шлях:

```text
Взуття / Черевики / Шкіряні
Аксесуари / Гаманці / Шкіряні
```

Ключові файли:

- `src/collections/Categories.ts`
- `scripts/backfill-category-admin-titles.ts`

Команда для backfill:

```bash
pnpm seed:demo-catalog:admin-titles
```

## Види товарів

Додано окрему колекцію видів товарів:

- `ProductTypes`
- схеми варіантів;
- схеми атрибутів;
- зв’язок категорії з product type;
- автопідтягування product type для товару з категорії.

Ціль: не змішувати всі фільтри в глобальний пошук. Для широких категорій мають бути загальні фільтри, а для вузьких категорій специфічні атрибути.

Приклад:

- одяг: колір, розмір, матеріал, стиль;
- взуття: колір, розмір взуття;
- електроніка: колір, об’єм памʼяті;
- аксесуари: колір;
- дім: колір.

Ключові файли:

- `src/collections/ProductTypes.ts`
- `src/collections/Products/index.ts`
- `src/plugins/index.ts`

## Товари

Товари розширено beyond default template:

- `price`;
- `compareAtPrice`;
- `currency`;
- `productType`;
- `availableVariantOptions`;
- `attributeValues`;
- `mediaVariantType`;
- `gallery` з прив’язкою до variant option;
- `reviewSummary`;
- `reviews`;
- опис;
- layout/content blocks;
- SEO/meta.

Ключові файли:

- `src/collections/Products/index.ts`
- `src/components/ProductGridItem/index.tsx`
- `src/components/product/ProductDescription.tsx`
- `src/components/product/VariantSelector.tsx`
- `src/components/product/Gallery.tsx`
- `src/components/product/StockIndicator.tsx`

## Variants

Варіанти тепер будуються навколо product type schema:

- variant options мають типи;
- color options мають `swatch`;
- деякі осі впливають на media;
- деякі осі впливають тільки на inventory.

Приклад логіки:

- колір футболки впливає на фото;
- розмір S/M/L не впливає на фото, але впливає на залишки;
- для товару можна вибрати доступні варіантні опції.

Seed перед створенням варіантів видаляє старі variants конкретного товару, щоб повторний запуск не падав на дублях комбінацій.

Ключові файли:

- `src/plugins/index.ts`
- `src/collections/Products/index.ts`
- `scripts/seed-demo-catalog.ts`

## Фільтри

Фільтри адаптовано під product type schema:

- базові фільтри: наявність, ціна;
- category filter прибрано там, де категорія вже задана сторінкою;
- додано фільтрацію за variant option;
- додано фільтрацію за attributes;
- sort винесено над списком товарів;
- shop/catalog listing мають однакову логіку видачі.

Ключові файли:

- `src/components/layout/search/PriceFilter.tsx`
- `src/components/layout/search/ShopSortSelect.tsx`
- `src/components/layout/search/filter/*`
- `src/utilities/productFilterWhere.ts`
- `src/app/(app)/shop/page.tsx`
- `src/app/(app)/catalog/[slug]/page.tsx`

## Product Listing

Список товарів дороблено під ecommerce:

- показ кількості знайдених товарів;
- сортування;
- перемикач grid density;
- pagination;
- картки товарів з новою/старою ціною;
- кнопка додавання в кошик;
- підтримка `compareAtPrice`;
- UAH formatting.

Ключові файли:

- `src/components/ProductListing/index.tsx`
- `src/components/ProductListing/ViewModeToggle.tsx`
- `src/components/ProductListing/ListingPagination.tsx`
- `src/components/ProductGridItem/index.tsx`
- `src/components/ProductGridItem/AddProductCardButton.tsx`
- `src/components/Price.tsx`

## Пошук

Додано глобальний пошук у header:

- live search;
- пошук товарів;
- пошук категорій;
- dropdown з результатами.

Ключові файли:

- `src/components/Header/HeaderSearch.tsx`
- `src/app/(app)/next/search/route.ts`

## Cart, account, checkout

Збережено й адаптовано основний ecommerce flow:

- cart icon у header;
- cart modal;
- add to cart;
- checkout page;
- confirm order;
- account;
- addresses;
- orders;
- find order;
- login/logout/create account.

Ключові файли:

- `src/components/Cart/*`
- `src/app/(app)/checkout/page.tsx`
- `src/app/(app)/checkout/confirm-order/page.tsx`
- `src/app/(app)/(account)/*`
- `src/components/forms/CheckoutForm/index.tsx`
- `src/components/checkout/*`

## Ціни та валюта

Ціни були переведені в UAH-facing модель:

- `price`;
- `compareAtPrice`;
- `currency`;
- форматування гривні у storefront;
- підтримка старої/нової ціни на картці.

Ключові файли:

- `src/lib/currency.ts`
- `src/fields/priceFields.ts`
- `src/hooks/syncPriceFields.ts`
- `src/components/Price.tsx`
- `src/collections/Products/index.ts`

## Media і Storage

Підключено media flow через Payload upload collection і S3/Supabase-compatible storage adapter.

Після останнього seed:

- demo media: `550`;
- media генеруються як WebP;
- кожен demo product має 2 gallery images для кольорових варіантів;
- category cover images також генеруються;
- зображення тепер не мають бути однаковими всюди.

Ключові файли:

- `src/collections/Media.ts`
- `src/plugins/index.ts`
- `scripts/seed-demo-catalog.ts`

Перевірені media endpoints:

```text
/api/media/file/demo-clothing-product-01-black.webp -> 200
/_next/image?...demo-clothing-product-01-black.webp&q=90 -> 200
```

Важливий нюанс: Next image optimizer дозволяє тільки `q=90` або `q=100`, бо в `next.config.ts` задано:

```ts
images: {
  qualities: [90, 100]
}
```

Якщо вручну запросити `_next/image` з `q=75`, Next поверне `400`. Компонент `Media/Image` використовує `quality={90}`, тому штатні картки мають працювати.

## Demo catalog seed

Додано повний demo seed для нового каталогу:

- 5 root categories;
- у кожній root category 3 підкатегорії;
- у кожній підкатегорії 2 child-підкатегорії;
- 50 категорій загалом;
- по 5 товарів на кожному рівні;
- 250 товарів;
- 800 variants;
- 550 media files.

Команди:

```bash
pnpm seed:demo-catalog:cleanup
pnpm seed:demo-catalog
pnpm seed:demo-catalog:verify
pnpm seed:demo-catalog:admin-titles
```

Швидкий dry run:

```bash
pnpm seed:demo-catalog -- --dry-run
```

Обмежений test seed:

```bash
pnpm seed:demo-catalog -- --max-categories=1 --products-per-category=1 --skip-header
```

Швидкий режим з повторним використанням існуючих media:

```bash
pnpm seed:demo-catalog -- --reuse-media
```

Для нормального візуального демо цей режим краще не використовувати, бо він може знову дати повторювані картинки.

## Поточна verification

Остання перевірка seed:

```json
{
  "categories": 50,
  "media": 550,
  "productTypes": 5,
  "products": 250,
  "sample": {
    "availableVariantOptions": 4,
    "compareAtPrice": 885,
    "gallery": 2,
    "productType": true,
    "reviews": 2,
    "slug": "demo-clothing-product-01"
  },
  "variants": 800
}
```

Останні локальні перевірки:

```bash
pnpm lint --quiet
pnpm exec tsc --noEmit --pretty false
pnpm build
```

Результат: збірка пройшла.

## Supabase/Postgres

Проєкт працює з Supabase Postgres через `DATABASE_URL`.

Важливо:

- secrets не комітити;
- `.env` не документувати з реальними значеннями;
- `service_role` не використовувати на клієнті;
- для storefront використовуються public/publishable env only;
- для Payload/серверних операцій достатньо server-side env.

## Admin UX

Покращення:

- admin labels частково локалізовані;
- додано cascade view для categories list;
- додано `adminTitle` для ієрархічного відображення категорій у relationship fields;
- block picker має visual previews;
- seed button/admin helper залишено для dev flow.

Ключові файли:

- `src/components/Admin/CategoryCascadeView.tsx`
- `src/collections/Categories.ts`
- `src/i18n/adminLabels.ts`
- `public/admin/block-previews/*`

Поточне обмеження: Payload relationship dropdown все ще є стандартним dropdown. Ми покращили label, але не замінили сам компонент на кастомний tree selector. Якщо потрібно максимальне UX-рішення для 75+ категорій, наступний крок - кастомний category picker для Product admin.

## Відомі нюанси

- Seed на Supabase повільний, бо створює багато документів, media і variants через Payload API.
- Паралельний запуск двох Payload init процесів може спричинити Drizzle schema push race. Так сталося при одночасному `verify` і `admin-titles`. Запускати такі скрипти краще послідовно.
- Старі ручні категорії без валідного `slug` можуть падати при mass update. Backfill admin title зараз обмежено `demo-*` категоріями.
- Згенеровані demo images є product-like placeholders, а не реальні фотографії товарів.
- Для production потрібні реальні фото, SEO-тексти, політики, checkout/payment details, доставка, email adapter.
- Admin localization ще не є повністю ідеальною для всіх системних Payload рядків.

## Що робити далі

Рекомендований порядок наступних робіт:

1. Зробити кастомний category picker у Product admin, якщо стандартного relationship dropdown з `adminTitle` недостатньо.
2. Доробити product type schema editor: зручне керування атрибутами, variant axes, swatches і впливом на media/inventory.
3. Доробити фільтри під реальні product types: size/color/material/brand/availability/rating залежно від категорії.
4. Замінити demo placeholders на реальні або AI-згенеровані product images, якщо треба презентаційний демо-магазин.
5. Перевірити mobile UX: header, mega menu, search, cart, account dropdown.
6. Додати production checkout/payment/delivery configuration.
7. Додати e2e coverage для catalog -> product -> cart -> checkout.
