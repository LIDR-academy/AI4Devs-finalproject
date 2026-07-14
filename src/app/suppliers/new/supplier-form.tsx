"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createSupplierAction,
  type CreateSupplierFormState,
} from "@/app/suppliers/new/actions";

const initialState: CreateSupplierFormState = {};

const supplierTypeOptions = [
  { value: "MANUFACTURER", label: "Fabricante" },
  { value: "PRODUCER", label: "Productor" },
  { value: "EXPORTER", label: "Exportador" },
  { value: "DISTRIBUTOR", label: "Distribuidor" },
  { value: "OTHER", label: "Otro" },
] as const;

const statusOptions = [
  { value: "UNDER_REVIEW", label: "En evaluación" },
  { value: "ACTIVE", label: "Activo" },
  { value: "PROSPECT", label: "Prospecto" },
  { value: "INACTIVE", label: "Inactivo" },
  { value: "BLOCKED", label: "Bloqueado" },
] as const;

function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: "text" | "email" | "number";
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

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <label className="block text-sm font-medium text-stone-800">
      {label}
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-950"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SupplierForm() {
  const [state, formAction] = useActionState(createSupplierAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Nombre comercial" name="commercialName" placeholder="Ocean Parts" />
        <Field label="Razón social" name="legalName" placeholder="Ocean Parts Ltd." />
        <SelectField label="Tipo de proveedor" name="supplierType" defaultValue="OTHER" options={supplierTypeOptions} />
        <SelectField label="Estado" name="status" defaultValue="UNDER_REVIEW" options={statusOptions} />
        <Field label="País" name="country" placeholder="China" />
        <Field label="Ciudad" name="city" placeholder="Shenzhen" />
        <Field label="Email" name="email" type="email" placeholder="sales@supplier.com" />
        <Field label="Teléfono" name="phone" placeholder="+86 755 5555 5555" />
        <Field label="Condiciones de pago" name="paymentTerms" placeholder="50% anticipado / 50% embarque" />
        <Field label="Moneda" name="currency" placeholder="USD" />
        <Field label="Incoterm" name="incoterm" placeholder="FOB" />
        <Field label="Lead time promedio (días)" name="averageLeadTimeDays" type="number" placeholder="30" />
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/suppliers"
          className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          Guardar proveedor
        </button>
      </div>
    </form>
  );
}