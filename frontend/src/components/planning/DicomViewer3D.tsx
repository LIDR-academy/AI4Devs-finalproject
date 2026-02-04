import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

/** Factor de escala: 1 unidad de escena = 1 mm (DICOM típico) */
const SCENE_UNITS_TO_MM = 1;

interface DicomViewer3DProps {
  seriesId?: string;
  reconstructionData?: {
    vertices: number[][];
    faces: number[][];
    normals: number[][];
    metadata: {
      bounds: { min: number[]; max: number[] };
      center: number[];
      scale: number;
    };
  };
  onMeasurement?: (distance: number) => void;
  onClearMeasurement?: () => void;
  /** Modo oscuro: fondo y rejilla adaptados para reducir brillo */
  darkMode?: boolean;
}

interface SceneContentProps {
  reconstructionData: DicomViewer3DProps['reconstructionData'];
  measurementPoints: THREE.Vector3[];
  setMeasurementPoints: React.Dispatch<React.SetStateAction<THREE.Vector3[]>>;
  onMeasurement?: (distance: number) => void;
  meshRef: React.Ref<THREE.Mesh>;
}

function SceneContent({
  reconstructionData,
  measurementPoints,
  setMeasurementPoints,
  onMeasurement,
  meshRef,
}: SceneContentProps) {
  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (measurementPoints.length >= 2) return;
      const point = e.point.clone();
      const next = [...measurementPoints, point];
      setMeasurementPoints(next);
      if (next.length === 2) {
        const distanceMm = next[0].distanceTo(next[1]) * SCENE_UNITS_TO_MM;
        onMeasurement?.(distanceMm);
      }
    },
    [measurementPoints, setMeasurementPoints, onMeasurement]
  );

  const center = useMemo(() => {
    if (!reconstructionData?.metadata?.center) return [0, 0, 0] as [number, number, number];
    const c = reconstructionData.metadata.center;
    return (Array.isArray(c) && c.length >= 3
      ? [Number(c[0]), Number(c[1]), Number(c[2])]
      : [0, 0, 0]) as [number, number, number];
  }, [reconstructionData?.metadata?.center]);

  const bounds = useMemo(() => {
    const b = reconstructionData?.metadata?.bounds;
    const w = b ? (b.max[0] - b.min[0]) || 50 : 50;
    const h = b ? (b.max[1] - b.min[1]) || 50 : 50;
    const d = b ? (b.max[2] - b.min[2]) || 50 : 50;
    return { w, h, d };
  }, [reconstructionData?.metadata?.bounds]);

  const linePoints = useMemo((): [THREE.Vector3, THREE.Vector3] | null => {
    if (measurementPoints.length !== 2) return null;
    return [measurementPoints[0], measurementPoints[1]];
  }, [measurementPoints]);

  const distanceMm = useMemo(() => {
    if (measurementPoints.length !== 2) return null;
    return measurementPoints[0].distanceTo(measurementPoints[1]) * SCENE_UNITS_TO_MM;
  }, [measurementPoints]);

  const midPoint = useMemo(() => {
    if (measurementPoints.length !== 2) return null;
    return new THREE.Vector3()
      .addVectors(measurementPoints[0], measurementPoints[1])
      .multiplyScalar(0.5);
  }, [measurementPoints]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[100, 100, 100]} fov={50} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={50}
        maxDistance={500}
      />
      <Grid args={[100, 100]} cellColor="#6b7280" sectionColor="#4b5563" />

      {/* Plano invisible para que cualquier click devuelva un punto 3D (raycasting) */}
      <mesh position={center} onClick={handleClick}>
        <planeGeometry args={[800, 800]} />
        <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
      </mesh>

      {reconstructionData?.metadata && (
        <group onClick={handleClick}>
          <mesh ref={meshRef as React.Ref<THREE.Mesh>} position={center}>
            <boxGeometry args={[50, 50, 50]} />
            <meshStandardMaterial color="#3b82f6" wireframe />
          </mesh>
          <mesh position={center}>
            <boxGeometry args={[bounds.w, bounds.h, bounds.d]} />
            <meshStandardMaterial color="#10b981" opacity={0.2} transparent />
          </mesh>
        </group>
      )}

      {/* Puntos de medición (esferas de baja resolución para FPS) */}
      {measurementPoints.map((point, index) => (
        <mesh key={`pt-${index}`} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[2, 8, 8]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      ))}

      {/* Línea de medición y etiqueta en mm */}
      {linePoints && (
        <Line points={linePoints} color="#ef4444" lineWidth={2} />
      )}
      {midPoint && distanceMm !== null && (
        <Html position={[midPoint.x, midPoint.y, midPoint.z]} center>
          <div
            className="px-2 py-1 rounded text-xs font-mono font-bold text-white bg-gray-900/90 border border-red-500 shadow"
            style={{ whiteSpace: 'nowrap' }}
          >
            {distanceMm.toFixed(2)} mm
          </div>
        </Html>
      )}
    </>
  );
}

const DicomViewer3D: React.FC<DicomViewer3DProps> = ({
  reconstructionData,
  onMeasurement,
  onClearMeasurement,
  darkMode = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState<THREE.Vector3[]>([]);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (reconstructionData && reconstructionData.vertices.length > 0) {
      setIsLoading(true);
      const t = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(t);
    }
  }, [reconstructionData]);

  const glConfig = useMemo(
    () => ({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance' as const,
      pixelRatio: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 2, 2),
    }),
    []
  );

  const sceneContentProps = useMemo<SceneContentProps>(
    () => ({
      reconstructionData,
      measurementPoints,
      setMeasurementPoints,
      onMeasurement,
      meshRef,
    }),
    [reconstructionData, measurementPoints, onMeasurement]
  );

  return (
    <div className="w-full h-full bg-medical-gray-900 rounded-lg overflow-hidden relative">
      <Canvas className="w-full h-full" gl={glConfig} frameloop="always">
        <SceneContent {...sceneContentProps} />
      </Canvas>

      {isLoading && (
        <div
          className={`absolute inset-0 flex items-center justify-center ${darkMode ? 'bg-medical-gray-900/80' : 'bg-gray-100/90'}`}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto mb-4" />
            <p className={darkMode ? 'text-white' : 'text-gray-800'}>
              Cargando reconstrucción 3D...
            </p>
          </div>
        </div>
      )}

      <div
        className={`absolute top-4 left-4 p-4 rounded-lg text-sm ${darkMode ? 'bg-medical-gray-800/90 text-white' : 'bg-white/95 text-gray-800 shadow'}`}
      >
        <h3 className="font-semibold mb-2">Controles</h3>
        <ul className="space-y-1 text-xs">
          <li>🖱️ Click: Seleccionar 1.º y 2.º punto (medición en mm)</li>
          <li>🖱️ Arrastrar: Rotar</li>
          <li>🔍 Scroll: Zoom</li>
          <li>🖱️ Click derecho + arrastrar: Pan</li>
        </ul>
        {measurementPoints.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMeasurementPoints([]);
              onClearMeasurement?.();
            }}
            className="mt-2 w-full py-1.5 rounded bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium"
          >
            Borrar medición
          </button>
        )}
      </div>
    </div>
  );
};

export default DicomViewer3D;
