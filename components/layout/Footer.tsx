import Link from "next/link";
import { SyncStatusBadge } from "../common/SyncStatusBadge";
import { BRAND } from '../../lib/branding';

// Footer component for dashboard
export default function Footer() {
    return (
        <footer className="p-4 bg-background">
            
            <div className="p-3.5 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 dark:text-gray-500 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{BRAND.name} v{BRAND.version}</p>
                        <p className="truncate text-[10px] text-gray-400">{BRAND.tagline}</p>
                    </div>
                    <SyncStatusBadge />
                </div>
                <div className="flex items-center gap-2 text-[10px] pt-1 border-t border-gray-100 dark:border-gray-800/60">
                    <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        Privacy Policy
                    </Link>
                    <span>•</span>
                    <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        Terms of Service
                    </Link>
                </div>
            </div>
        </footer>
    );
}
