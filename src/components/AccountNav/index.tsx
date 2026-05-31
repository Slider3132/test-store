'use client'

import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useDictionary, useLocale } from '@/i18n/client'
import { localizePath } from '@/i18n/config'

type Props = {
  className?: string
}

export const AccountNav: React.FC<Props> = ({ className }) => {
  const pathname = usePathname()
  const dictionary = useDictionary()
  const locale = useLocale()

  return (
    <div className={clsx(className)}>
      <ul className="flex flex-col gap-2">
        <li>
          <Button asChild variant="link">
            <Link
              href={localizePath('/account', locale)}
              className={clsx('text-primary/50 hover:text-primary hover:no-underline', {
                'text-primary': pathname === '/account',
              })}
            >
              {dictionary.account.details}
            </Link>
          </Button>
        </li>

        <li>
          <Button asChild variant="link">
            <Link
              href={localizePath('/account/addresses', locale)}
              className={clsx('text-primary/50 hover:text-primary hover:no-underline', {
                'text-primary': pathname === '/account/addresses',
              })}
            >
              {dictionary.account.addresses}
            </Link>
          </Button>
        </li>

        <li>
          <Button
            asChild
            variant="link"
            className={clsx('text-primary/50 hover:text-primary hover:no-underline', {
              'text-primary': pathname === '/orders' || pathname.includes('/orders'),
            })}
          >
            <Link href={localizePath('/orders', locale)}>{dictionary.account.orders}</Link>
          </Button>
        </li>
      </ul>

      <hr className="w-full border-white/5" />

      <Button
        asChild
        variant="link"
        className={clsx('text-primary/50 hover:text-primary hover:no-underline', {
          'text-primary': pathname === '/logout',
        })}
      >
        <Link href={localizePath('/logout', locale)}>{dictionary.account.logOut}</Link>
      </Button>
    </div>
  )
}
