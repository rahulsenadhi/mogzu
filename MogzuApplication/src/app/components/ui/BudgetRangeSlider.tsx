type BudgetRangeSliderProps = {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
  minLabel?: string
  maxLabel?: string
}

const defaultFormat = (value: number) => `₹${value.toLocaleString('en-IN')}`

export const BudgetRangeSlider = ({
  min,
  max,
  step,
  value,
  onChange,
  formatValue = defaultFormat,
  minLabel,
  maxLabel,
}: BudgetRangeSliderProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-[#0e1e3f]">Budget Range</span>
      <span className="text-xs text-[#878e9e]">{formatValue(value)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-[#4379ee]"
    />
    <div className="flex justify-between text-[10px] text-[#878e9e]">
      <span>{minLabel ?? formatValue(min)}</span>
      <span>{maxLabel ?? formatValue(max)}</span>
    </div>
  </div>
)
