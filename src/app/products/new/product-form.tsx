"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createProductAction,
  type CreateProductFormState,
} from "@/app/products/new/actions";

const initialState: CreateProductFormState = {};

function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: "text" | "number";
}) {
  return (
    <label className="block text-sm font-medium text-stone-800">
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-950"
      />
    </label>
  );
}

export function ProductForm({
  suppliers,
}: {
  suppliers: Array<{ id: string; commercialName: string }>;
}) {
  const [state, formAction] = useActionState(createProductAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <label className="block text-sm font-medium text-stone-800">
          Proveedor principal
          <select
            name="supplierId"
            className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-950"
            required
          >
            <option value="">Selecciona un proveedor activo</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.commercialName}
              </option>
            ))}
          </select>
        </label>
        <Field label="SKU" name="sku" placeholder="SKU-001" />
        <Field label="SKU proveedor" name="supplierSku" placeholder="SUP-7781" />
        <Field label="Nombre" name="name" placeholder="Filtro hidráulico" />
        <Field label="Marca" name="brand" placeholder="Atlas" />
        <Field label="Categoría" name="category" placeholder="Repuestos" />
        <Field label="Presentación" name="presentation" placeholder="Caja de 10" />
        <Field label="Unidad" name="unit" placeholder="unidad" />
        <Field label="Precio base" name="basePrice" type="number" placeholder="250" />
        <Field label="Costo estimado" name="estimatedCost" type="number" placeholder="170" />
        <Field label="Lead time (días)" name="leadTimeDays" type="number" placeholder="30" />
        <Field label="Cantidad mínima" name="minimumOrderQuantity" type="number" placeholder="1" />
        <label className="block text-sm font-medium text-stone-800">
          Estado
          <select
            name="status"
            defaultValue="ACTIVE"
            className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-950"
          >
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
          </select>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/products"
          className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          Guardar producto
        </button>
      </div>
    </form>
  );
}