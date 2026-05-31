import React, { Suspense } from 'react'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <div className="container my-16 flex flex-col gap-6 pb-4">{children}</div>
    </Suspense>
  )
}
