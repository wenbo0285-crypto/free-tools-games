import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="麵包屑導航" className="mb-6 text-sm text-gray-500">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && <span className="mx-1">/</span>}
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-gray-700">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-gray-900' : ''}>{item.label}</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
