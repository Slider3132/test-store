'use client'

import { createUrl } from '@/utilities/createUrl'
import { cn } from '@/utilities/cn'
import { Grid2X2, Grid3X3 } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

type Props = {
  activeView: '3' | '4'
}

export const ViewModeToggle: React.FC<Props> = ({ activeView }) => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  function setView(view: '3' | '4') {
    const params = new URLSearchParams(searchParams.toString())

    if (view === '4') {
      params.delete('view')
    } else {
      params.set('view', view)
    }

    router.replace(createUrl(pathname, params), { scroll: false })
  }

  return (
    <div className="hidden rounded-lg border bg-background p-1 md:flex">
      <button
        aria-label="3 columns"
        aria-pressed={activeView === '3'}
        className={cn(
          'grid size-9 place-items-center rounded-md text-muted-foreground transition',
          activeView === '3' && 'bg-primary text-primary-foreground shadow-sm',
        )}
        onClick={() => setView('3')}
        type="button"
      >
        <Grid2X2 className="size-4" />
      </button>
      <button
        aria-label="4 columns"
        aria-pressed={activeView === '4'}
        className={cn(
          'grid size-9 place-items-center rounded-md text-muted-foreground transition',
          activeView === '4' && 'bg-primary text-primary-foreground shadow-sm',
        )}
        onClick={() => setView('4')}
        type="button"
      >
        <Grid3X3 className="size-4" />
      </button>
    </div>
  )
}
