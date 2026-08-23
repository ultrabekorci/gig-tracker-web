'use client';

import React from 'react';
import { Calendar as CalendarIcon, Wallet, Plus, TrendingUp, Settings } from 'lucide-react';
import { useTelegram } from '@/components/telegram-provider';

interface BottomNavProps {
  activeTab: 'calendar' | 'salary' | 'analysis' | 'transactions' | 'settings' | string;
  onTabChange: (tab: string) => void;
  onOpenModal: () => void;
}

export function BottomNav({ activeTab, onTabChange, onOpenModal }: BottomNavProps) {
  const { hapticFeedback } = useTelegram();

  const navItems = [
    { id: 'calendar', label: 'Kalendar', icon: CalendarIcon },
    { id: 'salary', label: 'Oylik', icon: Wallet },
  ];
  
  const navItemsRight = [
    { id: 'analysis', label: 'Tahlil', icon: TrendingUp },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
  ];

  const handleTabClick = (id: string) => {
    if (hapticFeedback) hapticFeedback('light');
    onTabChange(id);
  };

  const NavButton = ({ item }: { item: any }) => {
    const isActive = activeTab === item.id;
    const Icon = item.icon;
    
    return (
      <button
        onClick={() => handleTabClick(item.id)}
        className={`flex flex-col items-center justify-center w-full space-y-1 transition-colors ${
          isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'
        }`}
      >
        <div className="relative">
          <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
          {isActive && (
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
          )}
        </div>
        <span className="text-[10px] font-medium mt-1">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-card/95 backdrop-blur-xl border-t border-border shadow-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        <div className="flex items-center justify-around w-2/5">
          {navItems.map((item) => (
            <NavButton key={item.id} item={item} />
          ))}
        </div>
        
        <div className="flex justify-center w-1/5 relative">
          <button
            onClick={() => {
              if (hapticFeedback) hapticFeedback('light');
              onOpenModal();
            }}
            className="absolute -top-6 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-600/30 active:scale-95 transition-transform"
            aria-label="Register work"
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center justify-around w-2/5">
          {navItemsRight.map((item) => (
            <NavButton key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
