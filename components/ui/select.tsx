"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const selectRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={selectRef} className={cn("relative inline-block w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/70 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs hover:bg-gray-100/80 dark:hover:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-[#1F3B99] dark:focus:ring-[#6D5BFF] transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-2 ring-[#1F3B99] dark:ring-[#6D5BFF]"
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1.5 shadow-xl animate-in fade-in-0 zoom-in-95 no-scrollbar">
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onValueChange(option.value)
                  setIsOpen(false)
                }}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold outline-none transition-colors",
                  isSelected
                    ? "bg-[#1F3B99]/10 dark:bg-[#6D5BFF]/20 text-[#1F3B99] dark:text-[#6D5BFF]"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#1F3B99] dark:text-[#6D5BFF] shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
