"use client";

import { type KeyboardEvent, type ReactNode, useId, useRef } from "react";
import { cn } from "@/lib/utils";

type Tab<Id extends string> = { id: Id; label: ReactNode; panel: ReactNode };

type AuthTabsProps<Id extends string> = {
  /** Accessible name of the tab list. */
  label: string;
  tabs: Tab<Id>[];
  selected: Id;
  onSelect: (id: Id) => void;
};

/**
 * Tabs following the WAI-ARIA "tabs" pattern: tablist / tab / tabpanel roles, aria-selected,
 * aria-controls, and a roving tabindex (only the selected tab is in the Tab order; arrows move between tabs).
 * Every panel stays mounted (inactive ones are `hidden`), so typed values survive a tab switch.
 */
export const AuthTabs = <Id extends string>({ label, tabs, selected, onSelect }: AuthTabsProps<Id>) => {
  const baseId = useId();
  const tabRefs = useRef(new Map<Id, HTMLButtonElement>());
  const tabId = (id: Id) => `${baseId}-tab-${id}`;
  const panelId = (id: Id) => `${baseId}-panel-${id}`;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = tabs.length - 1;
    const nextIndex = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (nextIndex === undefined) return;

    event.preventDefault();
    const next = tabs[nextIndex].id;
    onSelect(next); // automatic activation: moving to a tab also shows its panel
    tabRefs.current.get(next)?.focus();
  };

  return (
    <>
      <div role="tablist" aria-label={label} className="flex justify-center gap-7 border-b-2 border-white/30">
        {tabs.map((tab, index) => {
          const isSelected = tab.id === selected;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                if (element) tabRefs.current.set(tab.id, element);
                else tabRefs.current.delete(tab.id);
              }}
              type="button"
              role="tab"
              id={tabId(tab.id)}
              aria-selected={isSelected}
              aria-controls={panelId(tab.id)}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelect(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                // text-[length:...]: inside cn(), tailwind-merge would drop the custom "text-s" (see code-input.tsx).
                "-mb-[2px] cursor-pointer border-b-2 px-3 pt-xs pb-sm text-[length:var(--text-s)] font-semibold transition-colors duration-200 focus-visible:rounded-xs focus-visible:outline focus-visible:outline-white/60 motion-reduce:transition-none",
                isSelected ? "border-primary-200 text-primary-300" : "border-transparent text-white hover:text-primary-200",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={panelId(tab.id)}
          aria-labelledby={tabId(tab.id)}
          hidden={tab.id !== selected}
        >
          {tab.panel}
        </div>
      ))}
    </>
  );
};
