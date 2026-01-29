import Link from "next/link";
import {
  BrainCircuit,
  Calendar,
  Inbox,
  Settings,
  Star,
  type LucideIcon,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type NavItemConfig = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  className?: string;
};

const NAV_ITEMS: NavItemConfig[] = [
  { label: "Messages", href: "/", icon: Inbox, badge: "3" },
  { label: "Schedules", href: "/schedules", icon: Calendar },
  { label: "AI Models", href: "/ai-models", icon: BrainCircuit },
  { label: "Favorites", href: "/favorites", icon: Star },
  { label: "Settings", href: "/settings", icon: Settings, className: "mt-8" },
];

export function Sidebar({ activeItem }: { activeItem: string }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-[280px] border-r border-border-primary bg-bg-surface px-6 py-8">
      <div className="mb-12">
        <h1 className="font-serif text-2xl font-semibold text-text-primary">MessageFlow</h1>
        <p className="text-xs text-text-tertiary">AI Message Platform</p>
      </div>

      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.label}
            {...item}
            active={item.label === activeItem}
          />
        ))}
      </nav>
    </aside>
  );
}

function NavItem({
  icon: Icon,
  label,
  href,
  active = false,
  badge,
  className,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-11 items-center justify-between rounded-lg px-3 transition-colors",
        active
          ? "bg-accent-primary text-white"
          : "text-text-tertiary hover:bg-bg-muted hover:text-text-primary",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span
          className={cn(
            "flex h-5 items-center justify-center rounded-full px-2 font-mono text-[10px] font-bold",
            active ? "bg-white text-accent-primary" : "bg-bg-muted text-text-tertiary"
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
