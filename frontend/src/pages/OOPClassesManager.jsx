// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect } from "react";
import AppSidebar from "@/components/AppSidebar";
import { Link } from "react-router-dom";
import { API } from "@/App";
import { getAuthHeaders } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Workflow,
  Search,
  Plus,
  Code2,
  Trash2,
  Copy,
  History,
  GripVertical,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Library,
  Puzzle,
  ArrowUpDown,
  List,
  Grid3X3,
  Tag,
  Database,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useI18n } from "@/contexts/I18nContext";
import { useLimits } from "@/hooks/useLimits";
import { UpgradeModal } from "@/components/UpgradeModal";
import ApplyCustomSchemaDialog from "@/components/ApplyCustomSchemaDialog";
import { useAuth } from "@/App";

const OOPClassesManager = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const isEnterprise = user?.role === "admin" || user?.plan === "enterprise";
  const { checkLimit, upgradeOpen, upgradeInfo, closeUpgrade } = useLimits();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [applySchemaOpen, setApplySchemaOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [versions, setVersions] = useState([]);
  const [expandedClasses, setExpandedClasses] = useState(new Set());

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "other",
    tags: [],
    properties: [],
    parent_class: "",
    interfaces: [],
  });

  const categories = [
    { value: "order", label: t("oop.cat_order"), color: "bg-blue-50 text-blue-700 border border-blue-200" },
    { value: "payment", label: t("oop.cat_payment"), color: "bg-green-50 text-green-700 border border-green-200" },
    { value: "shipping", label: t("oop.cat_shipping"), color: "bg-orange-50 text-orange-700 border border-orange-200" },
    { value: "customer", label: t("oop.cat_customer"), color: "bg-violet-50 text-violet-700 border border-violet-200" },
    { value: "inventory", label: t("oop.cat_inventory"), color: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
    { value: "other", label: t("oop.cat_other"), color: "bg-zinc-50 text-zinc-700 border border-zinc-200" }
  ];

  const propertyTypes = [
    { value: "string", label: "String" },
    { value: "number", label: "Number" },
    { value: "boolean", label: "Boolean" },
    { value: "date", label: "Date" },
    { value: "array", label: "Array" },
    { value: "object", label: "Object" },
    { value: "reference", label: "Reference" }
  ];

  useEffect(() => {
    fetchClasses();
  }, [searchQuery, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);

      const response = await fetch(`${API}/oop-classes?${params}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setClasses(await response.json());
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error(t("oop.load_error"));
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async (classId) => {
    try {
      const response = await fetch(`${API}/oop-classes/${classId}/versions`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setVersions(await response.json());
      }
    } catch (error) {
      console.error("Error fetching versions:", error);
    }
  };

  const saveClass = async () => {
    if (!selectedClass) {
      const allowed = await checkLimit("oop");
      if (!allowed) return;
    }
    try {
      const method = selectedClass ? "PUT" : "POST";
      const url = selectedClass 
        ? `${API}/oop-classes/${selectedClass.id}`
        : `${API}/oop-classes`;

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(selectedClass ? t("oop.class_updated") : t("oop.class_created"));
        fetchClasses();
        setDialogOpen(false);
        resetForm();
      } else {
        toast.error(t("oop.save_error"));
      }
    } catch (error) {
      toast.error(t("oop.save_error"));
    }
  };

  const deleteClass = async () => {
    if (!selectedClass) return;
    try {
      await fetch(`${API}/oop-classes/${selectedClass.id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      toast.success(t("oop.class_deleted"));
      fetchClasses();
    } catch (error) {
      toast.error(t("oop.delete_error"));
    } finally {
      setDeleteDialogOpen(false);
      setSelectedClass(null);
    }
  };

  const duplicateClass = async (oopClass) => {
    try {
      const newClass = {
        name: `${oopClass.name} (copia)`,
        description: oopClass.description,
        category: oopClass.category,
        tags: oopClass.tags,
        properties: oopClass.properties
      };

      const response = await fetch(`${API}/oop-classes`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newClass)
      });

      if (response.ok) {
        toast.success(t("oop.class_duplicated"));
        fetchClasses();
      }
    } catch (error) {
      toast.error(t("oop.duplicate_error"));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "other",
      tags: [],
      properties: []
    });
    setSelectedClass(null);
  };

  const openEditDialog = (oopClass) => {
    setSelectedClass(oopClass);
    setFormData({
      name: oopClass.name,
      description: oopClass.description || "",
      category: oopClass.category,
      tags: oopClass.tags || [],
      properties: (oopClass.properties || []).map((p, i) => ({ ...p, _uid: p._uid || `existing_${i}` }))
    });
    setDialogOpen(true);
  };

  let propIdCounter = React.useRef(0);
  const nextPropId = () => `prop_${Date.now()}_${++propIdCounter.current}`;

  const addProperty = () => {
    setFormData({
      ...formData,
      properties: [
        ...formData.properties,
        { _uid: nextPropId(), name: "", type: "string", description: "", required: false, default_value: "", validations: null, enum_values: null, nested_properties: null }
      ]
    });
  };

  const addNestedProperty = (index) => {
    const newProps = [...formData.properties];
    const nested = newProps[index].nested_properties || [];
    nested.push({ name: "", type: "string", description: "", required: false });
    newProps[index] = { ...newProps[index], nested_properties: nested };
    setFormData({ ...formData, properties: newProps });
  };

  const updateNestedProperty = (parentIdx, childIdx, field, value) => {
    const newProps = [...formData.properties];
    const nested = [...(newProps[parentIdx].nested_properties || [])];
    nested[childIdx] = { ...nested[childIdx], [field]: value };
    newProps[parentIdx] = { ...newProps[parentIdx], nested_properties: nested };
    setFormData({ ...formData, properties: newProps });
  };

  const removeNestedProperty = (parentIdx, childIdx) => {
    const newProps = [...formData.properties];
    const nested = (newProps[parentIdx].nested_properties || []).filter((_, i) => i !== childIdx);
    newProps[parentIdx] = { ...newProps[parentIdx], nested_properties: nested.length > 0 ? nested : null };
    setFormData({ ...formData, properties: newProps });
  };

  const updateProperty = (index, field, value) => {
    const newProperties = [...formData.properties];
    newProperties[index] = { ...newProperties[index], [field]: value };
    setFormData({ ...formData, properties: newProperties });
  };

  const removeProperty = (index) => {
    setFormData({
      ...formData,
      properties: formData.properties.filter((_, i) => i !== index)
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(formData.properties);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFormData({ ...formData, properties: items });
  };

  const toggleExpand = (classId) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId);
    } else {
      newExpanded.add(classId);
    }
    setExpandedClasses(newExpanded);
  };

  const getCategoryBadge = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? (
      <Badge className={cat.color}>{cat.label}</Badge>
    ) : (
      <Badge className="bg-zinc-100 text-zinc-700">{t("oop.cat_other")}</Badge>
    );
  };

  const sortedClasses = [...classes].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.updated_at) - new Date(a.updated_at);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "category") return a.category.localeCompare(b.category);
    if (sortBy === "properties") return (b.properties?.length || 0) - (a.properties?.length || 0);
    return 0;
  });

  const navItems = [
    { label: t("nav.dashboard"), icon: <LayoutDashboard className="w-4 h-4" />, path: "/dashboard" },
    { label: t("nav.library"), icon: <Library className="w-4 h-4" />, path: "/library" },
    { label: t("nav.oop_classes"), icon: <Code2 className="w-4 h-4" />, path: "/oop-classes", active: true },
    { label: t("nav.components"), icon: <Puzzle className="w-4 h-4" />, path: "/components" },
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="oop-classes-page">
      {/* Sidebar */}
      <AppSidebar activePath="/oop-classes" />

      {/* Main Content */}
      <main className="ml-56 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
            <h1 className="text-base font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>{t("oop.title")}</h1>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -tranzinc-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  placeholder={t("oop.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-56 h-9 rounded-lg text-sm"
                  data-testid="search-input"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 h-9 rounded-lg text-xs">
                  <ArrowUpDown className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="recent">{t("oop.sort_recent")}</SelectItem>
                  <SelectItem value="name">{t("oop.sort_name")}</SelectItem>
                  <SelectItem value="category">{t("oop.sort_category")}</SelectItem>
                  <SelectItem value="properties">{t("oop.sort_props")}</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border border-zinc-200">
                <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")} className="rounded-lg h-9 w-9">
                  <Grid3X3 className="w-3.5 h-3.5" />
                </Button>
                <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")} className="rounded-lg h-9 w-9">
                  <List className="w-3.5 h-3.5" />
                </Button>
              </div>
              <Button
                onClick={() => { resetForm(); setDialogOpen(true); }}
                data-testid="new-class-btn"
                size="sm"
                className="bg-deep-navy hover:bg-deep-navy/90 text-white font-semibold rounded-lg px-4 h-9 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                {t("oop.new_class")}
              </Button>
            </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-sm text-zinc-400 font-mono">{t("common.loading")}</div>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-16">
              <Code2 className="w-8 h-8 text-zinc-200 mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-zinc-900 mb-2">{t("oop.no_classes")}</h3>
              <p className="text-xs text-zinc-400 mb-4">{t("oop.no_classes_desc")}</p>
              <Button
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
                size="sm"
                className="bg-deep-navy hover:bg-deep-navy/90 rounded-lg text-xs"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("oop.create_class")}
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="bento-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-zinc-200">
              {sortedClasses.map((oopClass) => (
                <div
                  key={oopClass.id}
                  className="p-5 hover:bg-zinc-50 transition-colors"
                  data-testid={`class-card-${oopClass.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-bold text-zinc-900" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{oopClass.name}</h3>
                    {getCategoryBadge(oopClass.category)}
                  </div>
                  <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
                    {oopClass.description || t("oop.no_desc")}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {oopClass.properties?.length || 0} {t("oop.properties_count")}
                  </p>

                  {oopClass.properties?.slice(0, 3).map((prop, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs py-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      <span className="text-zinc-700">{prop.name}</span>
                      <span className="text-zinc-300">:</span>
                      <span className="text-blue-600">{prop.type}</span>
                      {prop.required && <span className="text-red-500 text-[10px]">*</span>}
                    </div>
                  ))}

                  {(oopClass.properties?.length || 0) > 3 && (
                    <p className="text-[10px] text-zinc-400 mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      +{oopClass.properties.length - 3} {t("oop.more")}
                    </p>
                  )}

                  <div className="flex items-center gap-1 pt-3 mt-3 border-t border-zinc-100">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(oopClass)} className="flex-1 rounded-lg h-7 text-xs">
                      {t("common.edit")}
                    </Button>
                    {isEnterprise && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setSelectedClass(oopClass); setApplySchemaOpen(true); }}
                        className="h-7 w-7 text-blue-600 hover:bg-blue-50 relative"
                        title="Aplicar Custom Schema"
                        data-testid={`apply-schema-btn-${oopClass.id}`}
                      >
                        <Database className="w-3.5 h-3.5" />
                        {Object.keys(oopClass.custom_metadata || {}).length > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
                        )}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedClass(oopClass); fetchVersions(oopClass.id); setHistoryDialogOpen(true); }} className="h-7 w-7">
                      <History className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => duplicateClass(oopClass)} className="h-7 w-7">
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedClass(oopClass); setDeleteDialogOpen(true); }} className="text-red-600 hover:text-red-700 h-7 w-7">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedClasses.map((oopClass) => (
                <div 
                  key={oopClass.id}
                  className="bg-white rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors"
                >
                  <div 
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => toggleExpand(oopClass.id)}
                  >
                    {expandedClasses.has(oopClass.id) ? (
                      <ChevronDown className="w-5 h-5 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-zinc-400" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-zinc-900">{oopClass.name}</h3>
                      <p className="text-sm text-zinc-500">{oopClass.description}</p>
                    </div>
                    {getCategoryBadge(oopClass.category)}
                    <span className="text-sm text-zinc-500">
                      {oopClass.properties?.length || 0} {t("oop.properties_count")}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEditDialog(oopClass); }}>
                        <Code2 className="w-4 h-4" />
                      </Button>
                      {isEnterprise && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); setSelectedClass(oopClass); setApplySchemaOpen(true); }}
                          className="text-blue-600 hover:bg-blue-50 relative"
                          title="Aplicar Custom Schema"
                          data-testid={`apply-schema-list-btn-${oopClass.id}`}
                        >
                          <Database className="w-4 h-4" />
                          {Object.keys(oopClass.custom_metadata || {}).length > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                          )}
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); duplicateClass(oopClass); }}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedClass(oopClass); setDeleteDialogOpen(true); }} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {expandedClasses.has(oopClass.id) && (
                    <div className="px-4 pb-4 pl-12 border-t border-zinc-100">
                      <div className="space-y-2 mt-3">
                        {oopClass.properties?.map((prop, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm py-1">
                            <span className="font-mono text-zinc-700">{prop.name}</span>
                            <Badge variant="outline" className="rounded-lg text-[10px]">{prop.type}</Badge>
                            {prop.required && <Badge variant="secondary" className="rounded-lg text-[10px]">required</Badge>}
                            {prop.referenceClass && (
                              <span className="text-zinc-500">→ {prop.referenceClass}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle>{selectedClass ? t("oop.edit_title") : t("oop.new_title")}</DialogTitle>
            <DialogDescription>
              {t("oop.dialog_desc")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.name")}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: OrderRequest"
                  data-testid="class-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("common.category")}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("common.description")}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe el proposito de esta clase..."
                rows={2}
              />
            </div>

            {/* Inheritance & Interfaces */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t("oop.parent_class")}</Label>
                <Select
                  value={formData.parent_class || "__none__"}
                  onValueChange={(v) => setFormData({ ...formData, parent_class: v === "__none__" ? "" : v })}
                >
                  <SelectTrigger data-testid="parent-class-select">
                    <SelectValue placeholder={t("oop.no_inheritance")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">{t("oop.no_inheritance")}</SelectItem>
                    {classes.filter(c => c.id !== selectedClass?.id).map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t("oop.interfaces")}</Label>
                <Input
                  value={(formData.interfaces || []).join(", ")}
                  onChange={(e) => setFormData({ ...formData, interfaces: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                  placeholder="Serializable, Cloneable..."
                  data-testid="interfaces-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("oop.properties")}</Label>
                <Button variant="outline" size="sm" onClick={addProperty}>
                  <Plus className="w-4 h-4 mr-1" />
                  {t("oop.add_prop")}
                </Button>
              </div>

              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="properties">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {formData.properties.map((prop, index) => (
                        <Draggable key={prop._uid || `prop-${index}`} draggableId={prop._uid || `prop-${index}`} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="p-3 bg-zinc-50 border border-zinc-200"
                            >
                              {/* Main property row */}
                              <div className="flex items-center gap-2">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="w-4 h-4 text-zinc-400" />
                                </div>
                                <Input
                                  value={prop.name}
                                  onChange={(e) => updateProperty(index, "name", e.target.value)}
                                  placeholder="nombre"
                                  className="flex-1"
                                />
                                <Select
                                  value={prop.type}
                                  onValueChange={(value) => updateProperty(index, "type", value)}
                                >
                                  <SelectTrigger className="w-28">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {propertyTypes.map((type) => (
                                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {prop.type === "reference" && (
                                  <Select
                                    value={prop.referenceClass || ""}
                                    onValueChange={(value) => updateProperty(index, "referenceClass", value)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue placeholder="Clase..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {classes.filter(c => c.id !== selectedClass?.id).map((c) => (
                                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                                {prop.type === "array" && (
                                  <Select
                                    value={prop.arrayItemType || "string"}
                                    onValueChange={(value) => updateProperty(index, "arrayItemType", value)}
                                  >
                                    <SelectTrigger className="w-28">
                                      <SelectValue placeholder="Items..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="string">String[]</SelectItem>
                                      <SelectItem value="number">Number[]</SelectItem>
                                      <SelectItem value="reference">Clase[]</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={prop.required}
                                    onCheckedChange={(checked) => updateProperty(index, "required", checked)}
                                  />
                                  <span className="text-xs text-zinc-500">Req</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeProperty(index)} className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Expanded wizard options */}
                              <div className="mt-2 pl-8 grid grid-cols-3 gap-2">
                                <Input
                                  value={prop.default_value || ""}
                                  onChange={(e) => updateProperty(index, "default_value", e.target.value)}
                                  placeholder={t("oop.default_value")}
                                  className="text-xs h-7"
                                />
                                <Input
                                  value={prop.description || ""}
                                  onChange={(e) => updateProperty(index, "description", e.target.value)}
                                  placeholder={t("common.description")}
                                  className="text-xs h-7"
                                />
                                {(prop.type === "string" || prop.type === "number") && (
                                  <Input
                                    value={(prop.enum_values || []).join(", ")}
                                    onChange={(e) => updateProperty(index, "enum_values", e.target.value ? e.target.value.split(",").map(s => s.trim()) : null)}
                                    placeholder="Enum: val1, val2..."
                                    className="text-xs h-7"
                                  />
                                )}
                              </div>

                              {/* Nested properties for object type */}
                              {prop.type === "object" && (
                                <div className="mt-2 pl-8 space-y-1.5 border-l-2 border-zinc-200 ml-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-zinc-700">{t("oop.sub_properties")}</span>
                                    <Button variant="ghost" size="sm" onClick={() => addNestedProperty(index)} className="h-6 text-xs text-blue-600">
                                      <Plus className="w-3 h-3 mr-1" /> Sub-prop
                                    </Button>
                                  </div>
                                  {(prop.nested_properties || []).map((nested, ni) => (
                                    <div key={ni} className="flex items-center gap-1.5 bg-zinc-50 rounded-lg p-1.5">
                                      <Input
                                        value={nested.name}
                                        onChange={(e) => updateNestedProperty(index, ni, "name", e.target.value)}
                                        placeholder="nombre"
                                        className="flex-1 text-xs h-6"
                                      />
                                      <Select value={nested.type} onValueChange={(v) => updateNestedProperty(index, ni, "type", v)}>
                                        <SelectTrigger className="w-20 h-6 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {propertyTypes.filter(t => t.value !== "object").map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Switch checked={nested.required} onCheckedChange={(v) => updateNestedProperty(index, ni, "required", v)} />
                                      <Button variant="ghost" size="icon" onClick={() => removeNestedProperty(index, ni)} className="h-6 w-6 text-red-500 hover:text-red-700">
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">
              {t("common.cancel")}
            </Button>
            <Button onClick={saveClass} className="bg-blue-600 hover:bg-blue-700 rounded-lg" data-testid="save-class-btn">
              {selectedClass ? t("oop.save_changes") : t("oop.create_class")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold" style={{ fontFamily: "'Chivo', sans-serif" }}>{t("oop.delete_title")}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              {t("oop.delete_desc")} "{selectedClass?.name}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg text-xs h-8">{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={deleteClass} className="bg-red-600 hover:bg-red-700 rounded-lg text-xs h-8">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>{t("oop.history_title")}</DialogTitle>
            <DialogDescription>{selectedClass?.name}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-64">
            {versions.length === 0 ? (
              <p className="text-center text-zinc-500 py-8">{t("oop.no_versions")}</p>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div key={version.id} className="p-3 border border-zinc-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{t("oop.version")} {version.version_number}</span>
                      <span className="text-xs text-zinc-500">
                        {new Date(version.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {version.commit_message && (
                      <p className="text-sm text-zinc-600 mt-1">{version.commit_message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <UpgradeModal open={upgradeOpen} onClose={closeUpgrade} limitType={upgradeInfo.type} limitMax={upgradeInfo.max} limitCurrent={upgradeInfo.current} />

      {/* Apply Custom Schema Dialog (Enterprise feature) */}
      <ApplyCustomSchemaDialog
        open={applySchemaOpen}
        onOpenChange={setApplySchemaOpen}
        oopClass={selectedClass}
        isEnterprise={isEnterprise}
        onApplied={(newCustomMetadata) => {
          // Refresh the local class list with the new custom_metadata
          setClasses((prev) =>
            prev.map((c) =>
              c.id === selectedClass?.id ? { ...c, custom_metadata: newCustomMetadata } : c,
            ),
          );
        }}
      />
    </div>
  );
};

export default OOPClassesManager;
