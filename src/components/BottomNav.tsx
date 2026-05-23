"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, PlusCircle, CheckSquare, ArrowLeftRight } from 'lucide-react';
import { useAlbumStore } from '@/lib/useAlbumStore';
import { useLanguageStore } from '@/lib/useLanguageStore';
import { useMounted } from '@/lib/useMounted';

export default function BottomNav() {
  const pathname = usePathname();
  const { isInitialized } = useAlbumStore();
  const { t } = useLanguageStore();
  const isLoaded = useMounted();

  if (!isLoaded) return null;
  if (!isInitialized || pathname === '/onboarding') return null;

  const navItems = [
    { href: '/', label: t('navHome'), icon: Home },
    { href: '/album', label: t('navAlbum'), icon: Grid },
    { href: '/update', label: t('navUpdate'), icon: PlusCircle },
    { href: '/trade', label: t('navTrade'), icon: ArrowLeftRight },
    { href: '/lists', label: t('navLists'), icon: CheckSquare },
  ];

  return (
    <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-3 pb-safe z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full space-y-1 ${
              isActive ? 'text-wc-blue' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Icon size={24} className={isActive ? 'stroke-wc-blue fill-wc-blue/20' : ''} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
