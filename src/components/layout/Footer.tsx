import Link from 'next/link'
import { siteConfig, footerLinks } from '@/data/site'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {siteConfig.name}. 保留所有權利。
        </p>
        <nav className="flex gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
