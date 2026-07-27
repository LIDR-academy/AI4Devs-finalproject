// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PropertiesTabComponent = ({ selectedElement, elementDataMap, oopClasses, setElementData, t }) => {
  if (!selectedElement) {
    return (
      <p className="text-sm text-zinc-500 text-center py-8">
        {t("editor.select_element")}
      </p>
    );
  }

  const data = elementDataMap[selectedElement.id] || {};
  const inputClassDef = oopClasses.find((c) => c.name === data.inputClass);
  const outputClassDef = oopClasses.find((c) => c.name === data.outputClass);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-zinc-500">ID</Label>
        <p className="font-mono text-sm">{selectedElement.id}</p>
      </div>
      <div>
        <Label className="text-xs text-zinc-500">{t("common.type")}</Label>
        <p className="text-sm">{selectedElement.type}</p>
      </div>
      {selectedElement.businessObject?.name && (
        <div>
          <Label className="text-xs text-zinc-500">{t("common.name")}</Label>
          <p className="text-sm">{selectedElement.businessObject.name}</p>
        </div>
      )}

      {/* Input Data Section */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">{t("editor.input_data")}</Label>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        <div className="space-y-2">
          <Select
            value={data.inputClass || ""}
            onValueChange={(val) => setElementData(selectedElement.id, "inputClass", val)}
          >
            <SelectTrigger data-testid="input-class-select">
              <SelectValue placeholder={t("editor.select_oop")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{t("editor.no_class")}</SelectItem>
              {oopClasses.map((c) => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder={t("editor.or_manual_input")}
            value={data.inputCustom || ""}
            onChange={(e) => setElementData(selectedElement.id, "inputCustom", e.target.value)}
            className="text-sm"
            data-testid="input-custom-field"
          />
          {data.inputClass && data.inputClass !== "__none__" && inputClassDef && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
              <p className="text-xs font-medium text-emerald-800">
                Clase: {data.inputClass}
              </p>
              {inputClassDef.properties?.map((prop) => (
                <p key={prop.name} className="text-xs text-emerald-600 ml-2">
                  {prop.name}: <span className="text-emerald-500">{prop.type}</span>
                  {prop.required && <span className="text-rose-400 ml-1">*</span>}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Output Data Section */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">{t("editor.output_data")}</Label>
          <div className="w-2 h-2 rounded-full bg-amber-500" />
        </div>
        <div className="space-y-2">
          <Select
            value={data.outputClass || ""}
            onValueChange={(val) => setElementData(selectedElement.id, "outputClass", val)}
          >
            <SelectTrigger data-testid="output-class-select">
              <SelectValue placeholder={t("editor.select_oop")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{t("editor.no_class")}</SelectItem>
              {oopClasses.map((c) => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder={t("editor.or_manual_output")}
            value={data.outputCustom || ""}
            onChange={(e) => setElementData(selectedElement.id, "outputCustom", e.target.value)}
            className="text-sm"
            data-testid="output-custom-field"
          />
          {data.outputClass && data.outputClass !== "__none__" && outputClassDef && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="text-xs font-medium text-amber-800">
                Clase: {data.outputClass}
              </p>
              {outputClassDef.properties?.map((prop) => (
                <p key={prop.name} className="text-xs text-amber-600 ml-2">
                  {prop.name}: <span className="text-amber-500">{prop.type}</span>
                  {prop.required && <span className="text-rose-400 ml-1">*</span>}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const PropertiesTab = React.memo(PropertiesTabComponent);
