import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchPortfolio, fetchValorizacionDiaria, fetchActivos } from '@/services/api';

export default function WealthManagementDashboard() {
  const [portfolio, setPortfolio] = useState(null);
  const [valorizacionDiaria, setValorizacionDiaria] = useState([]);
  const [activos, setActivos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Clear previous state
        setPortfolio(null);
        setValorizacionDiaria([]);
        setActivos([]);

        const portfolioData = await fetchPortfolio();
        setPortfolio(portfolioData);

        const valorizacionData = await fetchValorizacionDiaria(portfolioData.id);
        setValorizacionDiaria(valorizacionData);

        const activosData = await fetchActivos(portfolioData.id);
        setActivos(activosData);
      } catch (err) {
        setError('Failed to fetch data from the backend');
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div className="container mx-auto p-4">Error: {error}</div>;
  }

  if (!portfolio || valorizacionDiaria.length === 0 || activos.length === 0) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Wealth Management Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={valorizacionDiaria.map(v => ({ date: v.fecha, value: v.valor }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Fecha compra</TableHead>
                <TableHead>Valor inicial</TableHead>
                <TableHead>Valor actual</TableHead>
                <TableHead>Ganancia</TableHead>
                <TableHead>Ganancia %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activos.map((activo) => (
                <TableRow key={activo.ticker}>
                  <TableCell>
                    <div>{activo.nombre}</div>
                    <div className="text-sm text-muted-foreground">{activo.ticker}</div>
                  </TableCell>
                  <TableCell>{activo.fechaCompra}</TableCell>
                  <TableCell>${activo.precioTotalCoste.toFixed(2)}</TableCell>
                  <TableCell>${activo.ultimaValorizacion.toFixed(2)}</TableCell>
                  <TableCell className={activo.ganancia >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${activo.ganancia !== null && activo.ganancia !== undefined ? activo.ganancia.toFixed(2) : '0.00'}
                  </TableCell>
                  <TableCell className={activo.gananciaPorcentaje >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {activo.gananciaPorcentaje !== null && activo.gananciaPorcentaje !== undefined ? activo.gananciaPorcentaje.toFixed(2) : '0.00'}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}