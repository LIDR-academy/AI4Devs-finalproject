export function ReadyForDeliveryBanner() {
  return (
    <div
      role="status"
      className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900"
    >
      <p className="font-medium">
        Lista para entrega — todas las tareas están completadas.
      </p>
    </div>
  );
}
