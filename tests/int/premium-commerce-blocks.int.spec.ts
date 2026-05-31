import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const projectRoot = process.cwd()

const readSource = (path: string) => readFileSync(join(projectRoot, path), 'utf8')

describe('premium commerce CMS blocks', () => {
  it('registers dedicated premium commerce content blocks on pages', () => {
    const pagesSource = readSource('src/collections/Pages/index.ts')
    const renderBlocksSource = readSource('src/blocks/RenderBlocks.tsx')

    expect(pagesSource).toContain('FeaturedProducts')
    expect(pagesSource).toContain('CategoryHighlights')
    expect(pagesSource).toContain('Testimonials')
    expect(renderBlocksSource).toContain('featuredProducts')
    expect(renderBlocksSource).toContain('categoryHighlights')
    expect(renderBlocksSource).toContain('testimonials')
  })

  it('shows block picker previews for ecommerce content blocks', () => {
    const categoryHighlightsSource = readSource('src/blocks/CategoryHighlights/config.ts')
    const featuredProductsSource = readSource('src/blocks/FeaturedProducts/config.ts')
    const testimonialsSource = readSource('src/blocks/Testimonials/config.ts')
    const contentSource = readSource('src/blocks/Content/config.ts')
    const blockPreviewSource = readSource('src/blocks/blockPreview.ts')

    expect(blockPreviewSource).toContain('images')
    expect(blockPreviewSource).toContain('thumbnail')
    expect(categoryHighlightsSource).toContain("blockPreview('category-highlights'")
    expect(featuredProductsSource).toContain("blockPreview('featured-products'")
    expect(testimonialsSource).toContain("blockPreview('testimonials'")
    expect(contentSource).toContain("blockPreview('content'")
  })

  it('keeps the document preview buttons available without replacing the default edit view', () => {
    const pagesSource = readSource('src/collections/Pages/index.ts')
    const productsSource = readSource('src/collections/Products/index.ts')

    expect(pagesSource).toContain('livePreview')
    expect(productsSource).toContain('livePreview')
    expect(pagesSource).toContain('preview: (data, { req }) =>')
    expect(productsSource).toContain('preview: (data, { req }) =>')
    expect(pagesSource).not.toContain('views: {')
    expect(productsSource).not.toContain('views: {')
  })

  it('lets hero backgrounds be configured separately for light and dark themes', () => {
    const heroConfigSource = readSource('src/blocks/Hero/config.ts')
    const heroComponentSource = readSource('src/blocks/Hero/Component.tsx')

    expect(heroConfigSource).toContain("name: 'backgroundColor'")
    expect(heroConfigSource).toContain("name: 'darkBackgroundColor'")
    expect(heroConfigSource).toContain("name: 'backgroundMedia'")
    expect(heroConfigSource).toContain("name: 'darkBackgroundMedia'")
    expect(heroComponentSource).toContain('darkBackgroundColor')
    expect(heroComponentSource).toContain('--hero-bg-light')
    expect(heroComponentSource).toContain('--hero-bg-dark')
  })

  it('gives testimonials a dedicated CMS model with rating, author, role, quote, and avatar fields', () => {
    const testimonialsConfigSource = readSource('src/blocks/Testimonials/config.ts')

    expect(testimonialsConfigSource).toContain("slug: 'testimonials'")
    expect(testimonialsConfigSource).toContain("name: 'rating'")
    expect(testimonialsConfigSource).toContain("name: 'quote'")
    expect(testimonialsConfigSource).toContain("name: 'authorName'")
    expect(testimonialsConfigSource).toContain("name: 'authorRole'")
    expect(testimonialsConfigSource).toContain("name: 'avatar'")
    expect(testimonialsConfigSource).toContain('localized: true')
  })

  it('lets category tiles be managed from the CMS with image and localized description fields', () => {
    const categoriesSource = readSource('src/collections/Categories.ts')

    expect(categoriesSource).toContain("name: 'image'")
    expect(categoriesSource).toContain("relationTo: 'media'")
    expect(categoriesSource).toContain("name: 'description'")
    expect(categoriesSource).toContain('localized: true')
  })

  it('uses the dedicated premium blocks in the seeded home page', () => {
    const homeSeedSource = readSource('src/endpoints/seed/home.ts')

    expect(homeSeedSource).toContain("blockType: 'categoryHighlights'")
    expect(homeSeedSource).toContain("blockType: 'featuredProducts'")
    expect(homeSeedSource).toContain("blockType: 'testimonials'")
    expect(homeSeedSource).not.toContain("blockType: 'archive'")
  })

  it('supports a spotlight process card layout while keeping numbered steps', () => {
    const contentConfigSource = readSource('src/blocks/Content/config.ts')
    const contentComponentSource = readSource('src/blocks/Content/Component.tsx')

    expect(contentConfigSource).toContain("value: 'spotlightSteps'")
    expect(contentComponentSource).toContain("appearance === 'spotlightSteps'")
    expect(contentComponentSource).toContain('padStart(2')
  })

  it('supports a CMS-driven catalog mega menu with category hierarchy and featured products', () => {
    const headerGlobalSource = readSource('src/globals/Header.ts')
    const categoriesSource = readSource('src/collections/Categories.ts')
    const headerSource = readSource('src/components/Header/index.tsx')
    const headerClientSource = readSource('src/components/Header/index.client.tsx')

    expect(headerGlobalSource).toContain("name: 'enableMegaMenu'")
    expect(headerGlobalSource).toContain("name: 'megaMenuCategories'")
    expect(categoriesSource).toContain("name: 'parent'")
    expect(categoriesSource).toContain("name: 'showInMegaMenu'")
    expect(categoriesSource).toContain("name: 'featuredProducts'")
    expect(headerSource).toContain('megaMenu')
    expect(headerClientSource).toContain('MegaMenuPanel')
  })

  it('keeps catalog mega menu content controlled by selected CMS categories and supports mobile access', () => {
    const headerSource = readSource('src/components/Header/index.tsx')
    const headerClientSource = readSource('src/components/Header/index.client.tsx')
    const mobileMenuSource = readSource('src/components/Header/MobileMenu.tsx')

    expect(headerSource).toContain('selectedMegaMenuCategoryIDs')
    expect(headerSource).toContain('selectedMegaMenuCategoryIDs.length')
    expect(headerClientSource).toContain('MobileCatalogMenu locale={activeLocale} megaMenu={megaMenu}')
    expect(headerClientSource).toContain('router.push(nextHref, { scroll: false })')
    expect(headerClientSource).toContain('router.refresh()')
    expect(mobileMenuSource).toContain('router.push(nextPath, { scroll: false })')
    expect(mobileMenuSource).toContain('router.refresh()')
    expect(headerClientSource).toContain('md:hidden')
    expect(headerClientSource).toContain('max-md:size-10')
    expect(mobileMenuSource).toContain('export function MobileCatalogMenu')
    expect(mobileMenuSource).toContain('closeCatalogMenu')
    expect(mobileMenuSource).toContain('onClick={closeCatalogMenu}')
    expect(mobileMenuSource).toContain('setIsOpen(true)')
    expect(mobileMenuSource).toContain('sr-only')
    expect(mobileMenuSource).toContain('megaMenuRootCategories')
  })

  it('provides a dedicated catalog landing page for category hierarchy', () => {
    const catalogPageSource = readSource('src/app/(app)/catalog/page.tsx')
    const categoryPageSource = readSource('src/app/(app)/catalog/[slug]/page.tsx')
    const headerClientSource = readSource('src/components/Header/index.client.tsx')
    const categoryLinksSource = readSource('src/utilities/categoryLinks.ts')

    expect(catalogPageSource).toContain("collection: 'categories'")
    expect(catalogPageSource).toContain('rootCategories')
    expect(catalogPageSource).toContain('childCategoriesByParent')
    expect(catalogPageSource).toContain('featuredProducts')
    expect(catalogPageSource).toContain('getFeaturedProductCardsByID')
    expect(catalogPageSource).toContain('getCategoryHref')
    expect(categoryPageSource).toContain("slug: {")
    expect(categoryPageSource).toContain("parent: {")
    expect(categoryPageSource).toContain('childCategories')
    expect(categoryPageSource).toContain('CatalogListingSection')
    expect(categoryPageSource).toContain('getCatalogListingProducts')
    expect(categoryLinksSource).toContain('/catalog/${category.slug || category.id}')
    expect(headerClientSource).toContain("localizePath('/catalog'")
  })

  it('formats prices in UAH by default across storefront components', () => {
    const priceSource = readSource('src/components/Price.tsx')

    expect(priceSource).toContain('currencyCodeFromProps ?? UAH.code')
  })
})
