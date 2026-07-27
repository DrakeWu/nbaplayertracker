import posthog from 'posthog-js'

interface YearSelectorProps {
  selectedYear: number
  onYearChange: (year: number) => void
}

function YearSelector({ selectedYear, onYearChange }: YearSelectorProps) {
  const currentYear = 2024
  const startYear = 1990
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => currentYear - i
  )

  return (
    <select
      value={selectedYear}
      onChange={(e) => {
        const year = Number(e.target.value)
        posthog.capture('season_changed', { season: year })
        onYearChange(year)
      }}
    >
      {years.map((year) => (
        <option key={year} value={year}>
          {year}-{(year + 1).toString().slice(-2)}
        </option>
      ))}
    </select>
  )
}

export default YearSelector