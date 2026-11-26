import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { HealthEvent } from '@/data/types'
import { fmt } from '@/lib/dates'
import { formatKg } from '@/lib/utils'

export const WeightChart = ({ events }: { events: HealthEvent[] }) => {
  const data = events
    .filter((e) => e.type === 'peso' && e.weightKg)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({ date: e.date, kg: e.weightKg! }))

  if (data.length < 2) return null
  const first = data[0].kg
  const last = data.at(-1)!.kg
  const diff = last - first
  const min = Math.min(...data.map((d) => d.kg))
  const max = Math.max(...data.map((d) => d.kg))
  const pad = Math.max(0.3, (max - min) * 0.4)

  return (
    <section className="rounded-[2rem] bg-surface p-5 shadow-card ring-1 ring-line sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">Peso</h2>
          <p className="tabular font-display text-3xl font-extrabold">{formatKg(last)}</p>
        </div>
        <p className="text-right text-sm text-ink-soft">
          <span className={diff < 0 ? 'font-bold text-soon' : 'font-bold text-ok'}>
            {diff > 0 ? '+' : ''}
            {formatKg(diff)}
          </span>
          <br />
          desde {fmt(data[0].date, 'MMM yyyy')}
        </p>
      </div>
      <div className="mt-4 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="kg-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 4" />
            <XAxis dataKey="date" tickFormatter={(d) => fmt(d, 'MMM')} tick={{ fill: 'var(--ink-faint)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              domain={[min - pad, max + pad]}
              tickFormatter={(v: number) => v.toFixed(1).replace('.', ',')}
              tick={{ fill: 'var(--ink-faint)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              cursor={{ stroke: 'var(--line)' }}
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, color: 'var(--ink)' }}
              labelFormatter={(d) => fmt(String(d), "d 'de' MMMM 'de' yyyy")}
              formatter={(v) => [formatKg(Number(v)), 'Peso']}
            />
            <Area type="monotone" dataKey="kg" stroke="var(--brand)" strokeWidth={2.5} fill="url(#kg-fill)" dot={{ r: 3.5, fill: 'var(--surface)', stroke: 'var(--brand)', strokeWidth: 2 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
