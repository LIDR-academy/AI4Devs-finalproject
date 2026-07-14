"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createClientAction,
  type CreateClientFormState,
} from "@/app/clients/new/actions";
import { SubmitButton } from "@/app/clients/new/submit-button";

const initialState: CreateClientFormState = {};

const clientTypeOptions = [
  { value: "PROSPECT", label: "Prospecto" },
  { value: "CUSTOMER", label: "Cliente" },
  { value: "DISTRIBUTOR", label: "Distribuidor" },
  { value: "OTHER", label: "Otro" },
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
  type?: "text" | "email";
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

export function ClientForm() {
  const [state, formAction] = useActionState(createClientAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Nombre comercial" name="commercialName" placeholder="Comercial Andina" />
        <Field label="Razón social" name="legalName" placeholder="Comercial Andina S.A." />
        <label className="block text-sm font-medium text-stone-800">
          Tipo de cliente
          <select
            name="clientType"
            defaultValue="PROSPECT"
            className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-950"
          >
            {clientTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <Field label="País" name="country" placeholder="Chile" />
        <Field label="Ciudad" name="city" placeholder="Santiago" />
        <Field label="Dirección" name="address" placeholder="Av. Ejemplo 123" />
        <Field label="Teléfono" name="phone" placeholder="+56 9 5555 5555" />
        <Field label="Email" name="email" type="email" placeholder="compras@cliente.com" />
        <Field label="RUT / Tax ID" name="taxId" placeholder="76.123.456-7" />
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/"
          className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
        >
          Cancelar
        </Link>
        <SubmitButton />
      </div>
    </form>
  );
}