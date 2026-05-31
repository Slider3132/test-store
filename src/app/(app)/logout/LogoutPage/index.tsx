'use client'

import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import React, { Fragment, useEffect, useState } from 'react'
import { useDictionary, useLocale } from '@/i18n/client'
import { localizePath } from '@/i18n/config'

export const LogoutPage: React.FC = (props) => {
  const { logout } = useAuth()
  const dictionary = useDictionary()
  const locale = useLocale()
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout()
        setSuccess(dictionary.auth.loggedOut)
      } catch (_) {
        setError(dictionary.auth.alreadyLoggedOut)
      }
    }

    void performLogout()
  }, [dictionary.auth.alreadyLoggedOut, dictionary.auth.loggedOut, logout])

  return (
    <Fragment>
      {(error || success) && (
        <div className="prose dark:prose-invert">
          <h1>{error || success}</h1>
          <p>
            {dictionary.auth.nextAfterLogout}
            <Fragment>
              {' '}
              <Link href={localizePath('/catalog', locale)}>{dictionary.auth.shopLink}</Link>
              {dictionary.auth.toShop}
            </Fragment>
            {` ${dictionary.auth.logBackIn}`}
            <Link href={localizePath('/login', locale)}>{dictionary.account.clickHere}</Link>.
          </p>
        </div>
      )}
    </Fragment>
  )
}
