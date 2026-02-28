export default function SimulateLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-3 h-16 animate-pulse bg-muted/30" />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Cargando simulación...</div>
      </div>
    </div>
  );
}
