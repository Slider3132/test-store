'use client'

import { getTranslation } from '@payloadcms/translations'
import { FieldError, useDocumentInfo, useField, useLocale, useTranslation } from '@payloadcms/ui'
import { type ReactNode, useEffect, useMemo, useState } from 'react'

import type { Category } from '@/payload-types'

import './CategoryTreeSelect.css'

type CategoryOption = Pick<Category, 'id' | 'parent' | 'slug' | 'title'> & {
  children: CategoryOption[]
}

type Props = {
  field: {
    admin?: {
      custom?: {
        rootOnly?: boolean
      }
    }
    hasMany?: boolean
    label?: Record<string, string> | string
    required?: boolean
  }
  path: string
}

const getID = (value: unknown): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'object' && 'id' in value) return String(value.id)
  return String(value)
}

const normalizeSelection = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(getID).filter(Boolean) as string[]
  }

  const id = getID(value)
  return id ? [id] : []
}

const buildTree = (categories: Category[]): CategoryOption[] => {
  const nodes = new Map<string, CategoryOption>()
  const roots: CategoryOption[] = []

  for (const category of categories) {
    nodes.set(String(category.id), {
      id: category.id,
      parent: category.parent,
      slug: category.slug,
      title: category.title,
      children: [],
    })
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

  const sortNodes = (items: CategoryOption[]) => {
    items.sort((a, b) => String(a.title).localeCompare(String(b.title), 'uk'))
    for (const item of items) sortNodes(item.children)
  }

  sortNodes(roots)
  return roots
}

const nodeMatches = (node: CategoryOption, query: string): boolean => {
  if (!query) return true

  const haystack = `${node.title} ${node.slug}`.toLocaleLowerCase()
  return (
    haystack.includes(query.toLocaleLowerCase()) ||
    node.children.some((child) => nodeMatches(child, query))
  )
}

const collectIDs = (nodes: CategoryOption[]): string[] => {
  return nodes.flatMap((node) => [String(node.id), ...collectIDs(node.children)])
}

export const CategoryTreeSelect = ({ field, path }: Props) => {
  const hasMany = Boolean(field.hasMany)
  const rootOnly = Boolean(field.admin?.custom?.rootOnly)
  const locale = useLocale()
  const { id: currentDocumentID } = useDocumentInfo()
  const { i18n } = useTranslation()
  const isRu = i18n.language === 'ru'
  const copy = {
    collapse: isRu ? 'Свернуть' : 'Згорнути',
    empty: isRu ? 'Категории еще не созданы.' : 'Категорії ще не створені.',
    expand: isRu ? 'Развернуть' : 'Розгорнути',
    loading: isRu ? 'Загрузка категорий...' : 'Завантаження категорій...',
    rootOnlyHint: isRu
      ? 'Для мегаменю выбираются только категории верхнего уровня.'
      : 'Для мега-меню вибираються тільки категорії верхнього рівня.',
    search: isRu ? 'Поиск категории...' : 'Пошук категорії...',
    selected: isRu ? 'Выбрано' : 'Вибрано',
  }
  const { errorMessage, setValue, showError, value } = useField<unknown>({ path })
  const [categories, setCategories] = useState<Category[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    const loadCategories = async () => {
      setLoading(true)

      try {
        const params = new URLSearchParams({
          depth: '0',
          limit: '1000',
          sort: 'title',
        })

        if (locale?.code) {
          params.set('locale', locale.code)
        }

        const response = await fetch(`/api/categories?${params.toString()}`, {
          credentials: 'same-origin',
          signal: controller.signal,
        })
        const data = (await response.json()) as { docs?: Category[] }
        const docs = data.docs || []

        setCategories(docs)
        setExpanded(new Set(collectIDs(buildTree(docs)).slice(0, 20)))
      } catch {
        if (!controller.signal.aborted) {
          setCategories([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadCategories()

    return () => controller.abort()
  }, [locale?.code])

  const selectedIDs = useMemo(() => normalizeSelection(value), [value])
  const selectedSet = useMemo(() => new Set(selectedIDs), [selectedIDs])
  const idValueMap = useMemo(
    () => new Map(categories.map((category) => [String(category.id), category.id])),
    [categories],
  )
  const tree = useMemo(() => buildTree(categories), [categories])
  const visibleTree = rootOnly ? tree.filter((node) => nodeMatches(node, query)) : tree
  const label = field.label ? getTranslation(field.label, i18n) : path

  const commitSelection = (ids: string[]) => {
    const values = ids.map((id) => idValueMap.get(id) ?? id)
    setValue(hasMany ? values : values[0] || null)
  }

  const toggleExpanded = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelected = (id: string) => {
    if (hasMany) {
      const next = selectedSet.has(id)
        ? selectedIDs.filter((selectedID) => selectedID !== id)
        : [...selectedIDs, id]
      commitSelection(next)
      return
    }

    commitSelection(selectedSet.has(id) ? [] : [id])
  }

  const renderNode = (node: CategoryOption, depth = 0): ReactNode => {
    const id = String(node.id)
    const hasChildren = node.children.length > 0
    const isOpen = expanded.has(id)
    const isCurrentDocument = currentDocumentID && id === String(currentDocumentID)
    const visibleChildren = node.children.filter((child) => nodeMatches(child, query))

    if (!nodeMatches(node, query) || isCurrentDocument) return null

    return (
      <div key={id}>
        <div className="category-tree-select__row" style={{ paddingLeft: 6 + depth * 22 }}>
          {hasChildren && !rootOnly ? (
            <button
              aria-expanded={isOpen}
              aria-label={isOpen ? copy.collapse : copy.expand}
              className="category-tree-select__toggle"
              data-open={isOpen}
              onClick={() => toggleExpanded(id)}
              type="button"
            >
              ›
            </button>
          ) : (
            <span className="category-tree-select__spacer" />
          )}
          <input
            checked={selectedSet.has(id)}
            className="category-tree-select__checkbox"
            id={`${path}-${id}`}
            name={`${path}-${id}`}
            onChange={() => toggleSelected(id)}
            type={hasMany ? 'checkbox' : 'radio'}
          />
          <label className="category-tree-select__title" htmlFor={`${path}-${id}`}>
            <span>{node.title}</span>
          </label>
        </div>
        {!rootOnly &&
          (isOpen || query) &&
          visibleChildren.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className={`category-tree-select${showError ? ' category-tree-select--error' : ''}`}>
      <label className="category-tree-select__label">
        {label}
        {field.required ? ' *' : ''}
      </label>
      <div className="category-tree-select__toolbar">
        <input
          className="category-tree-select__search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.search}
          type="search"
          value={query}
        />
      </div>
      {rootOnly ? (
        <div className="category-tree-select__hint">{copy.rootOnlyHint}</div>
      ) : null}
      <div className="category-tree-select__panel">
        {loading ? (
          <div className="category-tree-select__empty">{copy.loading}</div>
        ) : null}
        {!loading && tree.length === 0 ? (
          <div className="category-tree-select__empty">{copy.empty}</div>
        ) : null}
        {!loading ? visibleTree.map((node) => renderNode(node)) : null}
      </div>
      {selectedIDs.length > 0 ? (
        <div className="category-tree-select__selected">
          {copy.selected}: {selectedIDs.length}
        </div>
      ) : null}
      <FieldError message={errorMessage} path={path} showError={showError} />
    </div>
  )
}
