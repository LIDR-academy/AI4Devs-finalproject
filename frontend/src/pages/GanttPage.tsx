import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { GanttService, GanttTask, GanttFilters } from '../services/ganttService';
import GanttFiltersComponent from '../components/gantt/GanttFilters';
import GanttStats from '../components/gantt/GanttStats';
import GanttControls from '../components/gantt/GanttControls';

import './GanttPage.css';

// Declaración de tipo para Frappe Gantt
declare const Gantt: any;

const GanttPage: React.FC = () => {
  // Estados
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GanttFilters>({});
  const [viewMode, setViewMode] = useState<'Quarter Day' | 'Half Day' | 'Day' | 'Week' | 'Month'>('Week');
  
  // Referencias
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const ganttInstanceRef = useRef<any>(null);
  
  // Cargar script de Frappe Gantt
  useEffect(() => {
    const loadGanttScript = () => {
      console.log('Loading Gantt script...');
      if (typeof window !== 'undefined' && !(window as any).Gantt) {
        console.log('Gantt library not found, loading from CDN...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/frappe-gantt@0.6.1/dist/frappe-gantt.min.js';
        script.onload = () => {
          console.log('Gantt script loaded successfully');
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdn.jsdelivr.net/npm/frappe-gantt@0.6.1/dist/frappe-gantt.css';
          document.head.appendChild(link);
          
          // Esperar un poco para que el CSS se cargue
          setTimeout(() => {
            console.log('Loading Gantt data after script load...');
            loadGanttData();
          }, 100);
        };
        script.onerror = () => {
          console.error('Failed to load Gantt script');
          setError('Error al cargar la librería del diagrama Gantt');
        };
        document.head.appendChild(script);
      } else {
        console.log('Gantt library already available, loading data...');
        loadGanttData();
      }
    };

    loadGanttScript();
  }, []);

  // Cargar datos cuando cambien los filtros
  useEffect(() => {
    if (typeof (window as any).Gantt !== 'undefined') {
      loadGanttData();
    }
  }, [filters]);
  
  // Efecto adicional para recrear el Gantt cuando el contenedor esté disponible
  useEffect(() => {
    if (tasks.length > 0 && ganttContainerRef.current && typeof (window as any).Gantt !== 'undefined') {
      console.log('Container is now available, creating Gantt chart...');
      createGanttChart(tasks);
    }
  }, [tasks, viewMode]);
  
  // Cargar datos del Gantt
  const loadGanttData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const ganttTasks = await GanttService.getGanttTasks(filters);
      setTasks(ganttTasks);
      
      // Recrear el Gantt cuando cambien las tareas
      if (ganttTasks.length > 0 && typeof (window as any).Gantt !== 'undefined') {
        // Usar setTimeout para asegurar que el DOM esté completamente renderizado
        setTimeout(() => {
          createGanttChart(ganttTasks);
        }, 100);
      }
      
    } catch (err) {
      setError('Error al cargar los datos del diagrama Gantt');
      console.error('Error loading Gantt data:', err);
    } finally {
      setLoading(false);
    }
  };
  


  // Crear o actualizar el diagrama Gantt
  const createGanttChart = (ganttTasks: GanttTask[]) => {
    console.log('createGanttChart called with:', ganttTasks.length, 'tasks');
    console.log('Container ref:', ganttContainerRef.current);
    console.log('Gantt library available:', typeof (window as any).Gantt !== 'undefined');
    
    if (!ganttContainerRef.current) {
      console.log('Container not available, retrying in 200ms...');
      setTimeout(() => createGanttChart(ganttTasks), 200);
      return;
    }
    
    if (typeof (window as any).Gantt === 'undefined') {
      console.log('Gantt library not available');
      setError('La librería del diagrama Gantt no está disponible');
      return;
    }
    
    // Limpiar el contenedor
    ganttContainerRef.current.innerHTML = '';
    
    try {
      console.log('Creating Gantt instance with config:', {
        view_mode: viewMode,
        date_format: 'YYYY-MM-DD',
        language: 'es'
      });
      
      // Crear nueva instancia de Gantt
      ganttInstanceRef.current = new (window as any).Gantt(ganttContainerRef.current, ganttTasks, {
        view_mode: viewMode,
        date_format: 'YYYY-MM-DD',
        language: 'es',
        custom_popup_html: function(task: any) {
          // Popup personalizado con información básica
          return `
            <div class="gantt-popup">
              <h6>${task.name}</h6>
              <p><strong>Inicio:</strong> ${new Date(task.start).toLocaleDateString('es-ES')}</p>
              <p><strong>Fin:</strong> ${new Date(task.end).toLocaleDateString('es-ES')}</p>
              <p><strong>Progreso:</strong> ${task.progress}%</p>
            </div>
          `;
        },
        on_click: function(task: any) {
          console.log('Task clicked:', task);
        },
        on_progress_change: function(task: any, progress: number) {
          console.log('Progress changed:', task.id, progress);
        }
      });
      

      
      console.log('Gantt chart created successfully:', ganttInstanceRef.current);
    } catch (err) {
      setError('Error al crear el diagrama Gantt');
      console.error('Error creating Gantt chart:', err);
    }
  };
  
  // Cambiar modo de vista
  const handleViewModeChange = (newViewMode: typeof viewMode) => {
    setViewMode(newViewMode);
    
    if (ganttInstanceRef.current) {
      ganttInstanceRef.current.change_view_mode(newViewMode);
    }
  };
  
  // Actualizar filtros
  const handleFiltersChange = (newFilters: GanttFilters) => {
    setFilters(newFilters);
  };
  
  // Exportar a PDF (funcionalidad básica)
  const handleExportPDF = () => {
    // TODO: Implementar exportación a PDF
    alert('Funcionalidad de exportación en desarrollo');
  };
  
  // Renderizar contenido principal
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando diagrama Gantt...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert variant="danger" className="my-4">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      );
    }
    
    if (tasks.length === 0) {
      return (
        <Alert variant="info" className="my-4">
          <Alert.Heading>Sin datos</Alert.Heading>
          <p>No se encontraron tareas planificadas que mostrar en el diagrama Gantt.</p>
          <p>Asegúrate de que existen tareas con fechas de inicio y fin asignadas.</p>
        </Alert>
      );
    }
    
    return (
      <Card className="gantt-chart-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Diagrama de Gantt - Planificación de Proyectos</h5>
          <GanttControls 
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onExportPDF={handleExportPDF}
            tasksCount={tasks.length}
          />
        </Card.Header>
        <Card.Body className="p-0">
          <div 
            ref={ganttContainerRef} 
            className="gantt-container"
            style={{ minHeight: '400px' }}
          />
        </Card.Body>
      </Card>
    );
  };
  
  return (
    <Container fluid className="gantt-page">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1">Planificación Gantt</h1>
              <p className="text-muted mb-0">
                Visualización temporal de tareas y proyectos planificados
              </p>
            </div>
          </div>
        </Col>
      </Row>
      
      {/* KPIs - Parte superior */}
      <Row className="mb-4">
        <Col>
          <GanttStats 
            filters={filters}
            tasksCount={tasks.length}
          />
        </Col>
      </Row>
      
      {/* Filtros - Horizontales debajo de los KPIs */}
      <Row className="mb-4">
        <Col>
          <GanttFiltersComponent 
            filters={filters}
            onFiltersChange={handleFiltersChange}
            loading={loading}
          />
        </Col>
      </Row>
      

      
      {/* Diagrama Gantt - Parte inferior */}
      <Row>
        <Col>
          {renderContent()}
        </Col>
      </Row>
    </Container>
  );
};

export default GanttPage; 