import React, { useState, useEffect } from 'react';
import { BarChart3, ShieldAlert, Calendar, Trash2, PieChart, RefreshCw, X } from 'lucide-react';
import { ReportsService, WasteSummaryItem } from '../services/reports.service.js';
import { Modal } from '../../../shared/components/Modal.js';

interface ReportsDashboardProps {
  userRole: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ userRole, isOpen, onClose }) => {
  const [data, setData] = useState<WasteSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterRange, setFilterRange] = useState<'today' | 'week' | 'month'>('week');

  useEffect(() => {
    if (isOpen && userRole === 'ADMIN') {
      setIsLoading(true);
      const now = new Date();
      const startDate = new Date(now.getTime() - 7 * 86400000).toISOString();
      const endDate = now.toISOString();

      ReportsService.fetchWasteReport(startDate, endDate)
        .then(setData)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, userRole, filterRange]);

  if (!isOpen) return null;

  if (userRole !== 'ADMIN') {
    return (
      <Modal maxWidth="500px" width="100%" textAlign="center" padding="32px">
        <ShieldAlert size={48} style={{ color: 'var(--color-danger)', margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Acceso Restringido</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
          El módulo de Reportes y Analíticas de Mermas requiere rol de Administrador.
        </p>
        <button className="btn-touch btn-primary" onClick={onClose} style={{ width: '100%' }}>
          Entendido - Volver al Tablero
        </button>
      </Modal>
    );
  }

  const totalQuantity = data.reduce((acc, item) => acc + parseFloat(item.totalDiscardedQuantity || '0'), 0);
  const expirationWaste = data
    .filter((d) => d.reason === 'EXPIRATION')
    .reduce((acc, item) => acc + parseFloat(item.totalDiscardedQuantity || '0'), 0);

  const maxVal = Math.max(...data.map((d) => parseFloat(d.totalDiscardedQuantity || '0')), 1);

  return (
    <Modal maxWidth="850px" width="92%">
        {/* Header Dashboard */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 style={{ color: 'var(--color-primary)' }} /> Dashboard de Reportes y Mermas FEFO
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Indicadores de Desperdicio y Eficiencia en Tiempo Real
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
              <button
                type="button"
                className={`btn-touch ${filterRange === 'today' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '36px' }}
                onClick={() => setFilterRange('today')}
              >
                Hoy
              </button>
              <button
                type="button"
                className={`btn-touch ${filterRange === 'week' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '36px' }}
                onClick={() => setFilterRange('week')}
              >
                7 Días
              </button>
              <button
                type="button"
                className={`btn-touch ${filterRange === 'month' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '36px' }}
                onClick={() => setFilterRange('month')}
              >
                Mes
              </button>
            </div>

            <button className="btn-touch btn-secondary btn-icon" onClick={onClose} id="btn-close-reports">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tarjetas KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div className="card-dashboard">
            <div className="card-header">
              <div className="card-badge-icon" style={{ backgroundColor: 'rgba(255, 42, 42, 0.15)', color: 'var(--color-danger)' }}>
                <Trash2 size={20} />
              </div>
              <h3 className="card-title">Total Insumos Descartados</h3>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-danger)' }}>
              {totalQuantity.toFixed(2)} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>unidades/KG</span>
            </div>
          </div>

          <div className="card-dashboard">
            <div className="card-header">
              <div className="card-badge-icon" style={{ backgroundColor: 'rgba(255, 170, 0, 0.15)', color: 'var(--color-warning)' }}>
                <PieChart size={20} />
              </div>
              <h3 className="card-title">Mermas por Expiración</h3>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-warning)' }}>
              {expirationWaste.toFixed(2)} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>unidades</span>
            </div>
          </div>
        </div>

        {/* Gráfico de Barras SVG Interactivo */}
        <div className="card-dashboard" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--color-primary)' }} /> Desglose de Descartes por Insumo
          </h3>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <RefreshCw className="spin" size={24} /> Cargando reporte...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {data.map((item) => {
                const qty = parseFloat(item.totalDiscardedQuantity || '0');
                const pct = (qty / maxVal) * 100;

                return (
                  <div key={item.insumoId + item.reason}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                      <span>
                        {item.insumoName} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({item.reason})</span>
                      </span>
                      <span style={{ color: 'var(--color-danger)' }}>
                        {item.totalDiscardedQuantity} {item.unitOfMeasure}
                      </span>
                    </div>

                    {/* Barra de Progresion SVG */}
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', height: '12px', width: '100%', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(5, pct))}%`,
                          height: '100%',
                          backgroundColor: item.reason === 'EXPIRATION' ? 'var(--color-danger)' : 'var(--color-warning)',
                          borderRadius: '6px',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
    </Modal>
  );
};
