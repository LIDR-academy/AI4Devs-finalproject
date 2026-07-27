// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect } from "react";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import { Link, useNavigate } from "react-router-dom";
import { API, useAuth } from "@/App";
import { getAuthHeaders } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { toast } from "sonner";
import {
  Workflow,
  Search,
  Plus,
  Folder,
  FolderPlus,
  FileCode,
  Star,
  StarOff,
  Edit,
  Trash2,
  Clock,
  User,
  GitBranch,
  Tag,
  LayoutDashboard,
  Library,
  Code2,
  Puzzle,
  Filter,
  ArrowUpDown
} from "lucide-react";

const DiagramsLibrary = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [diagrams, setDiagrams] = useState([]);
  const [tags, setTags] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [diagramToDelete, setDiagramToDelete] = useState(null);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("__all__");

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedTag]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API}/projects`, { headers: getAuthHeaders() });
      if (res.ok) setProjects(await res.json());
    } catch { /* non-critical */ }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedTag) params.append("tag", selectedTag);

      const [diagramsRes, tagsRes, favoritesRes] = await Promise.all([
        fetch(`${API}/diagrams?${params}`, { headers: getAuthHeaders() }),
        fetch(`${API}/tags`, { headers: getAuthHeaders() }),
        fetch(`${API}/favorites`, { headers: getAuthHeaders() })
      ]);

      if (diagramsRes.ok) setDiagrams(await diagramsRes.json());
      if (tagsRes.ok) setTags(await tagsRes.json());
      if (favoritesRes.ok) {
        const favs = await favoritesRes.json();
        setFavorites(favs.map(f => f.diagram_id));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error al cargar diagramas");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (diagram) => {
    try {
      const isFavorite = favorites.includes(diagram.id);
      const method = isFavorite ? "DELETE" : "POST";
      
      await fetch(`${API}/favorites/${diagram.id}`, {
        method,
        headers: getAuthHeaders()
      });

      if (isFavorite) {
        setFavorites(favorites.filter(id => id !== diagram.id));
        toast.success("Eliminado de favoritos");
      } else {
        setFavorites([...favorites, diagram.id]);
        toast.success("Añadido a favoritos");
      }
    } catch (error) {
      toast.error("Error al actualizar favoritos");
    }
  };

  const deleteDiagram = async () => {
    if (!diagramToDelete) return;
    try {
      await fetch(`${API}/diagrams/${diagramToDelete.id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      setDiagrams(diagrams.filter(d => d.id !== diagramToDelete.id));
      toast.success("Diagrama eliminado");
    } catch (error) {
      toast.error("Error al eliminar diagrama");
    } finally {
      setDeleteDialogOpen(false);
      setDiagramToDelete(null);
    }
  };

  const updateDiagramTags = async () => {
    if (!selectedDiagram) return;
    try {
      const updatedTags = newTag 
        ? [...(selectedDiagram.tags || []), newTag]
        : selectedDiagram.tags;

      await fetch(`${API}/diagrams/${selectedDiagram.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ tags: updatedTags })
      });

      setDiagrams(diagrams.map(d => 
        d.id === selectedDiagram.id ? { ...d, tags: updatedTags } : d
      ));
      toast.success("Tags actualizados");
      fetchData(); // Refresh tags
    } catch (error) {
      toast.error("Error al actualizar tags");
    } finally {
      setTagDialogOpen(false);
      setSelectedDiagram(null);
      setNewTag("");
    }
  };

  const sortedDiagrams = [...diagrams].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.updated_at) - new Date(a.updated_at);
    } else if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "version") {
      return b.current_version - a.current_version;
    }
    return 0;
  });

  // Client-side project filter
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectDiagramIds = selectedProject?.diagram_ids || [];
  const filteredDiagrams = selectedProjectId !== "__all__"
    ? sortedDiagrams.filter(d => projectDiagramIds.includes(d.id))
    : sortedDiagrams;

  const groupedDiagrams = filteredDiagrams.reduce((acc, diagram) => {
    const category = diagram.tags?.[0] || "Sin categoría";
    if (!acc[category]) acc[category] = [];
    acc[category].push(diagram);
    return acc;
  }, {});

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="diagrams-library-page">
      <ProjectMenuBar />

      <main className="flex-1">
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
          <h1 className="text-base font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>Biblioteca de Diagramas</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Buscar diagramas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 rounded-lg h-9 text-sm"
                data-testid="search-input"
              />
            </div>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-48 rounded-lg h-9 text-sm">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Todos los proyectos" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="__all__">Todos los proyectos</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.diagram_ids?.length || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 rounded-lg h-9 text-sm" data-testid="sort-select">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="recent">Mas reciente</SelectItem>
                <SelectItem value="name">Nombre</SelectItem>
                <SelectItem value="version">Version</SelectItem>
              </SelectContent>
            </Select>
            {isAuthenticated && (
            <Link to="/editor">
              <Button data-testid="new-diagram-btn" size="sm" className="bg-deep-navy hover:bg-deep-navy/90 text-white rounded-lg h-8 text-xs font-semibold">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Nuevo Diagrama
              </Button>
            </Link>
            )}
          </div>
        </header>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border border-zinc-200 p-4 space-y-3">
                  <div className="animate-pulse h-4 bg-zinc-100 w-3/4" />
                  <div className="animate-pulse h-3 bg-zinc-50 w-full" />
                  <div className="animate-pulse h-3 bg-zinc-50 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredDiagrams.length === 0 ? (
            <div className="text-center py-16">
              <FileCode className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-zinc-900 mb-2" style={{ fontFamily: "'Chivo', sans-serif" }}>No hay diagramas</h3>
              <p className="text-xs text-zinc-400 mb-4">Crea tu primer diagrama BPMN para comenzar</p>
              <Link to="/editor">
                <Button className="bg-deep-navy hover:bg-deep-navy/90 rounded-lg h-8 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Crear Diagrama
                </Button>
              </Link>
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={Object.keys(groupedDiagrams)} className="space-y-4">
              {Object.entries(groupedDiagrams).map(([category, categoryDiagrams]) => (
                <AccordionItem key={category} value={category} className="border-2 border-zinc-200 rounded-lg bg-white">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Folder className="w-5 h-5 text-zinc-500" />
                      <span className="text-sm font-semibold text-zinc-900">{category}</span>
                      <Badge variant="outline" className="ml-2 rounded-lg text-[10px]">
                        {categoryDiagrams.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {categoryDiagrams.map((diagram) => (
                        <Card
                          key={diagram.id}
                          className="rounded-lg border-2 border-zinc-200 hover:border-zinc-900 transition-colors cursor-pointer"
                          data-testid={`diagram-card-${diagram.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-zinc-900 truncate">{diagram.name}</h3>
                                <p className="text-xs text-zinc-400 truncate mt-1">
                                  {diagram.description || "Sin descripcion"}
                                </p>
                              </div>
                              {isAuthenticated && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(diagram);
                                }}
                                className="flex-shrink-0 h-7 w-7"
                              >
                                {favorites.includes(diagram.id) ? (
                                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                ) : (
                                  <StarOff className="w-4 h-4 text-zinc-300" />
                                )}
                              </Button>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-zinc-400 mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                              <span className="flex items-center gap-1">
                                <GitBranch className="w-3 h-3" />
                                v{diagram.current_version}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(diagram.updated_at)}
                              </span>
                            </div>

                            {diagram.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {diagram.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-[10px] rounded-lg">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
                              <Link to={`/editor/${diagram.id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full rounded-lg h-8 text-xs">
                                  Abrir
                                </Button>
                              </Link>
                              {isAuthenticated && (
                              <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDiagram(diagram);
                                  setTagDialogOpen(true);
                                }}
                                className="h-7 w-7 rounded-lg"
                              >
                                <Tag className="w-3.5 h-3.5 text-zinc-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDiagramToDelete(diagram);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                              </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </main>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontFamily: "'Chivo', sans-serif" }} className="text-sm font-bold">Eliminar diagrama?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Esta accion eliminara permanentemente "{diagramToDelete?.name}" y todo su historial de versiones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg text-xs h-8">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={deleteDiagram} className="bg-red-600 hover:bg-red-700 rounded-lg text-xs h-8">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Tags Dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Chivo', sans-serif" }} className="text-sm font-bold">Gestionar Tags</DialogTitle>
            <DialogDescription className="text-xs">
              Anade o elimina tags para organizar tu diagrama.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedDiagram?.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-lg text-xs">
                  {tag}
                  <button
                    onClick={() => {
                      setSelectedDiagram({
                        ...selectedDiagram,
                        tags: selectedDiagram.tags.filter(t => t !== tag)
                      });
                    }}
                    className="ml-2 hover:text-red-500"
                  >
                    x
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Nuevo tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="rounded-lg"
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (newTag && !selectedDiagram?.tags?.includes(newTag)) {
                    setSelectedDiagram({
                      ...selectedDiagram,
                      tags: [...(selectedDiagram?.tags || []), newTag]
                    });
                    setNewTag("");
                  }
                }}
                className="rounded-lg text-xs h-8"
              >
                Anadir
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagDialogOpen(false)} className="rounded-lg text-xs h-8">
              Cancelar
            </Button>
            <Button onClick={updateDiagramTags} className="bg-deep-navy hover:bg-deep-navy/90 rounded-lg text-xs h-8">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiagramsLibrary;
