export function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{title}</h1>
      <p className="text-slate-400">Page à venir.</p>
    </div>
  )
}
