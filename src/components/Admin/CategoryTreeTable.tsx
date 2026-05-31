'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useTranslation } from '@payloadcms/ui'

import type { Category, ProductType } from '@/payload-types'

import './CategoryTreeTable.css'

type CategoryNode = Category & {
  children: CategoryNode[]
}

type Props = {
  adminRoute: string
  categories: Category[]
}

const getID = (value: unknown): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'object' && 'id' in value) return String(value.id)
  return String(value)
}

const getProductTypeTitle = (value: unknown) => {
  if (!value || typeof value !== 'object') return null
  const productType = value as ProductType
  return productType.title || productType.slug
}

const buildTree = (categories: Category[]) => {
  const nodes = new Map<string, CategoryNode>()
  const roots: CategoryNode[] = []

  for (const category of categories) {
    nodes.set(String(category.id), { ...category, children: [] })
  }

  for (const category of categories) {
    const node = nodes.get(String(category.id))
    const parentID = getID(category.parent)

    if (!node) continue

    if (parentID && nodes.has(parentID)) {
      nodes.get(parentID)?.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortNodes = (items: CategoryNode[]) => {
    items.sort((a, b) => String(a.title).localeCompare(String(b.title), 'uk'))
    for (const item of items) sortNodes(item.children)
  }

  sortNodes(roots)
  return roots
}

const flattenVisibleNodes = (
  nodes: CategoryNode[],
  expanded: Set<string>,
  depth = 0,
): Array<{ depth: number; node: CategoryNode }> => {
  const rows: Array<{ depth: number; node: CategoryNode }> = []

  for (const node of nodes) {
    rows.push({ depth, node })

    if (expanded.has(String(node.id))) {
      rows.push(...flattenVisibleNodes(node.children, expanded, depth + 1))
    }
  }

  return rows
}

export const CategoryTreeTable = ({ adminRoute, categories }: Props) => {
  const {
    i18n: { language },
  } = useTranslation()
  const isRu = language === 'ru'
  const copy = {
    children: isRu ? 'Подкатегории' : 'Підкатегорії',
    collapse: isRu ? 'Свернуть подкатегории' : 'Згорнути підкатегорії',
    empty: isRu ? 'Категории еще не созданы.' : 'Категорії ще не створені.',
    expand: isRu ? 'Развернуть подкатегории' : 'Розгорнути підкатегорії',
    hidden: isRu ? 'Скрыто' : 'Приховано',
    megaMenu: isRu ? 'Мегаменю' : 'Мега-меню',
    missing: isRu ? 'Не задано' : 'Не задано',
    productType: isRu ? 'Тип товаров' : 'Тип товарів',
    shown: isRu ? 'Показывается' : 'Показується',
    slug: isRu ? 'Slug' : 'Slug',
    title: isRu ? 'Название' : 'Назва',
  }
  const tree = useMemo(() => buildTree(categories), [categories])
  const [expanded, setExpanded] = useState(() => new Set(tree.map((node) => String(node.id))))
  const rows = useMemo(() => flattenVisibleNodes(tree, expanded), [expanded, tree])

  if (!categories.length) {
    return <div className="category-tree-table__empty">{copy.empty}</div>
  }

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="category-tree-table">
      <table className="category-tree-table__table">
        <thead>
          <tr>
            <th>{copy.title}</th>
            <th>{copy.slug}</th>
            <th>{copy.productType}</th>
            <th>{copy.megaMenu}</th>
            <th>{copy.children}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ depth, node }) => {
            const id = String(node.id)
            const hasChildren = node.children.length > 0
            const isOpen = expanded.has(id)

            return (
              <tr className="category-tree-table__row" key={id}>
                <td>
                  <span style={{ paddingLeft: depth * 24 }}>
                    {hasChildren ? (
                      <button
                        aria-expanded={isOpen}
                        aria-label={isOpen ? copy.collapse : copy.expand}
                        className="category-tree-table__toggle"
                        data-open={isOpen}
                        onClick={() => toggle(id)}
                        type="button"
                      >
                        ›
                      </button>
                    ) : (
                      <span className="category-tree-table__spacer" />
                    )}
                    <Link
                      className="category-tree-table__title"
                      href={`${adminRoute}/collections/categories/${node.id}`}
                    >
                      {node.title}
                    </Link>
                  </span>
                </td>
                <td className="category-tree-table__muted">{node.slug}</td>
                <td>
                  {getProductTypeTitle(node.productType) || (
                    <span className="category-tree-table__muted">{copy.missing}</span>
                  )}
                </td>
                <td>
                  <span className="category-tree-table__badge">
                    {node.showInMegaMenu ? copy.shown : copy.hidden}
                  </span>
                </td>
                <td className="category-tree-table__muted">{node.children.length}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
