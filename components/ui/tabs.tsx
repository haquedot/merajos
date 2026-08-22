"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
  tabsId: string
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

export interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  children,
  className,
}) => {
  const tabsId = React.useId()

  return (
    <TabsContext.Provider value={{ value, onValueChange, tabsId }}>
      <div className={cn("w-full space-y-4", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "relative inline-flex h-11 items-center justify-start rounded-2xl bg-gray-100/80 dark:bg-gray-800/60 p-1 text-gray-500 dark:text-gray-400 overflow-x-auto no-scrollbar max-w-full",
        className
      )}
    >
      {children}
    </div>
  )
}

export interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  badge?: number | string
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className,
  badge,
}) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")

  const isActive = context.value === value

  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer shrink-0 gap-1.5 select-none",
        isActive
          ? "text-gray-900 dark:text-white font-extrabold"
          : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-gray-900/40",
        className
      )}
    >
      {isActive && (
        <motion.span
          layoutId={`active-tab-pill-${context.tabsId}`}
          className="absolute inset-0 rounded-xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-700/50 z-0"
          transition={{ type: "spring", bounce: 0.15, duration: 0.3 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {children}
        {badge !== undefined && (
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 transition-colors",
              isActive
                ? "bg-orbit-blue/10 dark:bg-orbit-blue/20 text-orbit-blue"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
            )}
          >
            {badge}
          </span>
        )}
      </span>
    </button>
  )
}

export interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className,
}) => {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")

  if (context.value !== value) return null

  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in-0 duration-200",
        className
      )}
    >
      {children}
    </div>
  )
}
