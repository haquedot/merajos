'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue>({
  open: false,
  onOpenChange: () => {},
});

export const useSheet = () => React.useContext(SheetContext);

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ open = false, onOpenChange, children }) => {
  return (
    <SheetContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      {children}
    </SheetContext.Provider>
  );
};

export const SheetTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const { onOpenChange } = useSheet();
  return (
    <button
      ref={ref}
      onClick={(e) => {
        onClick?.(e);
        onOpenChange(true);
      }}
      {...props}
    />
  );
});
SheetTrigger.displayName = 'SheetTrigger';

export const SheetClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ onClick, ...props }, ref) => {
  const { onOpenChange } = useSheet();
  return (
    <button
      ref={ref}
      onClick={(e) => {
        onClick?.(e);
        onOpenChange(false);
      }}
      {...props}
    />
  );
});
SheetClose.displayName = 'SheetClose';

const sheetVariants = cva(
  'fixed z-[10000] gap-4 bg-white dark:bg-[#0f172a] p-6 shadow-2xl transition ease-in-out border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b',
        bottom: 'inset-x-0 bottom-0 border-t rounded-t-3xl',
        left: 'inset-y-0 left-0 h-full w-3/4 sm:max-w-sm border-r',
        right: 'inset-y-0 right-0 h-full w-full sm:w-[560px] md:w-[640px] border-l',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  }
);

interface SheetContentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'>,
    VariantProps<typeof sheetVariants> {
  children: React.ReactNode;
  className?: string;
  hideCloseButton?: boolean;
}

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = 'right', className, children, hideCloseButton = false, ...props }, ref) => {
    const { open, onOpenChange } = useSheet();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onOpenChange(false);
      };
      if (open) {
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
      }
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [open, onOpenChange]);

    if (!mounted) return null;

    const initialPos =
      side === 'right'
        ? { x: '100%' }
        : side === 'left'
        ? { x: '-100%' }
        : side === 'top'
        ? { y: '-100%' }
        : { y: '100%' };

    return createPortal(
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onOpenChange(false)}
              className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-md"
            />

            {/* Sheet Panel */}
            <motion.div
              ref={ref}
              initial={initialPos}
              animate={{ x: 0, y: 0 }}
              exit={initialPos}
              transition={{ type: 'spring', damping: 28, stiffness: 280, mass: 0.8 }}
              className={cn(sheetVariants({ side }), className)}
              {...props}
            >
              {!hideCloseButton && (
                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span className="sr-only">Close</span>
                </button>
              )}
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    );
  }
);
SheetContent.displayName = 'SheetContent';

export const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col space-y-2 text-left shrink-0', className)}
    {...props}
  />
);
SheetHeader.displayName = 'SheetHeader';

export const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 shrink-0', className)}
    {...props}
  />
);
SheetFooter.displayName = 'SheetFooter';

export const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-base font-extrabold tracking-tight text-gray-900 dark:text-white', className)}
    {...props}
  />
));
SheetTitle.displayName = 'SheetTitle';

export const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs text-gray-500 dark:text-gray-400', className)}
    {...props}
  />
));
SheetDescription.displayName = 'SheetDescription';
