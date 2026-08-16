"use client"

import * as React from "react"
import { format, parseISO, isValid, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DatePickerProps {
  value?: string // YYYY-MM-DD
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date...",
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Current view date in calendar
  const initialDate = value && isValid(parseISO(value)) ? parseISO(value) : new Date()
  const [currentMonth, setCurrentMonth] = React.useState<Date>(initialDate)

  const selectedDate = value && isValid(parseISO(value)) ? parseISO(value) : null

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleDaySelect = (day: Date) => {
    const formatted = format(day, "yyyy-MM-dd")
    onChange(formatted)
    setIsOpen(false)
  }

  const days = React.useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  return (
    <div ref={containerRef} className={cn("relative inline-block w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/70 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs hover:bg-gray-100/80 dark:hover:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-[#1F3B99] dark:focus:ring-[#6D5BFF] transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-2 ring-[#1F3B99] dark:ring-[#6D5BFF]"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="truncate">
            {selectedDate ? format(selectedDate, "PPP") : placeholder}
          </span>
        </div>

        {selectedDate && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              onChange("")
            }}
            className="p-1 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
            title="Clear date"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-1000 mt-1.5 w-72 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-xl animate-in fade-in-0 zoom-in-95">
          {/* Month Header Controls */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs font-extrabold text-gray-900 dark:text-white">
              {format(currentMonth, "MMMM yyyy")}
            </span>

            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 pt-1">
            {days.map((day) => {
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
              const isTodayDate = isToday(day)

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleDaySelect(day)}
                  className={cn(
                    "h-8 w-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center mx-auto cursor-pointer",
                    isSelected
                      ? "bg-[#1F3B99] dark:bg-[#6D5BFF] text-white shadow-xs"
                      : isTodayDate
                      ? "border border-[#1F3B99] dark:border-[#6D5BFF] text-[#1F3B99] dark:text-[#6D5BFF]"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {format(day, "d")}
                </button>
              )
            })}
          </div>

          {/* Quick Select Today */}
          <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button
              type="button"
              onClick={() => handleDaySelect(new Date())}
              className="text-[11px] font-bold text-[#1F3B99] dark:text-[#6D5BFF] hover:underline"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
