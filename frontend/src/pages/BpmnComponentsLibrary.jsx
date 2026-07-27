// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Puzzle,
  Trash2,
  Copy,
  Eye,
  Edit,
  MoreVertical,
  BarChart,
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { useLimits } from "@/hooks/useLimits";
import { UpgradeModal } from "@/components/UpgradeModal";
import { getAuthHeaders } from "@/lib/api";
import ProjectMenuBar from "@/components/ProjectMenuBar";

const BpmnComponentsLibrary = () => {
  const { t } = useI18n();
  const { checkLimit, upgradeOpen, upgradeInfo, closeUpgrade } = useLimits();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "other",
    xml_fragment: "",
    tags: [],
    is_public: true,
  });

  const categories = [
    { value: "subprocess", label: t("comp.cat_subprocess"), icon: "🔄" },
    { value: "event", label: t("comp.cat_event"), icon: "⚡" },
    { value: "task", label: t("comp.cat_task"), icon: "📋" },
    { value: "gateway", label: t("comp.cat_gateway"), icon: "◇" },
    { value: "pattern", label: t("comp.cat_pattern"), icon: "🔲" },
    { value: "other", label: t("comp.cat_other"), icon: "📦" },
  ];

  useEffect(() => {
    fetchComponents();
  }, [searchQuery, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchComponents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory);

      const response = await fetch(`${API}/components?${params}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setComponents(await response.json());
      }
    } catch (error) {
      console.error("Error fetching components:", error);
      toast.error(t("comp.load_error"));
    } finally {
      setLoading(false);
    }
  };

  const saveComponent = async () => {
    if (!selectedComponent) {
      const allowed = await checkLimit("components");
      if (!allowed) return;
    }
    try {
      const method = selectedComponent ? "PUT" : "POST";
      const url = selectedComponent
        ? `${API}/components/${selectedComponent.id}`
        : `${API}/components`;

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          selectedComponent
            ? t("comp.component_updated")
            : t("comp.component_created")
        );
        fetchComponents();
        setDialogOpen(false);
        resetForm();
      } else {
        toast.error(t("comp.save_error"));
      }
    } catch (error) {
      toast.error(t("comp.save_error"));
    }
  };

  const deleteComponent = async () => {
    if (!selectedComponent) return;
    try {
      await fetch(`${API}/components/${selectedComponent.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      toast.success(t("comp.component_deleted"));
      fetchComponents();
    } catch (error) {
      toast.error(t("comp.delete_error"));
    } finally {
      setDeleteDialogOpen(false);
      setSelectedComponent(null);
    }
  };

  const duplicateComponent = async (component) => {
    try {
      const newComponent = {
        name: `${component.name} (copia)`,
        description: component.description,
        category: component.category,
        xml_fragment: component.xml_fragment,
        tags: component.tags,
        is_public: component.is_public,
      };

      const response = await fetch(`${API}/components`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newComponent),
      });

      if (response.ok) {
        toast.success(t("comp.component_duplicated"));
        fetchComponents();
      }
    } catch (error) {
      toast.error(t("comp.duplicate_error"));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "other",
      xml_fragment: "",
      tags: [],
      is_public: true,
    });
    setSelectedComponent(null);
  };

  const openEditDialog = (component) => {
    setSelectedComponent(component);
    setFormData({
      name: component.name,
      description: component.description || "",
      category: component.category,
      xml_fragment: component.xml_fragment,
      tags: component.tags || [],
      is_public: component.is_public,
    });
    setDialogOpen(true);
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.icon : "📦";
  };

  const getCategoryLabel = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.label : t("comp.cat_other");
  };

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      data-testid="components-library-page"
    >
      <ProjectMenuBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
            <h1
              className="text-base font-bold text-zinc-900 tracking-tight"
              style={{ fontFamily: "'Chivo', sans-serif" }}
            >
              {t("comp.title")}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
                data-testid="new-component-btn"
                size="sm"
                className="bg-deep-navy hover:bg-deep-navy/90 text-white rounded-lg h-8 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                {t("comp.new_component")}
              </Button>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Search + Filter */}
            <div className="flex items-center gap-3">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  placeholder={t("comp.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-lg h-9 text-sm"
                  data-testid="search-input"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-44 rounded-lg h-9 text-sm">
                  <SelectValue
                    placeholder={t("common.category") || "Categoria"}
                  />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="all" className="text-xs">
                    {t("comp.cat_all") || "Todas"}
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.value}
                      value={cat.value}
                      className="text-xs"
                    >
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            {loading ? (
              <p className="text-sm text-zinc-400 font-mono py-16 text-center">
                {t("common.loading")}
              </p>
            ) : components.length === 0 ? (
              <div className="text-center py-16">
                <Puzzle className="w-8 h-8 text-zinc-200 mx-auto mb-4" />
                <h3 className="text-sm font-semibold text-zinc-900 mb-2">
                  {searchQuery
                    ? t("common.no_results") || "Sin resultados"
                    : t("comp.no_components")}
                </h3>
                <p className="text-xs text-zinc-400 mb-4">
                  {searchQuery ? "" : t("comp.no_components_desc")}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => {
                      resetForm();
                      setDialogOpen(true);
                    }}
                    size="sm"
                    className="bg-deep-navy hover:bg-deep-navy/90 rounded-lg text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    {t("comp.create_component")}
                  </Button>
                )}
              </div>
            ) : (
              <div className="bento-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-zinc-200">
                {components.map((component) => (
                  <div
                    key={component.id}
                    className="group hover:bg-zinc-50 transition-colors"
                    data-testid={`component-card-${component.id}`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 border border-zinc-200 flex items-center justify-center flex-shrink-0 text-base">
                          {getCategoryIcon(component.category)}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-lg"
                          >
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedComponent(component);
                                setPreviewDialogOpen(true);
                              }}
                              className="rounded-lg text-xs"
                            >
                              <Eye className="w-3.5 h-3.5 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(component)}
                              className="rounded-lg text-xs"
                            >
                              <Edit className="w-3.5 h-3.5 mr-2" />
                              {t("common.edit") || "Editar"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => duplicateComponent(component)}
                              className="rounded-lg text-xs"
                            >
                              <Copy className="w-3.5 h-3.5 mr-2" />
                              {t("comp.duplicate") || "Duplicar"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedComponent(component);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 rounded-lg text-xs"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              {t("common.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <h3 className="text-sm font-bold text-zinc-900 mb-1">
                        {component.name}
                      </h3>
                      {component.description && (
                        <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
                          {component.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <p
                          className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400"
                          style={{
                            fontFamily: "'IBM Plex Mono', monospace",
                          }}
                        >
                          <span className="flex items-center gap-1">
                            <BarChart className="w-3 h-3" />
                            {component.usage_count || 0} {t("comp.usages")}
                          </span>
                        </p>
                        {component.tags?.length > 0 && (
                          <div className="flex gap-1">
                            {component.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 border border-zinc-200 text-zinc-500"
                                style={{
                                  fontFamily: "'IBM Plex Mono', monospace",
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl rounded-lg">
          <DialogHeader>
            <DialogTitle
              style={{ fontFamily: "'Chivo', sans-serif" }}
            >
              {selectedComponent
                ? t("comp.edit_title")
                : t("comp.new_title")}
            </DialogTitle>
            <DialogDescription>{t("comp.dialog_desc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.name")}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ej: Proceso de Aprobacion"
                  className="rounded-lg"
                  data-testid="component-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("common.category")}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.value}
                        value={cat.value}
                        className="text-xs"
                      >
                        <span className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("common.description")}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe el proposito de este componente..."
                rows={2}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("comp.xml_fragment")}</Label>
              <Textarea
                value={formData.xml_fragment}
                onChange={(e) =>
                  setFormData({ ...formData, xml_fragment: e.target.value })
                }
                placeholder="<bpmn:task id='...' name='...' />"
                rows={6}
                className="font-mono text-sm rounded-lg"
                data-testid="xml-fragment-input"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-lg"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={saveComponent}
              className="bg-deep-navy hover:bg-deep-navy/90 text-white rounded-lg font-semibold"
              data-testid="save-component-btn"
            >
              {selectedComponent
                ? t("comp.save_changes")
                : t("comp.create_component")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
      >
        <DialogContent className="max-w-2xl rounded-lg">
          <DialogHeader>
            <DialogTitle
              style={{ fontFamily: "'Chivo', sans-serif" }}
            >
              {selectedComponent?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedComponent?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-deep-navy rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-zinc-100 font-mono whitespace-pre-wrap">
              {selectedComponent?.xml_fragment}
            </pre>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  selectedComponent?.xml_fragment || ""
                );
                toast.success(t("comp.xml_copied"));
              }}
              className="rounded-lg"
            >
              <Copy className="w-4 h-4 mr-2" />
              {t("comp.copy_xml")}
            </Button>
            <Button
              onClick={() => setPreviewDialogOpen(false)}
              className="bg-deep-navy hover:bg-deep-navy/90 text-white rounded-lg"
            >
              {t("common.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle
              style={{ fontFamily: "'Chivo', sans-serif" }}
            >
              {t("comp.delete_title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("comp.delete_desc")} "{selectedComponent?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteComponent}
              className="bg-red-600 hover:bg-red-700 rounded-lg"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UpgradeModal
        open={upgradeOpen}
        onClose={closeUpgrade}
        limitType={upgradeInfo.type}
        limitMax={upgradeInfo.max}
        limitCurrent={upgradeInfo.current}
      />
    </div>
  );
};

export default BpmnComponentsLibrary;
