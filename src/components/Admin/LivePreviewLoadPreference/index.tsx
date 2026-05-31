'use client'

import { useDocumentInfo, useLivePreviewContext, usePreferences } from '@payloadcms/ui'
import React, { useEffect, useRef, useState } from 'react'

type AdminSettingsResponse = {
  openLivePreviewOnLoad?: boolean
}

export const LivePreviewLoadPreference: React.FC = () => {
  const { collectionSlug, globalSlug } = useDocumentInfo()
  const { isLivePreviewing, setIsLivePreviewing, url } = useLivePreviewContext()
  const { setPreference } = usePreferences()
  const [openOnLoad, setOpenOnLoad] = useState<boolean | null>(null)
  const appliedRef = useRef(false)
  const preferenceKey = collectionSlug ? `collection-${collectionSlug}` : `global-${globalSlug}`

  useEffect(() => {
    let isMounted = true

    const loadSettings = async () => {
      try {
        const response = await fetch('/api/globals/admin-settings?depth=0', {
          credentials: 'include',
        })

        if (!response.ok) {
          if (isMounted) setOpenOnLoad(false)
          return
        }

        const settings = (await response.json()) as AdminSettingsResponse

        if (isMounted) {
          setOpenOnLoad(Boolean(settings.openLivePreviewOnLoad))
        }
      } catch (_error) {
        if (isMounted) setOpenOnLoad(false)
      }
    }

    void loadSettings()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (appliedRef.current || openOnLoad === null || !preferenceKey || !url) {
      return
    }

    appliedRef.current = true

    if (openOnLoad) {
      void setPreference(preferenceKey, { editViewType: 'live-preview' }, true)
      setIsLivePreviewing(true)
      return
    }

    if (isLivePreviewing) {
      void setPreference(preferenceKey, { editViewType: 'default' }, true)
      setIsLivePreviewing(false)
    }
  }, [isLivePreviewing, openOnLoad, preferenceKey, setIsLivePreviewing, setPreference, url])

  return null
}
