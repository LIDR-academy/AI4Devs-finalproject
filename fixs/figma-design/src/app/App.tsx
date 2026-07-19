import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search, MapPin, Star, Shield, CheckCircle,
  ChevronRight, Heart, Calendar, MessageSquare,
  User, Map, Clock, BadgeCheck, Award,
  ArrowRight, Menu, X, Sparkles,
  Home, Bot, ChevronLeft, Upload, SlidersHorizontal,
  Grid3X3, List, Instagram, Phone, Globe,
  ChevronDown, ChevronUp, Filter, LayoutGrid,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ══════════════════════════════════════════════════════════════════════════════

type Vista = "home" | "artistas" | "perfil" | "mapa";

type Artista = {
  id: number;
  nombre: string;
  handle: string;
  tipo: "independiente" | "estudio";
  comuna: string;
  direccion: string;
  rating: number;
  resenas: number;
  estilos: string[];
  precioMin: number;
  precioMax: number;
  precioHora: number;
  deposito: number;
  cancelacion: "24h" | "48h" | "72h";
  verificado: boolean;
  certificado: boolean;
  premiado: boolean;
  auspiciado: boolean;
  image: string;
  avatarImg: string;
  anosExp: number;
  bio: string;
  premios: { evento: string; categoria: string; anio: number }[];
  certificaciones: { tipo: string; emisor: string; vigencia: string }[];
  galeria: string[];
};

type Resena = {
  id: number;
  nombre: string;
  comuna: string;
  rating: number;
  comentario: string;
  fecha: string;
  avatar: string;
  estilo: string;
  dimHigiene: number;
  dimDolor: number;
  dimTrato: number;
  dimResultado: number;
  fotoVerificada: boolean;
};

// ══════════════════════════════════════════════════════════════════════════════
// DATOS
// ══════════════════════════════════════════════════════════════════════════════

const ESTILOS_TATTOO = [
  "Realismo", "Tradicional", "Blackwork", "Fine-line",
  "Japonés", "Lettering", "Neotradicional", "Acuarela",
  "Geométrico", "Minimalista", "Dotwork", "Tribal",
];

const ESTILOS_IMG: Record<string, string> = {
  "Realismo": "photo-1519822356-4853be4346a8",
  "Tradicional": "photo-1568515045052-f9a854d70bfd",
  "Blackwork": "photo-1597852075234-fd721ac361d3",
  "Fine-line": "photo-1479767574301-a01c78234a0c",
  "Japonés": "photo-1565058379802-bbe93b2f703a",
  "Lettering": "photo-1588417490421-63d4e4175f95",
  "Neotradicional": "photo-1643513456892-437e82e06f4a",
  "Acuarela": "photo-1724343163782-52276ca2e6c2",
  "Geométrico": "photo-1561377455-190afb395ed7",
  "Minimalista": "photo-1759247943101-f1b32bcc6a8b",
  "Dotwork": "photo-1712432321375-226f466fff85",
  "Tribal": "photo-1607943917700-18ec6ff5a4c2",
};

const GALERIA_BASE = [
  "photo-1568515045052-f9a854d70bfd",
  "photo-1597852075234-fd721ac361d3",
  "photo-1565058379802-bbe93b2f703a",
  "photo-1643513456892-437e82e06f4a",
  "photo-1479767574301-a01c78234a0c",
  "photo-1519822356-4853be4346a8",
  "photo-1724343163782-52276ca2e6c2",
  "photo-1759247943101-f1b32bcc6a8b",
  "photo-1561377455-190afb395ed7",
  "photo-1588417490421-63d4e4175f95",
  "photo-1712432321375-226f466fff85",
  "photo-1775135332562-9ff99e65a616",
];

const ARTISTAS: Artista[] = [
  {
    id: 1,
    nombre: "Valentina Cortés",
    handle: "@vale.ink",
    tipo: "independiente",
    comuna: "Providencia",
    direccion: "Av. Providencia 2124, of. 304",
    rating: 4.97,
    resenas: 312,
    estilos: ["Realismo", "Fine-line", "Minimalista"],
    precioMin: 45000,
    precioMax: 90000,
    precioHora: 60000,
    deposito: 30,
    cancelacion: "48h",
    verificado: true,
    certificado: true,
    premiado: true,
    auspiciado: false,
    image: "https://images.unsplash.com/photo-1568515045052-f9a854d70bfd?w=600&h=720&fit=crop&auto=format",
    avatarImg: "https://images.unsplash.com/photo-1577357922830-eae2e1c7b4de?w=80&h=80&fit=crop&auto=format",
    anosExp: 10,
    bio: "Hola, soy Vale. Llevo más de 10 años tatuando y me especializo en realismo y fine-line. Cada pieza que creo es única y diseñada especialmente para ti. Trabajo en un espacio privado, limpio y certificado, donde tu comodidad y seguridad son lo primero. Me encanta tomar tiempo para entender tu visión antes de plasmarla en la piel.",
    premios: [
      { evento: "Santiago Tattoo Show", categoria: "Mejor Realismo Color", anio: 2024 },
      { evento: "Ink Masters Chile", categoria: "Artista del Año", anio: 2023 },
    ],
    certificaciones: [
      { tipo: "Sanitaria MINSAL", emisor: "Ministerio de Salud", vigencia: "Mar 2026" },
      { tipo: "Bioseguridad", emisor: "Cruz Roja Chile", vigencia: "Jun 2025" },
    ],
    galeria: GALERIA_BASE,
  },
  {
    id: 2,
    nombre: "Matías Herrera",
    handle: "@mati.blackwork",
    tipo: "independiente",
    comuna: "Ñuñoa",
    direccion: "Irarrázaval 3150, local 8",
    rating: 4.93,
    resenas: 247,
    estilos: ["Blackwork", "Geométrico", "Dotwork"],
    precioMin: 35000,
    precioMax: 70000,
    precioHora: 45000,
    deposito: 25,
    cancelacion: "24h",
    verificado: true,
    certificado: true,
    premiado: false,
    auspiciado: true,
    image: "https://images.unsplash.com/photo-1597852075234-fd721ac361d3?w=600&h=720&fit=crop&auto=format",
    avatarImg: "https://images.unsplash.com/photo-1671695157166-c4bbd8e6e94e?w=80&h=80&fit=crop&auto=format",
    anosExp: 7,
    bio: "El blackwork es mi pasión. Trabajo con geometría sagrada, mandalas y diseños orgánicos que se adaptan al cuerpo. Cada diseño es original — no hago flash. Si buscas algo oscuro, preciso y con carácter, hablemos.",
    premios: [],
    certificaciones: [
      { tipo: "Sanitaria MINSAL", emisor: "Ministerio de Salud", vigencia: "Ago 2025" },
    ],
    galeria: [...GALERIA_BASE].reverse(),
  },
  {
    id: 3,
    nombre: "Camila Vega",
    handle: "@cami.irezumi",
    tipo: "estudio",
    comuna: "Barrio Italia",
    direccion: "Av. Italia 1780 — Dark Matter Studio",
    rating: 4.99,
    resenas: 401,
    estilos: ["Japonés", "Neotradicional", "Acuarela"],
    precioMin: 50000,
    precioMax: 100000,
    precioHora: 75000,
    deposito: 30,
    cancelacion: "72h",
    verificado: true,
    certificado: true,
    premiado: true,
    auspiciado: true,
    image: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=600&h=720&fit=crop&auto=format",
    avatarImg: "https://images.unsplash.com/photo-1687825495498-1bb4c92dbb19?w=80&h=80&fit=crop&auto=format",
    anosExp: 13,
    bio: "Formada en el irezumi tradicional japonés, fusiono la técnica oriental con una sensibilidad contemporánea. Mis piezas son narrativas visuales — dragones, carpa, oni — con un acabado que dura décadas. Soy artista residente en Dark Matter Studio, Barrio Italia.",
    premios: [
      { evento: "Valparaíso Tattoo Fest", categoria: "Mejor Pieza Oriental", anio: 2024 },
      { evento: "Santiago Tattoo Show", categoria: "Best in Show", anio: 2022 },
    ],
    certificaciones: [
      { tipo: "Sanitaria MINSAL", emisor: "Ministerio de Salud", vigencia: "Ene 2026" },
      { tipo: "Bioseguridad", emisor: "Cruz Roja Chile", vigencia: "Sep 2025" },
      { tipo: "Municipal", emisor: "Municipalidad de Santiago", vigencia: "Dic 2025" },
    ],
    galeria: GALERIA_BASE.slice(2).concat(GALERIA_BASE.slice(0, 2)),
  },
  {
    id: 4,
    nombre: "Rodrigo Soto",
    handle: "@rodo.letters",
    tipo: "independiente",
    comuna: "Bellavista",
    direccion: "Constitución 187, depto 2B",
    rating: 4.90,
    resenas: 189,
    estilos: ["Lettering", "Minimalista", "Fine-line"],
    precioMin: 30000,
    precioMax: 65000,
    precioHora: 40000,
    deposito: 20,
    cancelacion: "24h",
    verificado: true,
    certificado: false,
    premiado: false,
    auspiciado: false,
    image: "https://images.unsplash.com/photo-1643513456892-437e82e06f4a?w=600&h=720&fit=crop&auto=format",
    avatarImg: "https://images.unsplash.com/photo-1724343163782-52276ca2e6c2?w=80&h=80&fit=crop&auto=format",
    anosExp: 6,
    bio: "Lettering, tipografía y trazos minimalistas. Creo frases, poemas y citas que acompañan para siempre. Trabajo fine-line con una aguja y mucha paciencia. Si tienes palabras que quieres llevar en la piel, este es tu lugar.",
    premios: [],
    certificaciones: [],
    galeria: GALERIA_BASE.slice(3).concat(GALERIA_BASE.slice(0, 3)),
  },
  {
    id: 5,
    nombre: "Diego Fuentes",
    handle: "@diego.tribal",
    tipo: "estudio",
    comuna: "Las Condes",
    direccion: "El Bosque Norte 134, piso 2",
    rating: 4.88,
    resenas: 156,
    estilos: ["Tribal", "Dotwork", "Blackwork"],
    precioMin: 40000,
    precioMax: 80000,
    precioHora: 55000,
    deposito: 25,
    cancelacion: "48h",
    verificado: true,
    certificado: true,
    premiado: false,
    auspiciado: true,
    image: "https://images.unsplash.com/photo-1547754145-ef9ff306e3f3?w=600&h=720&fit=crop&auto=format",
    avatarImg: "https://images.unsplash.com/photo-1759247943101-f1b32bcc6a8b?w=80&h=80&fit=crop&auto=format",
    anosExp: 9,
    bio: "Especialista en tatuaje tribal y dotwork. Mis diseños toman inspiración en las culturas Maori, Polinesio y Maya, adaptados a la anatomía de cada cliente. Trabajo en un estudio privado con esterilización en autoclave.",
    premios: [],
    certificaciones: [
      { tipo: "Sanitaria MINSAL", emisor: "Ministerio de Salud", vigencia: "Nov 2025" },
    ],
    galeria: GALERIA_BASE.slice(1).concat(GALERIA_BASE.slice(0, 1)),
  },
  {
    id: 6,
    nombre: "Isadora Paz",
    handle: "@isa.acuarela",
    tipo: "independiente",
    comuna: "Vitacura",
    direccion: "Alonso de Córdova 3107, local 3",
    rating: 4.94,
    resenas: 213,
    estilos: ["Acuarela", "Neotradicional", "Fine-line"],
    precioMin: 55000,
    precioMax: 110000,
    precioHora: 80000,
    deposito: 35,
    cancelacion: "72h",
    verificado: true,
    certificado: true,
    premiado: true,
    auspiciado: false,
    image: "https://images.unsplash.com/photo-1779122590768-cd9bd39b07b4?w=600&h=720&fit=crop&auto=format",
    avatarImg: "https://images.unsplash.com/photo-1781258606224-c010bc4a642a?w=80&h=80&fit=crop&auto=format",
    anosExp: 8,
    bio: "El tatuaje acuarela es delicado, expresivo y único. Cada pieza que hago captura el fluir de los colores como si fueran manchas de tinta sobre papel húmedo. Formada en bellas artes, mezclo ilustración y tatuaje en cada sesión.",
    premios: [{ evento: "Ink Masters Chile", categoria: "Mejor Acuarela", anio: 2023 }],
    certificaciones: [
      { tipo: "Sanitaria MINSAL", emisor: "Ministerio de Salud", vigencia: "Feb 2026" },
      { tipo: "Municipal", emisor: "Municipalidad de Vitacura", vigencia: "May 2025" },
    ],
    galeria: GALERIA_BASE.slice(4).concat(GALERIA_BASE.slice(0, 4)),
  },
];

const RESENAS_PERFIL: Resena[] = [
  {
    id: 1, nombre: "Sofía Alarcón", comuna: "Providencia",
    rating: 5, comentario: "Valentina transformó mi idea en algo que supera todo lo que imaginé. El realismo del retrato es increíble. El espacio fue súper limpio y ella estuvo atenta en todo momento.",
    fecha: "Dic 2024", avatar: "https://images.unsplash.com/photo-1577357922830-eae2e1c7b4de?w=80&h=80&fit=crop&auto=format",
    estilo: "Realismo / Retrato", dimHigiene: 5, dimDolor: 4, dimTrato: 5, dimResultado: 5, fotoVerificada: true,
  },
  {
    id: 2, nombre: "Tomás Muñoz", comuna: "Ñuñoa",
    rating: 5, comentario: "Me hice el antebrazo completo en dos sesiones. El nivel de detalle en las flores y el sombreado es de otro nivel. La sesión fue cómoda y bien explicada.",
    fecha: "Nov 2024", avatar: "https://images.unsplash.com/photo-1671695157166-c4bbd8e6e94e?w=80&h=80&fit=crop&auto=format",
    estilo: "Fine-line botánico", dimHigiene: 5, dimDolor: 4, dimTrato: 5, dimResultado: 5, fotoVerificada: true,
  },
  {
    id: 3, nombre: "Javiera Rojas", comuna: "Las Condes",
    rating: 5, comentario: "Era mi primer tatuaje y estaba nerviosa. Valentina me explicó todo el proceso, me ayudó a elegir el lugar y el diseño. No pude pedir mejor primera experiencia.",
    fecha: "Ene 2025", avatar: "https://images.unsplash.com/photo-1687825495498-1bb4c92dbb19?w=80&h=80&fit=crop&auto=format",
    estilo: "Minimalista / Luna", dimHigiene: 5, dimDolor: 5, dimTrato: 5, dimResultado: 5, fotoVerificada: false,
  },
  {
    id: 4, nombre: "Camilo Reyes", comuna: "Vitacura",
    rating: 4, comentario: "Muy buena artista. El diseño quedó perfecto. Solo quitaría una estrella porque tuve que esperar 15 minutos, pero valió la pena totalmente.",
    fecha: "Oct 2024", avatar: "https://images.unsplash.com/photo-1724343163782-52276ca2e6c2?w=80&h=80&fit=crop&auto=format",
    estilo: "Blackwork geométrico", dimHigiene: 5, dimDolor: 4, dimTrato: 4, dimResultado: 5, fotoVerificada: false,
  },
];

const COMUNAS = ["Providencia", "Ñuñoa", "Barrio Italia", "Bellavista", "Las Condes", "Vitacura", "Miraflores", "Santiago Centro", "La Reina", "Macul"];

// ══════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ══════════════════════════════════════════════════════════════════════════════

function formatCLP(n: number) {
  return "$" + n.toLocaleString("es-CL");
}

function unsplash(id: string, w = 400, h = 400) {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format`;
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTES COMPARTIDOS
// ══════════════════════════════════════════════════════════════════════════════

function Estrellas({ rating, size = 13, interactivo = false, onChange }: {
  rating: number; size?: number; interactivo?: boolean; onChange?: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size}
          onClick={() => interactivo && onChange?.(i)}
          onMouseEnter={() => interactivo && setHover(i)}
          onMouseLeave={() => interactivo && setHover(0)}
          style={{
            fill: i <= (hover || Math.round(rating)) ? "#D4AF37" : "transparent",
            color: i <= (hover || Math.round(rating)) ? "#D4AF37" : "rgba(255,255,255,0.2)",
            cursor: interactivo ? "pointer" : "default",
          }}
        />
      ))}
    </div>
  );
}

function BadgeVerificado() {
  return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 border text-[10px] font-semibold" style={{ backgroundColor: "rgba(212,175,55,0.10)", borderColor: "rgba(212,175,55,0.25)", color: "#D4AF37" }}><BadgeCheck size={10} /> Verificado</span>;
}
function BadgeCertificado() {
  return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 border text-[10px] font-semibold" style={{ backgroundColor: "rgba(74,222,128,0.08)", borderColor: "rgba(74,222,128,0.20)", color: "#4ade80" }}><Shield size={10} /> Sanitario</span>;
}
function BadgePremiado() {
  return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 border text-[10px] font-semibold" style={{ backgroundColor: "rgba(251,191,36,0.08)", borderColor: "rgba(251,191,36,0.20)", color: "#fbbf24" }}><Award size={10} /> Premiado</span>;
}
function BadgeAuspiciado() {
  return <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 border text-[10px] font-semibold" style={{ backgroundColor: "rgba(167,139,250,0.08)", borderColor: "rgba(167,139,250,0.20)", color: "#a78bfa" }}><Sparkles size={10} /> Auspiciado</span>;
}

function EtiquetaDorada({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] tracking-[0.16em] uppercase font-semibold mb-3" style={{ color: "#D4AF37" }}>{children}</div>;
}

function BarraDimension({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] w-28 shrink-0" style={{ color: "#A3A3A3" }}>{label}</span>
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full" style={{ width: `${(valor / 5) * 100}%`, backgroundColor: "#D4AF37" }} />
      </div>
      <span className="text-[10px] font-semibold text-white w-4">{valor}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TARJETA DE ARTISTA — modo grid y modo lista
// ══════════════════════════════════════════════════════════════════════════════

function TarjetaArtista({
  artista, modo, onVerPerfil, favoritos, onToggleFav
}: {
  artista: Artista; modo: "grid" | "lista";
  onVerPerfil: () => void;
  favoritos: number[];
  onToggleFav: (id: number) => void;
}) {
  const [hover, setHover] = useState(false);

  if (modo === "lista") {
    return (
      <div className="flex flex-col sm:flex-row rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer"
        style={{ backgroundColor: "#161616", borderColor: hover ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.07)", boxShadow: hover ? "0 20px 50px rgba(0,0,0,0.4)" : "none" }}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <div className="relative shrink-0 overflow-hidden" style={{ width: "200px", minHeight: "180px", backgroundColor: "#1E1E1E" }}>
          <img src={artista.image} alt={artista.nombre} className="w-full h-full object-cover transition-transform duration-700"
            style={{ transform: hover ? "scale(1.06)" : "scale(1)" }} />
          <button onClick={e => { e.stopPropagation(); onToggleFav(artista.id); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", borderColor: "rgba(255,255,255,0.10)" }}>
            <Heart size={13} style={{ color: favoritos.includes(artista.id) ? "#D4AF37" : "#fff", fill: favoritos.includes(artista.id) ? "#D4AF37" : "transparent" }} />
          </button>
        </div>
        <div className="flex-1 flex flex-col justify-between p-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-base">{artista.nombre}</span>
              {artista.verificado && <BadgeVerificado />}
              {artista.certificado && <BadgeCertificado />}
              {artista.premiado && <BadgePremiado />}
            </div>
            <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "#A3A3A3" }}>
              <div className="flex items-center gap-1"><Estrellas rating={artista.rating} size={11} /><span className="font-semibold text-white ml-1">{artista.rating}</span><span>({artista.resenas})</span></div>
              <span>·</span>
              <div className="flex items-center gap-1"><MapPin size={11} />{artista.comuna}</div>
              <span>·</span>
              <div className="flex items-center gap-1"><Clock size={11} />{artista.anosExp} años</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {artista.estilos.map(s => (
                <span key={s} className="text-[11px] rounded-full px-2.5 py-0.5 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "#A3A3A3" }}>{s}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 mt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div>
              <div className="text-[10px]" style={{ color: "#A3A3A3" }}>Tarifa por hora</div>
              <div className="text-sm font-semibold">{formatCLP(artista.precioMin)} – {formatCLP(artista.precioMax)}</div>
            </div>
            <button onClick={onVerPerfil}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ backgroundColor: "#D4AF37", color: "#0D0D0D" }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = "1"}>
              Ver perfil <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer"
      style={{ backgroundColor: "#161616", borderColor: hover ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.07)", transform: hover ? "translateY(-3px)" : "translateY(0)", boxShadow: hover ? "0 20px 50px rgba(0,0,0,0.5)" : "none" }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="relative overflow-hidden" style={{ height: "240px", backgroundColor: "#1E1E1E" }}>
        <img src={artista.image} alt={artista.nombre} className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hover ? "scale(1.07)" : "scale(1)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(22,22,22,0.9) 0%, transparent 55%)" }} />
        <button onClick={e => { e.stopPropagation(); onToggleFav(artista.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.10)" }}>
          <Heart size={13} style={{ color: favoritos.includes(artista.id) ? "#D4AF37" : "#fff", fill: favoritos.includes(artista.id) ? "#D4AF37" : "transparent" }} />
        </button>
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          {artista.certificado && <BadgeCertificado />}
          {artista.premiado && <BadgePremiado />}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className="font-semibold text-[15px]">{artista.nombre}</span>
          {artista.verificado && <BadgeVerificado />}
        </div>
        <div className="text-xs mb-3" style={{ color: "#A3A3A3" }}>{artista.handle} · {artista.comuna}</div>
        <div className="flex items-center gap-1.5 mb-3">
          <Estrellas rating={artista.rating} size={12} />
          <span className="text-xs font-semibold">{artista.rating}</span>
          <span className="text-xs" style={{ color: "#A3A3A3" }}>({artista.resenas})</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {artista.estilos.slice(0, 2).map(s => (
            <span key={s} className="text-[10px] rounded-full px-2.5 py-0.5 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "#A3A3A3" }}>{s}</span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div>
            <div className="text-[10px]" style={{ color: "#A3A3A3" }}>Desde</div>
            <div className="text-sm font-semibold">{formatCLP(artista.precioMin)}/hr</div>
          </div>
          <button onClick={onVerPerfil}
            className="text-xs font-semibold px-3.5 py-2 rounded-xl transition-all"
            style={{ backgroundColor: "#D4AF37", color: "#0D0D0D" }}>
            Ver perfil
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL CHATBOT COTIZADOR
// ══════════════════════════════════════════════════════════════════════════════

const CHATBOT_PASOS = [
  { paso: 1, pregunta: "¿En qué zona del cuerpo va el tatuaje?", tipo: "chips", opciones: ["Brazo", "Antebrazo", "Pierna", "Muslo", "Pecho", "Espalda", "Costillas", "Cuello", "Mano", "Tobillo"] },
  { paso: 2, pregunta: "¿Qué tamaño aproximado tiene?", tipo: "chips", opciones: ["Moneda (~2 cm)", "Palma (~8 cm)", "Media mano (~12 cm)", "Medio brazo (~20 cm)", "Brazo completo (35+ cm)"] },
  { paso: 3, pregunta: "¿Qué estilo te interesa?", tipo: "chips", opciones: ["Realismo", "Blackwork", "Fine-line", "Japonés", "Geométrico", "Neotradicional", "Lettering", "Minimalista"] },
  { paso: 4, pregunta: "¿Color o blanco y negro? ¿Es un cover-up?", tipo: "toggles", opciones: ["A color", "Blanco y negro", "Es cover-up"] },
  { paso: 5, pregunta: "¿Tienes imágenes de referencia? (opcional)", tipo: "upload", opciones: [] },
];

function ChatbotModal({ onClose }: { onClose: () => void }) {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string | string[]>>({});
  const [toggles, setToggles] = useState<string[]>([]);
  const [resultado, setResultado] = useState(false);
  const pasoActual = CHATBOT_PASOS[paso];

  const seleccionar = (op: string) => {
    setRespuestas(p => ({ ...p, [pasoActual.paso]: op }));
    if (paso < CHATBOT_PASOS.length - 1) setTimeout(() => setPaso(p => p + 1), 260);
    else setTimeout(() => setResultado(true), 300);
  };

  const toggleOp = (op: string) => setToggles(p => p.includes(op) ? p.filter(x => x !== op) : [...p, op]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden border"
        style={{ backgroundColor: "#161616", borderColor: "rgba(255,255,255,0.08)", maxHeight: "92svh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)" }}>
              <Bot size={16} style={{ color: "#D4AF37" }} />
            </div>
            <div>
              <div className="text-sm font-semibold">Cotizador INKSPIRE</div>
              <div className="text-[11px]" style={{ color: "#A3A3A3" }}>Estimación sin esperar DMs</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
            <X size={14} style={{ color: "#A3A3A3" }} />
          </button>
        </div>

        {/* Progreso */}
        {!resultado && (
          <div className="px-6 pt-4">
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px]" style={{ color: "#A3A3A3" }}>Paso {paso + 1} de {CHATBOT_PASOS.length}</span>
              <span className="text-[10px] font-semibold" style={{ color: "#D4AF37" }}>{Math.round(((paso + 1) / CHATBOT_PASOS.length) * 100)}%</span>
            </div>
            <div className="h-1 rounded-full w-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((paso + 1) / CHATBOT_PASOS.length) * 100}%`, backgroundColor: "#D4AF37" }} />
            </div>
          </div>
        )}

        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: "62svh" }}>
          {!resultado ? (
            <>
              <div className="flex items-start gap-3 mb-5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.2)" }}>
                  <Bot size={13} style={{ color: "#D4AF37" }} />
                </div>
                <div className="rounded-2xl rounded-tl-none px-4 py-3 text-sm leading-relaxed" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#E5E5E5" }}>
                  {pasoActual.pregunta}
                </div>
              </div>

              {pasoActual.tipo === "chips" && (
                <div className="flex flex-wrap gap-2 ml-10">
                  {pasoActual.opciones.map(op => (
                    <button key={op} onClick={() => seleccionar(op)}
                      className="text-xs px-3.5 py-2 rounded-full border transition-all font-medium"
                      style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.10)", color: "#A3A3A3" }}
                      onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "rgba(212,175,55,0.45)"; b.style.color = "#fff"; }}
                      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "rgba(255,255,255,0.10)"; b.style.color = "#A3A3A3"; }}>
                      {op}
                    </button>
                  ))}
                </div>
              )}

              {pasoActual.tipo === "toggles" && (
                <div className="ml-10">
                  <div className="flex flex-wrap gap-2 mb-5">
                    {pasoActual.opciones.map(op => (
                      <button key={op} onClick={() => toggleOp(op)}
                        className="text-xs px-4 py-2 rounded-full border transition-all font-medium"
                        style={{ backgroundColor: toggles.includes(op) ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.04)", borderColor: toggles.includes(op) ? "rgba(212,175,55,0.45)" : "rgba(255,255,255,0.10)", color: toggles.includes(op) ? "#D4AF37" : "#A3A3A3" }}>
                        {op}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setRespuestas(p => ({ ...p, [pasoActual.paso]: toggles })); setTimeout(() => setResultado(true), 300); }}
                    className="text-sm font-semibold px-6 py-2.5 rounded-xl" style={{ backgroundColor: "#D4AF37", color: "#0D0D0D" }}>
                    Ver cotización <ArrowRight size={14} className="inline ml-1" />
                  </button>
                </div>
              )}

              {pasoActual.tipo === "upload" && (
                <div className="ml-10">
                  <div className="border-2 border-dashed rounded-xl p-6 text-center mb-4 cursor-pointer"
                    style={{ borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.02)" }}>
                    <Upload size={20} className="mx-auto mb-2" style={{ color: "#A3A3A3" }} />
                    <div className="text-xs" style={{ color: "#A3A3A3" }}>Arrastra imágenes de referencia (máx. 3 fotos, opcional)</div>
                  </div>
                  <button onClick={() => setResultado(true)}
                    className="text-sm font-semibold px-6 py-2.5 rounded-xl" style={{ backgroundColor: "#D4AF37", color: "#0D0D0D" }}>
                    Ver cotización <ArrowRight size={14} className="inline ml-1" />
                  </button>
                </div>
              )}

              {paso > 0 && (
                <button onClick={() => setPaso(p => p - 1)} className="flex items-center gap-1.5 mt-5 text-xs" style={{ color: "#A3A3A3" }}>
                  <ChevronLeft size={13} /> Paso anterior
                </button>
              )}
            </>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle size={18} style={{ color: "#4ade80" }} />
                <span className="text-sm font-semibold">¡Tu cotización está lista!</span>
              </div>
              <div className="rounded-2xl p-5 mb-4 border" style={{ backgroundColor: "rgba(212,175,55,0.06)", borderColor: "rgba(212,175,55,0.20)" }}>
                <div className="text-xs mb-1" style={{ color: "#A3A3A3" }}>Precio estimado</div>
                <div className="text-3xl font-bold" style={{ color: "#D4AF37" }}>$45.000 – $80.000</div>
                <div className="text-xs mt-1" style={{ color: "#A3A3A3" }}>Aprox. 2–3 horas de sesión</div>
              </div>
              <div className="flex flex-col gap-2 mb-5 text-xs" style={{ color: "#A3A3A3" }}>
                <div className="flex justify-between"><span>Tarifa por hora</span><span className="text-white font-medium">$25.000/hr</span></div>
                <div className="flex justify-between"><span>Depósito requerido (30%)</span><span className="text-white font-medium">$13.500 – $24.000</span></div>
                <div className="flex justify-between"><span>Política de cancelación</span><span className="text-white font-medium">48 horas</span></div>
              </div>
              <button className="w-full text-sm font-semibold py-3.5 rounded-xl mb-2.5" style={{ backgroundColor: "#D4AF37", color: "#0D0D0D" }}>
                Reservar ahora <ArrowRight size={14} className="inline ml-1" />
              </button>
              <button onClick={onClose} className="w-full text-sm py-2.5 rounded-xl border"
                style={{ borderColor: "rgba(255,255,255,0.08)", color: "#A3A3A3", backgroundColor: "transparent" }}>
                Seguir explorando
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VISTA: LISTADO DE ARTISTAS
// ══════════════════════════════════════════════════════════════════════════════

function VistaArtistas({ onVerPerfil, setChatbot, favoritos, onToggleFav }: {
  onVerPerfil: (a: Artista) => void;
  setChatbot: (v: boolean) => void;
  favoritos: number[];
  onToggleFav: (id: number) => void;
}) {
  const [modoVista, setModoVista] = useState<"grid" | "lista">("grid");
  const [sortBy, setSortBy] = useState("relevancia");
  const [filtros, setFiltros] = useState({
    estilos: [] as string[],
    precioMax: 110000,
    ratingMin: 0,
    soloVerificados: false,
    soloSanitario: false,
    soloPremiados: false,
    tipo: "" as "" | "independiente" | "estudio",
    comuna: "",
  });
  const [panelFiltros, setPanelFiltros] = useState(true);
  const [textoBusqueda, setTextoBusqueda] = useState("");

  const toggleEstilo = (e: string) =>
    setFiltros(f => ({ ...f, estilos: f.estilos.includes(e) ? f.estilos.filter(x => x !== e) : [...f.estilos, e] }));

  const resultados = useMemo(() => {
    let r = ARTISTAS.filter(a => {
      if (filtros.estilos.length > 0 && !filtros.estilos.some(e => a.estilos.includes(e))) return false;
      if (a.precioHora > filtros.precioMax) return false;
      if (a.rating < filtros.ratingMin) return false;
      if (filtros.soloVerificados && !a.verificado) return false;
      if (filtros.soloSanitario && !a.certificado) return false;
      if (filtros.soloPremiados && !a.premiado) return false;
      if (filtros.tipo && a.tipo !== filtros.tipo) return false;
      if (filtros.comuna && a.comuna !== filtros.comuna) return false;
      if (textoBusqueda && !a.nombre.toLowerCase().includes(textoBusqueda.toLowerCase()) && !a.estilos.some(e => e.toLowerCase().includes(textoBusqueda.toLowerCase()))) return false;
      return true;
    });
    if (sortBy === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    if (sortBy === "precioMenor") r = [...r].sort((a, b) => a.precioMin - b.precioMin);
    if (sortBy === "precioMayor") r = [...r].sort((a, b) => b.precioMax - a.precioMax);
    if (sortBy === "resenas") r = [...r].sort((a, b) => b.resenas - a.resenas);
    return r;
  }, [filtros, sortBy, textoBusqueda]);

  const limpiarFiltros = () => setFiltros({ estilos: [], precioMax: 110000, ratingMin: 0, soloVerificados: false, soloSanitario: false, soloPremiados: false, tipo: "", comuna: "" });

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "#0D0D0D" }}>
      {/* Barra superior */}
      <div className="sticky top-16 z-30 border-b" style={{ backgroundColor: "rgba(13,13,13,0.95)", backdropFilter: "blur(16px)", borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 flex items-center gap-3">
          {/* Búsqueda */}
          <label className="flex items-center gap-2.5 flex-1 rounded-xl px-4 py-2.5 border" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.07)" }}>
            <Search size={14} style={{ color: "#A3A3A3" }} />
            <input type="text" placeholder="Buscar por nombre, estilo..." value={textoBusqueda}
              onChange={e => setTextoBusqueda(e.target.value)}
              className="bg-transparent text-sm text-white outline-none w-full" style={{ caretColor: "#D4AF37" }} />
          </label>
          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="text-xs rounded-xl px-3.5 py-2.5 border appearance-none outline-none cursor-pointer"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.07)", color: "#A3A3A3" }}>
            <option value="relevancia">Relevancia</option>
            <option value="rating">Mejor calificados</option>
            <option value="precioMenor">Precio: menor</option>
            <option value="precioMayor">Precio: mayor</option>
            <option value="resenas">Más reseñas</option>
          </select>
          {/* Toggle vista */}
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {[{ v: "grid" as const, icon: LayoutGrid }, { v: "lista" as const, icon: List }].map(({ v, icon: Icon }) => (
              <button key={v} onClick={() => setModoVista(v)}
                className="px-3 py-2.5 transition-colors"
                style={{ backgroundColor: modoVista === v ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.03)", color: modoVista === v ? "#D4AF37" : "#A3A3A3" }}>
                <Icon size={15} />
              </button>
            ))}
          </div>
          {/* Toggle filtros */}
          <button onClick={() => setPanelFiltros(f => !f)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-colors"
            style={{ backgroundColor: panelFiltros ? "rgba(212,175,55,0.10)" : "rgba(255,255,255,0.04)", borderColor: panelFiltros ? "rgba(212,175,55,0.30)" : "rgba(255,255,255,0.07)", color: panelFiltros ? "#D4AF37" : "#A3A3A3" }}>
            <Filter size={13} /> Filtros
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 flex gap-7">
        {/* Panel filtros */}
        {panelFiltros && (
          <aside className="w-64 shrink-0 sticky top-36 self-start">
            <div className="rounded-2xl border p-5 flex flex-col gap-5" style={{ backgroundColor: "#161616", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Filtros</span>
                <button onClick={limpiarFiltros} className="text-xs transition-colors hover:text-white" style={{ color: "#A3A3A3" }}>Limpiar</button>
              </div>

              {/* Estilos */}
              <div>
                <div className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: "#A3A3A3" }}>Estilo</div>
                <div className="flex flex-wrap gap-1.5">
                  {ESTILOS_TATTOO.map(e => (
                    <button key={e} onClick={() => toggleEstilo(e)}
                      className="text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium"
                      style={{
                        backgroundColor: filtros.estilos.includes(e) ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.04)",
                        borderColor: filtros.estilos.includes(e) ? "rgba(212,175,55,0.40)" : "rgba(255,255,255,0.08)",
                        color: filtros.estilos.includes(e) ? "#D4AF37" : "#A3A3A3",
                      }}>{e}</button>
                  ))}
                </div>
              </div>

              {/* Precio */}
              <div>
                <div className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: "#A3A3A3" }}>Precio máx. por hora</div>
                <div className="text-sm font-semibold mb-2">{formatCLP(filtros.precioMax)}</div>
                <input type="range" min={20000} max={110000} step={5000}
                  value={filtros.precioMax} onChange={e => setFiltros(f => ({ ...f, precioMax: Number(e.target.value) }))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: "#D4AF37" }} />
                <div className="flex justify-between text-[10px] mt-1" style={{ color: "#A3A3A3" }}>
                  <span>$20.000</span><span>$110.000</span>
                </div>
              </div>

              {/* Rating */}
              <div>
                <div className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "#A3A3A3" }}>Calificación mínima</div>
                <div className="flex gap-1.5">
                  {[0, 3, 4, 4.5, 5].map(v => (
                    <button key={v} onClick={() => setFiltros(f => ({ ...f, ratingMin: v }))}
                      className="text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium"
                      style={{
                        backgroundColor: filtros.ratingMin === v ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.04)",
                        borderColor: filtros.ratingMin === v ? "rgba(212,175,55,0.40)" : "rgba(255,255,255,0.08)",
                        color: filtros.ratingMin === v ? "#D4AF37" : "#A3A3A3",
                      }}>{v === 0 ? "Todos" : `${v}+★`}</button>
                  ))}
                </div>
              </div>

              {/* Tipo */}
              <div>
                <div className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "#A3A3A3" }}>Tipo de artista</div>
                <div className="flex gap-2">
                  {[["", "Todos"], ["independiente", "Independiente"], ["estudio", "Estudio"]].map(([v, l]) => (
                    <button key={v} onClick={() => setFiltros(f => ({ ...f, tipo: v as any }))}
                      className="text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium"
                      style={{
                        backgroundColor: filtros.tipo === v ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.04)",
                        borderColor: filtros.tipo === v ? "rgba(212,175,55,0.40)" : "rgba(255,255,255,0.08)",
                        color: filtros.tipo === v ? "#D4AF37" : "#A3A3A3",
                      }}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Comuna */}
              <div>
                <div className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "#A3A3A3" }}>Comuna</div>
                <select value={filtros.comuna} onChange={e => setFiltros(f => ({ ...f, comuna: e.target.value }))}
                  className="w-full text-xs rounded-xl px-3 py-2 border appearance-none outline-none cursor-pointer"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.07)", color: "#A3A3A3" }}>
                  <option value="">Toda la RM</option>
                  {COMUNAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-2.5">
                {[
                  { key: "soloVerificados", label: "Solo verificados" },
                  { key: "soloSanitario", label: "Certificación sanitaria" },
                  { key: "soloPremiados", label: "Solo premiados" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs" style={{ color: "#A3A3A3" }}>{label}</span>
                    <button onClick={() => setFiltros(f => ({ ...f, [key]: !(f as any)[key] }))}
                      className="w-9 h-5 rounded-full relative transition-colors shrink-0"
                      style={{ backgroundColor: (filtros as any)[key] ? "#D4AF37" : "rgba(255,255,255,0.12)" }}>
                      <div className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all"
                        style={{ left: (filtros as any)[key] ? "calc(100% - 18px)" : "2px" }} />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Grid/Lista de artistas */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm" style={{ color: "#A3A3A3" }}>
              <span className="font-semibold text-white">{resultados.length}</span> artistas encontrados
            </p>
          </div>

          {resultados.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🔍</div>
              <div className="font-semibold mb-2">Sin resultados</div>
              <div className="text-sm" style={{ color: "#A3A3A3" }}>Intenta ajustar los filtros o ampliar la búsqueda.</div>
              <button onClick={limpiarFiltros} className="mt-4 text-sm font-semibold px-5 py-2 rounded-xl" style={{ backgroundColor: "#D4AF37", color: "#0D0D0D" }}>
                Limpiar filtros
              </button>
            </div>
          ) : modoVista === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {resultados.map(a => (
                <TarjetaArtista key={a.id} artista={a} modo="grid" onVerPerfil={() => onVerPerfil(a)} favoritos={favoritos} onToggleFav={onToggleFav} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {resultados.map(a => (
                <TarjetaArtista key={a.id} artista={a} modo="lista" onVerPerfil={() => onVerPerfil(a)} favoritos={favoritos} onToggleFav={onToggleFav} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VISTA: PERFIL DEL ARTISTA
// ══════════════════════════════════════════════════════════════════════════════

function VistaPerfilArtista({ artista, onVolver, setChatbot, favoritos, onToggleFav }: {
  artista: Artista; onVolver: () => void;
  setChatbot: (v: boolean) => void;
  favoritos: number[];
  onToggleFav: (id: number) => void;
}) {
  const [tabActivo, setTabActivo] = useState<"portafolio" | "resenas" | "info">("portafolio");
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);
  const [mesCalendario, setMesCalendario] = useState(new Date(2025, 5)); // junio 2025
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const [bookingStep, setBookingStep] = useState(0); // 0: idle, 1: fecha, 2: confirm

  // Días disponibles simulados
  const diasDisponibles = [3, 5, 6, 10, 11, 12, 17, 18, 19, 20, 24, 25, 26];
  const diasBloqueados = [1, 7, 8, 14, 15, 21, 22, 28, 29];

  const primerDia = new Date(mesCalendario.getFullYear(), mesCalendario.getMonth(), 1).getDay();
  const diasEnMes = new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() + 1, 0).getDate();
  const nombresMes = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const horarios = diaSeleccionado ? ["10:00", "12:00", "14:00", "16:00"] : [];
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);

  const ratingDims = [
    { label: "Higiene", valor: 4.9 },
    { label: "Manejo del dolor", valor: 4.6 },
    { label: "Trato al cliente", valor: 4.95 },
    { label: "Resultado final", valor: 4.98 },
  ];

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "#0D0D0D" }}>
      {/* Botón volver */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-6 pb-0">
        <button onClick={onVolver} className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: "#A3A3A3" }}>
          <ChevronLeft size={16} /> Volver a artistas
        </button>
      </div>

      {/* Hero del artista */}
      <section className="relative overflow-hidden" style={{ height: "380px" }}>
        <img src={artista.image} alt={artista.nombre}
          className="w-full h-full object-cover" style={{ opacity: 0.4 }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(13,13,13,0.3) 0%, rgba(13,13,13,1) 100%)" }} />
      </section>

      {/* Layout principal: contenido + booking card sticky */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 -mt-32 relative z-10">
        <div className="flex gap-8 items-start">
          {/* Columna izquierda */}
          <div className="flex-1 min-w-0">
            {/* Header del artista */}
            <div className="mb-8">
              <div className="flex items-end gap-5 mb-4">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 shrink-0" style={{ borderColor: "rgba(212,175,55,0.4)", backgroundColor: "#1E1E1E" }}>
                  <img src={artista.avatarImg} alt={artista.nombre} className="w-full h-full object-cover" />
                </div>
                <div className="mb-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-3xl font-bold tracking-tight">{artista.nombre}</h1>
                    {artista.verificado && <BadgeVerificado />}
                    {artista.certificado && <BadgeCertificado />}
                    {artista.premiado && <BadgePremiado />}
                    {artista.auspiciado && <BadgeAuspiciado />}
                  </div>
                  <div className="text-sm mb-2" style={{ color: "#A3A3A3" }}>
                    {artista.handle} · {artista.tipo === "independiente" ? "Tatuador independiente" : "Artista de estudio"}
                  </div>
                  <div className="flex items-center gap-4 flex-wrap text-xs" style={{ color: "#A3A3A3" }}>
                    <div className="flex items-center gap-1"><MapPin size={12} />{artista.direccion}</div>
                    <div className="flex items-center gap-1"><Clock size={12} />{artista.anosExp} años de exp.</div>
                  </div>
                </div>
              </div>

              {/* Rating + reseñas */}
              <div className="flex items-center gap-5 mb-4">
                <div className="flex items-center gap-2">
                  <Estrellas rating={artista.rating} size={16} />
                  <span className="text-lg font-bold">{artista.rating}</span>
                  <span className="text-sm" style={{ color: "#A3A3A3" }}>({artista.resenas} reseñas)</span>
                </div>
              </div>

              {/* Estilos */}
              <div className="flex flex-wrap gap-2">
                {artista.estilos.map(e => (
                  <span key={e} className="text-xs px-3.5 py-1.5 rounded-full border"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.09)", color: "#A3A3A3" }}>{e}</span>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {[
                { id: "portafolio", label: "Portafolio" },
                { id: "resenas", label: `Reseñas (${artista.resenas})` },
                { id: "info", label: "Info & tarifas" },
              ].map(t => (
                <button key={t.id} onClick={() => setTabActivo(t.id as any)}
                  className="px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px"
                  style={{
                    color: tabActivo === t.id ? "#D4AF37" : "#A3A3A3",
                    borderBottomColor: tabActivo === t.id ? "#D4AF37" : "transparent",
                  }}>{t.label}</button>
              ))}
            </div>

            {/* Portafolio */}
            {tabActivo === "portafolio" && (
              <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                {artista.galeria.map((img, i) => (
                  <div key={i} className="break-inside-avoid overflow-hidden rounded-xl cursor-pointer group"
                    onClick={() => setImagenAmpliada(unsplash(img, 800, 1000))}
                    style={{ backgroundColor: "#1E1E1E" }}>
                    <img src={unsplash(img, 400, i % 3 === 0 ? 520 : 320)}
                      alt={`Portafolio ${artista.nombre} — obra ${i + 1}`}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                ))}
              </div>
            )}

            {/* Reseñas */}
            {tabActivo === "resenas" && (
              <div>
                {/* Resumen de dimensiones */}
                <div className="rounded-2xl p-6 border mb-6" style={{ backgroundColor: "#161616", borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center gap-6 mb-4">
                    <div className="text-5xl font-black" style={{ color: "#D4AF37" }}>{artista.rating}</div>
                    <div>
                      <Estrellas rating={artista.rating} size={15} />
                      <div className="text-xs mt-1" style={{ color: "#A3A3A3" }}>{artista.resenas} reseñas verificadas</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {ratingDims.map(d => <BarraDimension key={d.label} label={d.label} valor={d.valor} />)}
                  </div>
                </div>

                {/* Lista de reseñas */}
                <div className="flex flex-col gap-4">
                  {RESENAS_PERFIL.map(r => (
                    <div key={r.id} className="rounded-2xl p-6 border" style={{ backgroundColor: "#161616", borderColor: "rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden" style={{ backgroundColor: "#1E1E1E" }}>
                          <img src={r.avatar} alt={r.nombre} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{r.nombre}</div>
                          <div className="text-xs" style={{ color: "#A3A3A3" }}>{r.comuna} · {r.fecha}</div>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          {r.fotoVerificada && (
                            <span className="text-[10px] font-semibold rounded-full px-2 py-0.5 border flex items-center gap-1"
                              style={{ color: "#4ade80", backgroundColor: "rgba(74,222,128,0.07)", borderColor: "rgba(74,222,128,0.18)" }}>
                              <CheckCircle size={9} /> Reseña completa
                            </span>
                          )}
                          <Estrellas rating={r.rating} size={12} />
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed mb-4" style={{ color: "#E5E5E5" }}>&ldquo;{r.comentario}&rdquo;</p>
                      <div className="flex flex-col gap-1.5 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                        <BarraDimension label="Higiene" valor={r.dimHigiene} />
                        <BarraDimension label="Manejo del dolor" valor={r.dimDolor} />
                        <BarraDimension label="Trato al cliente" valor={r.dimTrato} />
                        <BarraDimension label="Resultado final" valor={r.dimResultado} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info & tarifas */}
            {tabActivo === "info" && (
              <div className="flex flex-col gap-6">
                {/* Bio */}
                <div className="rounded-2xl p-6 border" style={{ backgroundColor: "#161616", borderColor: "rgba(255,255,255,0.07)" }}>
                  <EtiquetaDorada>Sobre mí</EtiquetaDorada>
                  <p className="text-sm leading-relaxed" style={{ color: "#E5E5E5" }}>{artista.bio}</p>
                </div>

                {/* Tarifas */}
                <div className="rounded-2xl p-6 border" style={{ backgroundColor: "#161616", borderColor: "rgba(255,255,255,0.07)" }}>
                  <EtiquetaDorada>Tarifas y políticas</EtiquetaDorada>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { l: "Precio mínimo por sesión", v: formatCLP(artista.precioMin) },
                      { l: "Precio por hora", v: formatCLP(artista.precioHora) },
                      { l: "Depósito requerido", v: `${artista.deposito}%` },
                      { l: "Política de cancelación", v: `${artista.cancelacion} antes` },
                    ].map(({ l, v }) => (
                      <div key={l} className="rounded-xl p-4 border" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
                        <div className="text-xs mb-1" style={{ color: "#A3A3A3" }}>{l}</div>
                        <div className="font-semibold text-sm">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificaciones */}
                {artista.certificaciones.length > 0 && (
                  <div className="rounded-2xl p-6 border" style={{ backgroundColor: "#161616", borderColor: "rgba(255,255,255,0.07)" }}>
                    <EtiquetaDorada>Certificaciones</EtiquetaDorada>
                    <div className="flex flex-col gap-3">
                      {artista.certificaciones.map((c, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5 px-4 rounded-xl border"
                          style={{ backgroundColor: "rgba(74,222,128,0.04)", borderColor: "rgba(74,222,128,0.15)" }}>
                          <div className="flex items-center gap-2">
                            <Shield size={14} style={{ color: "#4ade80" }} />
                            <div>
                              <div className="text-xs font-semibold">{c.tipo}</div>
                              <div className="text-[10px]" style={{ color: "#A3A3A3" }}>{c.emisor}</div>
                            </div>
                          </div>
                          <div className="text-[10px] font-semibold" style={{ color: "#4ade80" }}>Vigente hasta {c.vigencia}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Premios */}
                {artista.premios.length > 0 && (
                  <div className="rounded-2xl p-6 border" style={{ backgroundColor: "#161616", borderColor: "rgba(255,255,255,0.07)" }}>
                    <EtiquetaDorada>Premios y reconocimientos</EtiquetaDorada>
                    <div className="flex flex-col gap-3">
                      {artista.premios.map((p, i) => (
                        <div key={i} className="flex items-center gap-3 py-2.5 px-4 rounded-xl border"
                          style={{ backgroundColor: "rgba(251,191,36,0.04)", borderColor: "rgba(251,191,36,0.15)" }}>
                          <Award size={16} style={{ color: "#fbbf24" }} />
                          <div>
                            <div className="text-xs font-semibold">{p.categoria}</div>
                            <div className="text-[10px]" style={{ color: "#A3A3A3" }}>{p.evento} · {p.anio}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ubicación placeholder */}
                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="relative" style={{ height: "180px", backgroundColor: "#1E1E1E" }}>
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                      <MapPin size={28} style={{ color: "#D4AF37" }} />
                      <div className="text-sm font-semibold">{artista.direccion}</div>
                      <div className="text-xs" style={{ color: "#A3A3A3" }}>{artista.comuna}, Santiago</div>
                    </div>
                    <div className="absolute inset-0 opacity-10"
                      style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(212,175,55,0.6) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking card sticky */}
          <aside className="hidden lg:block w-80 shrink-0 sticky top-24 self-start">
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "#161616", borderColor: "rgba(255,255,255,0.09)" }}>
              {/* Precio destacado */}
              <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="text-xs mb-1" style={{ color: "#A3A3A3" }}>Desde</div>
                <div className="text-3xl font-bold mb-0.5">{formatCLP(artista.precioHora)}<span className="text-base font-normal" style={{ color: "#A3A3A3" }}>/hr</span></div>
                <div className="text-xs" style={{ color: "#A3A3A3" }}>Depósito: {artista.deposito}% al reservar</div>
              </div>

              {/* Calendario */}
              <div className="p-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold">{nombresMes[mesCalendario.getMonth()]} {mesCalendario.getFullYear()}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setMesCalendario(new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() - 1))}
                      className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                      <ChevronLeft size={13} style={{ color: "#A3A3A3" }} />
                    </button>
                    <button onClick={() => setMesCalendario(new Date(mesCalendario.getFullYear(), mesCalendario.getMonth() + 1))}
                      className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                      <ChevronRight size={13} style={{ color: "#A3A3A3" }} />
                    </button>
                  </div>
                </div>

                {/* Días semana */}
                <div className="grid grid-cols-7 mb-2">
                  {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"].map(d => (
                    <div key={d} className="text-center text-[10px] font-semibold py-1" style={{ color: "#A3A3A3" }}>{d}</div>
                  ))}
                </div>

                {/* Días */}
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: (primerDia === 0 ? 6 : primerDia - 1) }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: diasEnMes }).map((_, i) => {
                    const d = i + 1;
                    const disponible = diasDisponibles.includes(d);
                    const bloqueado = diasBloqueados.includes(d);
                    const seleccionado = diaSeleccionado === d;
                    return (
                      <button key={d} disabled={bloqueado || (!disponible && !seleccionado)}
                        onClick={() => { setDiaSeleccionado(d); setHoraSeleccionada(null); }}
                        className="aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all"
                        style={{
                          backgroundColor: seleccionado ? "#D4AF37" : disponible ? "rgba(212,175,55,0.10)" : "transparent",
                          color: seleccionado ? "#0D0D0D" : disponible ? "#D4AF37" : bloqueado ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.4)",
                          cursor: disponible || seleccionado ? "pointer" : "not-allowed",
                        }}>
                        {d}
                      </button>
                    );
                  })}
                </div>

                {/* Leyenda */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "rgba(212,175,55,0.20)" }} />
                    <span className="text-[10px]" style={{ color: "#A3A3A3" }}>Disponible</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#D4AF37" }} />
                    <span className="text-[10px]" style={{ color: "#A3A3A3" }}>Seleccionado</span>
                  </div>
                </div>
              </div>

              {/* Horarios */}
              {diaSeleccionado && (
                <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="text-xs font-semibold mb-3" style={{ color: "#A3A3A3" }}>Horarios disponibles</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {horarios.map(h => (
                      <button key={h} onClick={() => setHoraSeleccionada(h)}
                        className="text-xs py-2 rounded-lg font-medium transition-all"
                        style={{
                          backgroundColor: horaSeleccionada === h ? "#D4AF37" : "rgba(255,255,255,0.06)",
                          color: horaSeleccionada === h ? "#0D0D0D" : "#A3A3A3",
                        }}>{h}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="p-5 flex flex-col gap-3">
                <button onClick={() => setChatbot(true)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl border transition-all"
                  style={{ backgroundColor: "rgba(212,175,55,0.10)", borderColor: "rgba(212,175,55,0.30)", color: "#D4AF37" }}>
                  <Bot size={15} /> Cotizar con IA
                </button>
                <button
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3.5 rounded-xl transition-all hover:brightness-110"
                  style={{ backgroundColor: "#D4AF37", color: "#0D0D0D" }}>
                  <Calendar size={15} /> Reservar sesión
                </button>
                <button onClick={() => onToggleFav(artista.id)}
                  className="w-full flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl border transition-all"
                  style={{ backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.08)", color: "#A3A3A3" }}>
                  <Heart size={14} style={{ fill: favoritos.includes(artista.id) ? "#D4AF37" : "transparent", color: favoritos.includes(artista.id) ? "#D4AF37" : "#A3A3A3" }} />
                  {favoritos.includes(artista.id) ? "Guardado" : "Guardar artista"}
                </button>
              </div>

              {/* Política */}
              <div className="px-5 pb-5">
                <div className="text-[10px] text-center leading-relaxed" style={{ color: "#A3A3A3" }}>
                  Cancelación gratuita con {artista.cancelacion} de anticipación · Depósito protegido
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Lightbox */}
      {imagenAmpliada && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)" }}
          onClick={() => setImagenAmpliada(null)}>
          <button className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.10)" }}>
            <X size={18} />
          </button>
          <img src={imagenAmpliada} alt="Portafolio ampliado" className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Booking bar móvil */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t p-4"
        style={{ backgroundColor: "rgba(22,22,22,0.97)", backdropFilter: "blur(16px)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs" style={{ color: "#A3A3A3" }}>Desde</div>
            <div className="font-bold">{formatCLP(artista.precioHora)}/hr</div>
          </div>
          <button onClick={() => setChatbot(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl border"
            style={{ borderColor: "rgba(212,175,55,0.30)", color: "#D4AF37", backgroundColor: "rgba(212,175,55,0.08)" }}>
            <Bot size={13} /> Cotizar
          </button>
          <button className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl"
            style={{ backgroundColor: "#D4AF37", color: "#0D0D0D" }}>
            Reservar
          </button>
        </div>
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
      <div className="h-24 lg:hidden" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VISTA: HOME
// ══════════════════════════════════════════════════════════════════════════════

function VistaHome({ onVerArtistas, onVerPerfil, favoritos, onToggleFav, setChatbot }: {
  onVerArtistas: () => void;
  onVerPerfil: (a: Artista) => void;
  favoritos: number[];
  onToggleFav: (id: number) => void;
  setChatbot: (v: boolean) => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [estiloFiltro, setEstiloFiltro] = useState("");
  const [estiloActivo, setEstiloActivo] = useState("");
  const [comunaBusqueda, setComunaBusqueda] = useState("");
  const [estudioHover, setEstudioHover] = useState<number | null>(null);
  const carruselRef = useRef<HTMLDivElement>(null);
  const [emailNewsletter, setEmailNewsletter] = useState("");
  const [newsletterOk, setNewsletterOk] = useState(false);

  const scrollCarrusel = (dir: "izq" | "der") => {
    if (!carruselRef.current) return;
    carruselRef.current.scrollBy({ left: dir === "der" ? 640 : -640, behavior: "smooth" });
  };

  const ESTUDIOS = [
    { id: 1, nombre: "Dark Matter Studio", comuna: "Providencia", rating: 4.9, artistas: 8, image: "https://images.unsplash.com/photo-1775135981378-4e7c1767436d?w=640&h=420&fit=crop&auto=format", tag: "Top Estudio" },
    { id: 2, nombre: "Barrio Ink", comuna: "Barrio Italia", rating: 4.87, artistas: 12, image: "https://images.unsplash.com/photo-1760877611905-0f885a3ce551?w=640&h=420&fit=crop&auto=format", tag: "Establecido" },
    { id: 3, nombre: "Neon Temple", comuna: "Bellavista", rating: 4.94, artistas: 6, image: "https://images.unsplash.com/photo-1763888647744-c566e723c396?w=640&h=420&fit=crop&auto=format", tag: "En tendencia" },
    { id: 4, nombre: "Obsidian Arts", comuna: "Las Condes", rating: 4.96, artistas: 9, image: "https://images.unsplash.com/photo-1775567950587-f8440ec16499?w=640&h=420&fit=crop&auto=format", tag: "Premio 2024" },
  ];

  const RESENAS_HOME = [
    { id: 1, nombre: "Sofía A.", comuna: "Providencia", rating: 5, comentario: "Valentina transformó mi idea en algo que supera todo lo que imaginé. El realismo del retrato es increíble.", fecha: "Dic 2024", avatar: "https://images.unsplash.com/photo-1577357922830-eae2e1c7b4de?w=80&h=80&fit=crop&auto=format", estilo: "Realismo", dimHigiene: 5, dimDolor: 4, dimTrato: 5, dimResultado: 5, fotoVerificada: true },
    { id: 2, nombre: "Tomás M.", comuna: "Ñuñoa", rating: 5, comentario: "La plataforma me dio toda la confianza que necesitaba. Reseñas verificadas, depósito seguro. Matías es un crack.", fecha: "Nov 2024", avatar: "https://images.unsplash.com/photo-1671695157166-c4bbd8e6e94e?w=80&h=80&fit=crop&auto=format", estilo: "Blackwork", dimHigiene: 5, dimDolor: 4, dimTrato: 5, dimResultado: 5, fotoVerificada: true },
    { id: 3, nombre: "Javiera R.", comuna: "Las Condes", rating: 5, comentario: "Era mi primer tatuaje. El cotizador IA me dio el precio exacto antes de reservar. Sin sorpresas, sin esperar DMs.", fecha: "Ene 2025", avatar: "https://images.unsplash.com/photo-1687825495498-1bb4c92dbb19?w=80&h=80&fit=crop&auto=format", estilo: "Japonés", dimHigiene: 5, dimDolor: 5, dimTrato: 5, dimResultado: 5, fotoVerificada: false },
  ];

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ backgroundColor: "#0D0D0D" }}>
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden" style={{ minHeight: "100svh" }}>
        <div className="absolute inset-0" style={{ backgroundColor: "#0D0D0D" }}>
          <img src="https://images.unsplash.com/photo-1783973190331-53d4db4f697f?w=1800&h=1100&fit=crop&auto=format"
            alt="Tatuador trabajando en estudio con iluminación neón"
            className="w-full h-full object-cover" style={{ opacity: 0.32 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(13,13,13,0.6) 0%, transparent 35%, transparent 55%, rgba(13,13,13,1) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(13,13,13,0.5) 0%, transparent 40%, transparent 60%, rgba(13,13,13,0.5) 100%)" }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
          <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 mb-10 border"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", borderColor: "rgba(255,255,255,0.10)" }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#D4AF37" }} />
            <span className="text-xs tracking-wide" style={{ color: "#A3A3A3" }}>La plataforma de tatuajes más confiable de Chile</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-bold leading-[1.0] mb-6" style={{ letterSpacing: "-0.03em" }}>
            Encuentra al tatuador
            <br /><span style={{ color: "#D4AF37" }}>perfecto para ti.</span>
          </h1>

          <p className="text-base md:text-lg max-w-lg mx-auto mb-12 leading-relaxed" style={{ color: "#A3A3A3" }}>
            Portafolios verificados, precios transparentes y reserva directa. Sin esperar DMs, sin sorpresas.
          </p>

          <div className="rounded-2xl p-2 flex flex-col md:flex-row gap-2 max-w-3xl mx-auto border"
            style={{ backgroundColor: "rgba(22,22,22,0.88)", backdropFilter: "blur(24px)", borderColor: "rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}>
            <label className="flex items-center gap-3 flex-1 rounded-xl px-4 py-3 border cursor-text"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.07)" }}>
              <Search size={15} style={{ color: "#D4AF37", flexShrink: 0 }} />
              <input type="text" placeholder="Artista, estilo o nombre..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)}
                className="bg-transparent text-sm text-white outline-none w-full" style={{ caretColor: "#D4AF37" }} />
            </label>
            <label className="flex items-center gap-3 flex-1 rounded-xl px-4 py-3 border cursor-pointer"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.07)" }}>
              <Sparkles size={15} style={{ color: "#D4AF37", flexShrink: 0 }} />
              <select value={estiloFiltro} onChange={e => setEstiloFiltro(e.target.value)}
                className="bg-transparent text-sm text-white outline-none w-full appearance-none cursor-pointer">
                <option value="" style={{ backgroundColor: "#1E1E1E" }}>Cualquier estilo</option>
                {ESTILOS_TATTOO.map(s => <option key={s} value={s} style={{ backgroundColor: "#1E1E1E" }}>{s}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-3 rounded-xl px-4 py-3 border cursor-pointer min-w-[140px]"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.07)" }}>
              <MapPin size={15} style={{ color: "#D4AF37", flexShrink: 0 }} />
              <select value={comunaBusqueda} onChange={e => setComunaBusqueda(e.target.value)}
                className="bg-transparent text-sm text-white outline-none w-full appearance-none cursor-pointer">
                <option value="" style={{ backgroundColor: "#1E1E1E" }}>Toda la RM</option>
                {COMUNAS.map(c => <option key={c} value={c} style={{ backgroundColor: "#1E1E1E" }}>{c}</option>)}
              </select>
            </label>
            <button onClick={onVerArtistas}
              className="flex items-center justify-center gap-2 text-sm font-semibold px-7 py-3 rounded-xl transition-all hover:brightness-110 shrink-0"
              style={{ backgroundColor: "#D4AF37", color: "#0D0D0D" }}>
              <Search size={15} /> Buscar
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {["Cerca de mí", "Fine-line", "Blackwork", "Japonés", "Certificados", "Premiados"].map(tag => (
              <button key={tag} onClick={onVerArtistas}
                className="text-xs rounded-full px-3 py-1.5 border transition-all hover:text-white"
                style={{ color: "#A3A3A3", backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.07)" }}>
                {tag}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <button onClick={() => setChatbot(true)}
              className="inline-flex items-center gap-2.5 text-sm font-medium px-6 py-3 rounded-full border transition-all hover:brightness-110"
              style={{ backgroundColor: "rgba(212,175,55,0.10)", borderColor: "rgba(212,175,55,0.30)", color: "#D4AF37" }}>
              <Bot size={15} /> Cotiza en segundos con nuestro asistente IA <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-0 right-0 z-10 hidden sm:block">
          <div className="max-w-2xl mx-auto px-6 grid grid-cols-4 gap-4">
            {[{ v: "1.200+", l: "Artistas activos" }, { v: "34", l: "Comunas" }, { v: "85K+", l: "Sesiones" }, { v: "4.95★", l: "Calificación" }].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-xl font-bold">{s.v}</div>
                <div className="text-xs mt-0.5" style={{ color: "#A3A3A3" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-14 border-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: BadgeCheck, t: "Artistas verificados", d: "Identidad y portafolio revisados por nuestro equipo editorial." },
            { icon: Star, t: "Reseñas reales", d: "Solo clientes que completaron sesión pueden calificar." },
            { icon: Shield, t: "Certificación sanitaria", d: "Verificamos que cada artista cumple normativa MINSAL." },
            { icon: CheckCircle, t: "Depósito protegido", d: "Reembolso automático si el artista cancela." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex flex-col gap-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                style={{ backgroundColor: "rgba(212,175,55,0.08)", borderColor: "rgba(212,175,55,0.18)" }}>
                <Icon size={17} style={{ color: "#D4AF37" }} />
              </div>
              <div>
                <div className="font-semibold text-sm mb-1">{t}</div>
                <div className="text-xs leading-relaxed" style={{ color: "#A3A3A3" }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CARRUSEL ARTISTAS DESTACADOS ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <EtiquetaDorada>Artistas destacados</EtiquetaDorada>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ letterSpacing: "-0.02em" }}>Top en Santiago</h2>
              <p className="text-sm mt-2" style={{ color: "#A3A3A3" }}>Seleccionados por portafolio, calificación y disponibilidad</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Flechas desktop */}
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => scrollCarrusel("izq")}
                  className="w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:border-white/20"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.10)" }}>
                  <ChevronLeft size={16} style={{ color: "#A3A3A3" }} />
                </button>
                <button onClick={() => scrollCarrusel("der")}
                  className="w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:border-white/20"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.10)" }}>
                  <ChevronRight size={16} style={{ color: "#A3A3A3" }} />
                </button>
              </div>
              <button onClick={onVerArtistas}
                className="hidden md:flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-white"
                style={{ color: "#A3A3A3" }}>
                Ver todos <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Carrusel */}
          <div
            ref={carruselRef}
            className="flex gap-5 overflow-x-auto -mx-6 px-6 lg:-mx-10 lg:px-10 pb-4"
            style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}
          >
            {ARTISTAS.map(a => (
              <div
                key={a.id}
                onClick={() => onVerPerfil(a)}
                className="group shrink-0 rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300"
                style={{
                  width: "240px",
                  scrollSnapAlign: "start",
                  backgroundColor: "#161616",
                  borderColor: "rgba(255,255,255,0.07)",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(255,255,255,0.14)"; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 20px 60px rgba(0,0,0,0.55)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(255,255,255,0.07)"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
              >
                {/* Foto */}
                <div className="relative overflow-hidden" style={{ height: "300px", backgroundColor: "#1E1E1E" }}>
                  <img
                    src={a.image}
                    alt={`Portafolio de ${a.nombre}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106"
                    style={{ transform: "scale(1)" }}
                  />
                  {/* Gradiente inferior */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(22,22,22,1) 0%, rgba(22,22,22,0.0) 45%)" }} />
                  {/* Badges sobre la foto */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {a.certificado && <BadgeCertificado />}
                    {a.premiado && <BadgePremiado />}
                  </div>
                  {/* Favorito */}
                  <button
                    onClick={e => { e.stopPropagation(); onToggleFav(a.id); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border transition-all"
                    style={{ backgroundColor: "rgba(0,0,0,0.50)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.10)" }}
                    aria-label="Guardar artista"
                  >
                    <Heart size={13} style={{ color: favoritos.includes(a.id) ? "#D4AF37" : "#fff", fill: favoritos.includes(a.id) ? "#D4AF37" : "transparent" }} />
                  </button>
                  {/* Info superpuesta al fondo */}
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="font-semibold text-[15px] leading-tight">{a.nombre}</span>
                      {a.verificado && <BadgeCheck size={13} style={{ color: "#D4AF37", flexShrink: 0 }} />}
                    </div>
                    <div className="text-[11px]" style={{ color: "#A3A3A3" }}>{a.handle}</div>
                  </div>
                </div>

                {/* Cuerpo de la card */}
                <div className="px-4 pt-3 pb-4">
                  {/* Rating */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <Estrellas rating={a.rating} size={12} />
                    <span className="text-xs font-bold">{a.rating}</span>
                    <span className="text-[10px]" style={{ color: "#A3A3A3" }}>({a.resenas})</span>
                  </div>

                  {/* Estilos */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {a.estilos.slice(0, 2).map(s => (
                      <span key={s} className="text-[10px] rounded-full px-2.5 py-0.5 border"
                        style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "#A3A3A3" }}>
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Ubicación + precio */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: "#A3A3A3" }}>
                      <MapPin size={10} />{a.comuna}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: "#D4AF37" }}>
                      {formatCLP(a.precioMin)}/hr
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Card CTA al final del carrusel */}
            <div
              onClick={onVerArtistas}
              className="shrink-0 rounded-2xl border cursor-pointer flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:border-white/20"
              style={{ width: "200px", scrollSnapAlign: "start", backgroundColor: "#161616", borderColor: "rgba(255,255,255,0.07)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center border"
                style={{ backgroundColor: "rgba(212,175,55,0.10)", borderColor: "rgba(212,175,55,0.25)" }}>
                <ChevronRight size={20} style={{ color: "#D4AF37" }} />
              </div>
              <div className="text-center px-4">
                <div className="text-sm font-semibold mb-1">Ver todos los artistas</div>
                <div className="text-[11px]" style={{ color: "#A3A3A3" }}>+1.200 artistas en Santiago</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estilos */}
      <section className="py-24 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <EtiquetaDorada>Explora</EtiquetaDorada>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ letterSpacing: "-0.02em" }}>Estilos populares</h2>
            <p className="text-sm mt-2 max-w-sm mx-auto" style={{ color: "#A3A3A3" }}>Encuentra artistas especializados en el estilo que siempre quisiste</p>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-6 xl:grid-cols-12" style={{ scrollbarWidth: "none" }}>
            {ESTILOS_TATTOO.map(nombre => (
              <button key={nombre} onClick={() => { setEstiloActivo(nombre === estiloActivo ? "" : nombre); onVerArtistas(); }}
                className="group flex flex-col items-center gap-3 shrink-0">
                <div className="w-20 h-20 md:w-[84px] md:h-[84px] rounded-full overflow-hidden border-2 transition-all duration-300"
                  style={{ backgroundColor: "#1E1E1E", borderColor: estiloActivo === nombre ? "#D4AF37" : "rgba(255,255,255,0.07)", boxShadow: estiloActivo === nombre ? "0 0 22px rgba(212,175,55,0.22)" : "none" }}>
                  <img src={unsplash(ESTILOS_IMG[nombre], 200, 200)} alt={nombre}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <span className="text-[11px] font-medium whitespace-nowrap transition-colors"
                  style={{ color: estiloActivo === nombre ? "#D4AF37" : "#A3A3A3" }}>{nombre}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── BANNER 1: Tu próxima historia ── */}
      <section className="py-8 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div
            className="relative rounded-3xl overflow-hidden flex flex-col md:flex-row items-stretch"
            style={{ backgroundColor: "#161616", minHeight: "340px" }}
          >
            {/* Texto izquierda */}
            <div className="relative z-10 flex flex-col justify-center px-10 py-14 md:w-[54%]">
              {/* Brillo gold ambiental */}
              <div className="absolute pointer-events-none -left-20 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)" }} />
              <EtiquetaDorada>Miles de clientes satisfechos</EtiquetaDorada>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4"
                style={{ letterSpacing: "-0.025em" }}
              >
                Tu próxima historia
                <br />
                <span style={{ color: "#D4AF37" }}>comienza aquí.</span>
              </h2>
              <p className="text-sm md:text-base leading-relaxed mb-8 max-w-sm" style={{ color: "#A3A3A3" }}>
                Miles de personas ya encontraron al artista perfecto en INKSPIRE. ¿Qué esperas para encontrar el tuyo?
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={onVerArtistas}
                  className="flex items-center gap-2 text-sm font-semibold px-7 py-3.5 rounded-xl transition-all hover:brightness-110"
                  style={{ backgroundColor: "#D4AF37", color: "#0D0D0D" }}
                >
                  Explorar artistas <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => setChatbot(true)}
                  className="flex items-center gap-2 text-sm font-semibold px-5 py-3.5 rounded-xl border transition-all"
                  style={{ borderColor: "rgba(255,255,255,0.12)", color: "#A3A3A3", backgroundColor: "transparent" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#A3A3A3"; }}
                >
                  <Bot size={14} /> Cotizar gratis
                </button>
              </div>
              {/* Mini stats */}
              <div className="flex items-center gap-6 mt-8 pt-6 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                {[
                  { v: "1.200+", l: "Artistas" },
                  { v: "4.95★", l: "Calificación" },
                  { v: "50K+", l: "Clientes" },
                ].map(s => (
                  <div key={s.l}>
                    <div className="text-lg font-bold">{s.v}</div>
                    <div className="text-[10px]" style={{ color: "#A3A3A3" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Imagen derecha — ocupa el 46% */}
            <div className="relative md:w-[46%] h-64 md:h-auto overflow-hidden" style={{ backgroundColor: "#1E1E1E" }}>
              <img
                src="https://images.unsplash.com/photo-1775135981378-4e7c1767436d?w=800&h=700&fit=crop&auto=format"
                alt="Estudio de tatuajes con ambiente oscuro y profesional"
                className="w-full h-full object-cover"
                style={{ opacity: 0.75 }}
              />
              {/* Gradiente de fusión hacia la izquierda */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to right, #161616 0%, transparent 40%)" }}
              />
              {/* Gradiente superior/inferior móvil */}
              <div
                className="absolute inset-0 md:hidden"
                style={{ background: "linear-gradient(to top, #161616 0%, transparent 50%)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Estudios */}
      <section className="py-24 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <EtiquetaDorada>Estudios</EtiquetaDorada>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ letterSpacing: "-0.02em" }}>Estudios seleccionados</h2>
              <p className="text-sm mt-2" style={{ color: "#A3A3A3" }}>Espacios premium con múltiples artistas verificados</p>
            </div>
            <button className="hidden md:flex items-center gap-1.5 text-sm hover:text-white" style={{ color: "#A3A3A3" }}>Ver todos <ChevronRight size={15} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ESTUDIOS.map(e => (
              <div key={e.id} className="relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300"
                style={{ backgroundColor: "#161616", borderColor: estudioHover === e.id ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.07)", transform: estudioHover === e.id ? "translateY(-3px)" : "translateY(0)", boxShadow: estudioHover === e.id ? "0 20px 50px rgba(0,0,0,0.5)" : "none" }}
                onMouseEnter={() => setEstudioHover(e.id)} onMouseLeave={() => setEstudioHover(null)}>
                <div className="relative overflow-hidden" style={{ height: "200px", backgroundColor: "#1E1E1E" }}>
                  <img src={e.image} alt={e.nombre} className="w-full h-full object-cover transition-transform duration-700"
                    style={{ transform: estudioHover === e.id ? "scale(1.08)" : "scale(1)" }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #161616 0%, transparent 60%)" }} />
                  <div className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#D4AF37", color: "#0D0D0D" }}>{e.tag}</div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-[15px] mb-2">{e.nombre}</h3>
                  <div className="flex items-center gap-3 text-xs" style={{ color: "#A3A3A3" }}>
                    <div className="flex items-center gap-1"><Star size={11} style={{ fill: "#D4AF37", color: "#D4AF37" }} /><span className="font-medium text-white">{e.rating}</span></div>
                    <span>·</span>
                    <div className="flex items-center gap-1"><MapPin size={11} />{e.comuna}</div>
                  </div>
                  <div className="text-xs mt-2" style={{ color: "#A3A3A3" }}>{e.artistas} artistas</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-24 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <EtiquetaDorada>Simple y seguro</EtiquetaDorada>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ letterSpacing: "-0.02em" }}>Así funciona INKSPIRE</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", icon: Search, t: "Descubre y cotiza", d: "Filtra por estilo, comuna y precio. Usa el cotizador IA para una estimación instantánea sin esperar DMs." },
              { n: "02", icon: Calendar, t: "Reserva con confianza", d: "Elige el horario disponible y paga el depósito de forma segura. Tu dinero está protegido." },
              { n: "03", icon: Star, t: "Vive la experiencia", d: "Asiste a tu sesión y califica en 4 dimensiones. A los 90 días, sube la foto de curación." },
            ].map(({ n, icon: Icon, t, d }) => (
              <div key={n} className="relative rounded-2xl p-8 border" style={{ backgroundColor: "#161616", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="text-5xl font-black mb-6" style={{ color: "rgba(212,175,55,0.12)", lineHeight: 1 }}>{n}</div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center border mb-5"
                  style={{ backgroundColor: "rgba(212,175,55,0.08)", borderColor: "rgba(212,175,55,0.18)" }}>
                  <Icon size={18} style={{ color: "#D4AF37" }} />
                </div>
                <h3 className="text-lg font-semibold mb-3">{t}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#A3A3A3" }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reseñas */}
      <section className="py-24 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-14">
            <EtiquetaDorada>Comunidad</EtiquetaDorada>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ letterSpacing: "-0.02em" }}>Lo que dice nuestra comunidad</h2>
            <p className="text-sm mt-2" style={{ color: "#A3A3A3" }}>Reseñas verificadas post-sesión en 4 dimensiones</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {RESENAS_HOME.map(r => (
              <div key={r.id} className="flex flex-col gap-5 rounded-2xl p-7 border transition-all duration-300"
                style={{ backgroundColor: "#161616", borderColor: "rgba(255,255,255,0.07)" }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.11)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)"}>
                <Estrellas rating={r.rating} size={14} />
                <p className="text-sm leading-relaxed flex-1" style={{ color: "#E5E5E5" }}>&ldquo;{r.comentario}&rdquo;</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold rounded-full px-3 py-1 border"
                    style={{ color: "#D4AF37", backgroundColor: "rgba(212,175,55,0.08)", borderColor: "rgba(212,175,55,0.20)" }}>{r.estilo}</span>
                  {r.fotoVerificada && <span className="text-[10px] font-semibold rounded-full px-2.5 py-1 border flex items-center gap-1"
                    style={{ color: "#4ade80", backgroundColor: "rgba(74,222,128,0.07)", borderColor: "rgba(74,222,128,0.18)" }}><CheckCircle size={9} /> Reseña completa</span>}
                </div>
                <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="w-10 h-10 rounded-full overflow-hidden" style={{ backgroundColor: "#1E1E1E" }}>
                    <img src={r.avatar} alt={r.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{r.nombre}</div>
                    <div className="text-xs" style={{ color: "#A3A3A3" }}>{r.comuna} · {r.fecha}</div>
                  </div>
                  <BadgeCheck size={15} className="ml-auto" style={{ color: "#D4AF37" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BANNER 2: Newsletter ── */}
      <section className="py-8 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{ backgroundColor: "#0D0D0D", minHeight: "280px" }}
          >
            {/* Foto de fondo */}
            <img
              src="https://images.unsplash.com/photo-1783973190331-53d4db4f697f?w=1400&h=500&fit=crop&auto=format"
              alt="Artista tatuando en estudio con neón"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.22 }}
            />
            {/* Overlay gradiente */}
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to right, rgba(13,13,13,0.95) 0%, rgba(13,13,13,0.7) 55%, rgba(13,13,13,0.92) 100%)" }} />
            {/* Patrón de puntos sutil */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(212,175,55,0.05) 1px, transparent 0)", backgroundSize: "28px 28px" }} />

            {/* Contenido */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-10 py-14">
              <div className="text-center md:text-left max-w-lg">
                <EtiquetaDorada>Inspírate cada semana</EtiquetaDorada>
                <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ letterSpacing: "-0.02em" }}>
                  Lo mejor del tatuaje
                  <span style={{ color: "#D4AF37" }}> en tu correo.</span>
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "#A3A3A3" }}>
                  Recibe diseños exclusivos, guías de cuidado, artistas destacados de la semana y ofertas especiales directamente en tu bandeja de entrada.
                </p>
              </div>

              {/* Formulario */}
              <div className="w-full md:w-auto md:min-w-[360px]">
                {!newsletterOk ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      placeholder="tu@correo.cl"
                      value={emailNewsletter}
                      onChange={e => setEmailNewsletter(e.target.value)}
                      className="flex-1 text-sm px-5 py-3.5 rounded-xl outline-none text-white"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        caretColor: "#D4AF37",
                      }}
                    />
                    <button
                      onClick={() => { if (emailNewsletter.includes("@")) setNewsletterOk(true); }}
                      className="text-sm font-semibold px-6 py-3.5 rounded-xl whitespace-nowrap transition-all hover:brightness-110"
                      style={{ backgroundColor: "#D4AF37", color: "#0D0D0D" }}
                    >
                      Suscribirme
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl px-6 py-4 border"
                    style={{ backgroundColor: "rgba(74,222,128,0.07)", borderColor: "rgba(74,222,128,0.20)" }}>
                    <CheckCircle size={18} style={{ color: "#4ade80" }} />
                    <div>
                      <div className="text-sm font-semibold text-white">¡Listo! Ya estás suscrito.</div>
                      <div className="text-xs" style={{ color: "#A3A3A3" }}>Recibirás contenido exclusivo cada semana.</div>
                    </div>
                  </div>
                )}
                <p className="text-[10px] mt-2.5 text-center sm:text-left" style={{ color: "rgba(163,163,163,0.6)" }}>
                  Sin spam. Te puedes desuscribir en cualquier momento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="relative rounded-3xl px-8 py-24 md:py-32 text-center overflow-hidden border"
            style={{ backgroundColor: "#161616", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="absolute pointer-events-none" style={{ top: "-100px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(212,175,55,0.09) 0%, transparent 70%)", borderRadius: "50%" }} />
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
            <div className="relative">
              <EtiquetaDorada>Empieza hoy</EtiquetaDorada>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-5" style={{ letterSpacing: "-0.03em" }}>
                Tu próximo tatuaje<br /><span style={{ color: "#D4AF37" }}>empieza aquí.</span>
              </h2>
              <p className="text-base max-w-md mx-auto mb-10" style={{ color: "#A3A3A3" }}>
                Únete a más de 50.000 clientes que encontraron a su artista ideal en INKSPIRE. Sin DMs, sin sorpresas.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={onVerArtistas}
                  className="flex items-center justify-center gap-2 text-sm font-semibold px-8 py-3.5 rounded-xl transition-all hover:brightness-110"
                  style={{ backgroundColor: "#D4AF37", color: "#0D0D0D" }}>
                  Encontrar artistas <ArrowRight size={15} />
                </button>
                <button className="flex items-center justify-center gap-2 text-sm font-semibold px-8 py-3.5 rounded-xl border transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.10)", color: "#A3A3A3" }}
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "#fff"; b.style.backgroundColor = "rgba(255,255,255,0.09)"; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = "#A3A3A3"; b.style.backgroundColor = "rgba(255,255,255,0.05)"; }}>
                  Registrar mi estudio
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#D4AF37" }}>
                  <Sparkles size={12} style={{ color: "#0D0D0D" }} />
                </div>
                <span className="font-bold tracking-tight text-[15px]">INKSPIRE</span>
              </div>
              <p className="text-xs leading-relaxed max-w-[180px]" style={{ color: "#A3A3A3" }}>El marketplace de tatuajes más confiable de Chile. Santiago, 2025.</p>
            </div>
            {[
              { t: "Plataforma", l: ["Explorar artistas", "Ver estudios", "Mapa interactivo", "Estilos"] },
              { t: "Artistas", l: ["Registrar mi perfil", "Panel de artista", "Guía de precios", "Certificaciones"] },
              { t: "Empresa", l: ["Nosotros", "Blog", "Trabaja con nosotros", "Prensa"] },
              { t: "Ayuda", l: ["Centro de ayuda", "¿Cómo funciona?", "Privacidad", "Términos"] },
            ].map(col => (
              <div key={col.t}>
                <div className="text-[11px] font-semibold mb-4 tracking-wider uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>{col.t}</div>
                <div className="flex flex-col gap-2.5">
                  {col.l.map(link => <button key={link} className="text-xs text-left hover:text-white transition-colors" style={{ color: "#A3A3A3" }}>{link}</button>)}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="text-xs" style={{ color: "#A3A3A3" }}>© 2025 INKSPIRE SpA · Santiago, Chile · Todos los derechos reservados.</div>
            <div className="flex items-center gap-5">
              {["Privacidad", "Términos", "Cookies"].map(item => <button key={item} className="text-xs hover:text-white transition-colors" style={{ color: "#A3A3A3" }}>{item}</button>)}
            </div>
          </div>
        </div>
      </footer>

      <div className="h-20 md:hidden" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// APP PRINCIPAL — Enrutamiento por estado
// ══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [vista, setVista] = useState<Vista>("home");
  const [artistaActivo, setArtistaActivo] = useState<Artista | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [navMobilAbierto, setNavMobilAbierto] = useState(false);
  const [navActivo, setNavActivo] = useState("inicio");
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [chatbotAbierto, setChatbotAbierto] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [vista]);

  const irArtistas = () => { setVista("artistas"); setNavActivo("buscar"); };
  const irPerfil = (a: Artista) => { setArtistaActivo(a); setVista("perfil"); };
  const irHome = () => { setVista("home"); setNavActivo("inicio"); };
  const toggleFav = (id: number) => setFavoritos(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#0D0D0D", fontFamily: "'Inter', 'Geist', system-ui, sans-serif" }}>
      {/* ── NAV GLOBAL ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrolled ? "rgba(13,13,13,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <button onClick={irHome} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#D4AF37" }}>
              <Sparkles size={14} style={{ color: "#0D0D0D" }} />
            </div>
            <span className="font-bold text-[17px] tracking-tight">INKSPIRE</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {[["Vitrina", "home"], ["Artistas", "artistas"], ["Mapa", "mapa"], ["Estilos", "artistas"]].map(([label, v]) => (
              <button key={label} onClick={() => v === "home" ? irHome() : v === "artistas" ? irArtistas() : null}
                className="text-sm font-medium transition-colors hover:text-white"
                style={{ color: vista === v ? "#D4AF37" : "#A3A3A3" }}>{label}</button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="text-sm font-medium px-4 py-2 transition-colors hover:text-white" style={{ color: "#A3A3A3" }}>Ingresar</button>
            <button className="text-sm font-semibold px-5 py-2 rounded-full transition-all hover:brightness-110" style={{ backgroundColor: "#D4AF37", color: "#0D0D0D" }}>Registrarse</button>
          </div>

          <button className="md:hidden p-1" style={{ color: "#A3A3A3" }} onClick={() => setNavMobilAbierto(!navMobilAbierto)}>
            {navMobilAbierto ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {navMobilAbierto && (
          <div className="md:hidden px-6 py-5 flex flex-col gap-4 border-t" style={{ backgroundColor: "#161616", borderColor: "rgba(255,255,255,0.06)" }}>
            <button className="text-left text-sm" style={{ color: "#A3A3A3" }} onClick={() => { irHome(); setNavMobilAbierto(false); }}>Vitrina</button>
            <button className="text-left text-sm" style={{ color: "#A3A3A3" }} onClick={() => { irArtistas(); setNavMobilAbierto(false); }}>Artistas</button>
            <button className="mt-2 text-sm font-semibold py-3 rounded-full" style={{ backgroundColor: "#D4AF37", color: "#0D0D0D" }} onClick={() => setNavMobilAbierto(false)}>Registrarse gratis</button>
          </div>
        )}
      </nav>

      {/* ── CONTENIDO POR VISTA ── */}
      {vista === "home" && (
        <VistaHome onVerArtistas={irArtistas} onVerPerfil={irPerfil} favoritos={favoritos} onToggleFav={toggleFav} setChatbot={setChatbotAbierto} />
      )}
      {vista === "artistas" && (
        <VistaArtistas onVerPerfil={irPerfil} setChatbot={setChatbotAbierto} favoritos={favoritos} onToggleFav={toggleFav} />
      )}
      {vista === "perfil" && artistaActivo && (
        <VistaPerfilArtista artista={artistaActivo} onVolver={irArtistas} setChatbot={setChatbotAbierto} favoritos={favoritos} onToggleFav={toggleFav} />
      )}

      {/* ── NAV MÓVIL INFERIOR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t"
        style={{ backgroundColor: "rgba(22,22,22,0.96)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-stretch justify-around">
          {[
            { id: "inicio", icon: Home, label: "Inicio", action: irHome },
            { id: "buscar", icon: Search, label: "Buscar", action: irArtistas },
            { id: "mapa", icon: Map, label: "Mapa", action: () => {} },
            { id: "cuenta", icon: User, label: "Mi cuenta", action: () => {} },
          ].map(({ id, icon: Icon, label, action }) => (
            <button key={id} onClick={() => { setNavActivo(id); action(); }}
              className="flex flex-col items-center justify-center gap-1 py-3 px-2 flex-1 transition-all"
              style={{ color: navActivo === id ? "#D4AF37" : "#A3A3A3" }}>
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>

      {/* ── BOTÓN FLOTANTE COTIZADOR (móvil) ── */}
      {vista !== "perfil" && (
        <button onClick={() => setChatbotAbierto(true)}
          className="fixed bottom-24 right-5 z-40 md:hidden flex items-center gap-2 text-xs font-semibold px-4 py-3 rounded-2xl shadow-lg transition-all hover:brightness-110"
          style={{ backgroundColor: "#D4AF37", color: "#0D0D0D", boxShadow: "0 8px 32px rgba(212,175,55,0.30)" }}>
          <Bot size={16} /> Cotizar
        </button>
      )}

      {/* ── CHATBOT MODAL ── */}
      {chatbotAbierto && <ChatbotModal onClose={() => setChatbotAbierto(false)} />}
    </div>
  );
}
