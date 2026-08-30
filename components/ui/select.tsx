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
  direction?: 'up' | 'down' | 'auto'
  align?: 'left' | 'right'
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  className,
  disabled = false,
  direction = 'auto',
  align = 'auto',
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [openUpward, setOpenUpward] = React.useState(false)
  const [alignRight, setAlignRight] = React.useState(false)
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

  const handleToggle = () => {
    if (!isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      if (direction === 'up') {
        setOpenUpward(true)
      } else if (direction === 'down') {
        setOpenUpward(false)
      } else {
        // Auto mode: open upward if less than 240px space below and more space above
        setOpenUpward(spaceBelow < 240 && spaceAbove > spaceBelow)
      }

      if (align === 'right') {
        setAlignRight(true)
      } else if (align === 'left') {
        setAlignRight(false)
      } else {
        // Auto align right if trigger is on the right half of screen
        setAlignRight(rect.left > window.innerWidth / 2)
      }
    }
    setIsOpen(!isOpen)
  }

  return (
    <div ref={selectRef} className={cn("relative inline-block w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/70 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs hover:bg-gray-100/80 dark:hover:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-orbit-blue transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          isOpen && "ring-2 ring-orbit-blue"
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
        <div
          className={cn(
            "absolute z-[9999] max-h-60 w-full min-w-[220px] max-w-[calc(100vw-2rem)] overflow-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1.5 shadow-2xl animate-in fade-in-0 zoom-in-95 no-scrollbar",
            openUpward ? "bottom-full mb-2" : "top-full mt-2",
            alignRight ? "right-0" : "left-0"
          )}
        >
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
                    ? "bg-orbit-blue/10 text-orbit-blue"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-orbit-blue shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
