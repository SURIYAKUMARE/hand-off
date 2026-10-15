import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-1 border-b border-border overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap -mb-[1px]
              ${
                isActive
                  ? 'border-brand text-brand font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
              }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.5 text-[11px] font-semibold rounded-full ${
                  isActive
                    ? 'bg-brand-light text-brand'
                    : 'bg-[#F2F4F7] text-text-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
