interface FaqItem {
  question: string
  answer: string
}

interface SEOContentSectionProps {
  title: string
  children?: React.ReactNode
}

interface FaqSectionProps {
  items: FaqItem[]
}

interface StepListProps {
  steps: string[]
}

export function SeoH1({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-6 text-3xl font-bold text-gray-900">{children}</h1>
}

export function SeoH2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 mt-10 text-2xl font-semibold text-gray-800">{children}</h2>
}

export function SeoContentSection({ title, children }: SEOContentSectionProps) {
  return (
    <section className="mb-8">
      <SeoH2>{title}</SeoH2>
      <div className="leading-relaxed text-gray-600">{children}</div>
    </section>
  )
}

export function FaqSection({ items }: FaqSectionProps) {
  return (
    <section className="mb-8">
      <SeoH2>常見問題</SeoH2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-gray-200 p-4">
            <h3 className="mb-2 font-medium text-gray-900">{item.question}</h3>
            <p className="text-sm leading-relaxed text-gray-600">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function StepList({ steps }: StepListProps) {
  return (
    <ol className="list-inside list-decimal space-y-2 text-gray-600">
      {steps.map((step, index) => (
        <li key={index} className="leading-relaxed">{step}</li>
      ))}
    </ol>
  )
}
