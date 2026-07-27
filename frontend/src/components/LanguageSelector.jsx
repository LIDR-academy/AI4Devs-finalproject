// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const LanguageSelector = ({ variant = "icon" }) => {
  const { lang, setLang, languages } = useI18n();
  const current = languages.find((l) => l.code === lang) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2 py-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
          data-testid="language-selector"
        >
          <Globe className="w-4 h-4" />
          {variant === "full" && (
            <span className="text-xs font-medium">{current.label}</span>
          )}
          {variant === "icon" && (
            <span className="text-xs font-bold uppercase">{lang}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-lg">
        {languages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code)}
            data-testid={`lang-option-${l.code}`}
            className={`rounded-lg cursor-pointer ${lang === l.code ? "bg-blue-50 text-blue-700" : ""}`}
          >
            <span className="mr-2 text-base">{l.flag}</span>
            <span className="text-sm">{l.label}</span>
            {lang === l.code && <span className="ml-auto text-blue-600 text-xs">&#10003;</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
