"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import {
  createOrderAction,
  type CreateOrderFormState,
} from "@/app/orders/new/actions";

type ClientOption = {
  id: string;
  commercialName: string;
};

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  basePrice: number;
  supplierId: string;
  supplierName: string;
};

type LineItem = {
  localId: string;
  productId: string;
  quantity: number;
};

const initialState: CreateOrderFormState = {};

function createEmptyLineItem(): LineItem {
  return {
    localId: crypto.randomUUID(),
    productId: "",
    quantity: 1,
  };
}

export function OrderForm({
  clients,
  products,
}: {
  clients: ClientOption[];
  products: ProductOption[];
}) {
  const [state, formAction] = useActionState(createOrderAction, initialState);
  const [clientId, setClientId] = useState("");
  const [items, setItems] = useState<LineItem[]>([createEmptyLineItem()]);

  const computed = useMemo(() => {
    const detailedItems = items
      .map((item) => {
        const product = products.find((candidate) => candidate.id === item.productId);

        if (!product || item.quantity <= 0) {
          return null;
        }

        return {
          ...item,
          product,
          total: product.basePrice * item.quantity,
        };
      })
      .filter(Boolean) as Array<LineItem & { product: ProductOption; total: number }>;

    const subtotal = detailedItems.reduce((sum, item) => sum + item.total, 0);
    const supplierIds = [...new Set(detailedItems.map((item) => item.product.supplierId))];

    return {
      detailedItems,
      subtotal,
      hasMixedSuppliers: supplierIds.length > 1,
      payload: JSON.stringify(
        detailedItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      ),
    };
  }, [items, products]);

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {state.error}
        </p>
      ) : null}

      {computed.hasMixedSuppliers ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          La orden contiene productos de distintos proveedores. Se puede guardar, pero conviene dividirla por proveedor.
        </p>
      ) : null}

      <label className="block text-sm font-medium text-stone-800">
        Cliente
        <select
          name="clientId"
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-950"
          required
        >
          <option value="">Selecciona un cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.commercialName}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-4">
        {items.map((item) => {
          const selectedProduct = products.find((product) => product.id === item.productId);

          return (
            <div key={item.localId} className="grid gap-4 rounded-3xl border border-stone-200 p-5 md:grid-cols-[1.8fr_0.6fr_0.8fr_auto] md:items-end">
              <label className="block text-sm font-medium text-stone-800">
                Producto
                <select
                  value={item.productId}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setItems((current) =>
                      current.map((candidate) =>
                        candidate.localId === item.localId ? { ...candidate, productId: nextValue } : candidate,
                      ),
                    );
                  }}
                  className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-950"
                >
                  <option value="">Selecciona un producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.sku} · {product.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-stone-800">
                Cantidad
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(event) => {
                    const nextQuantity = Number(event.target.value);
                    setItems((current) =>
                      current.map((candidate) =>
                        candidate.localId === item.localId
                          ? { ...candidate, quantity: Number.isFinite(nextQuantity) && nextQuantity > 0 ? nextQuantity : 1 }
                          : candidate,
                      ),
                    );
                  }}
                  className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm text-stone-950 outline-none transition focus:border-stone-950"
                />
              </label>

              <div className="text-sm text-stone-600">
                <p className="font-medium text-stone-900">Subtotal línea</p>
                <p className="mt-2">
                  {selectedProduct ? (selectedProduct.basePrice * item.quantity).toFixed(2) : "0.00"}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  {selectedProduct ? selectedProduct.supplierName : "Proveedor pendiente"}
                </p>
              </div>

              <button
                type="button"
                className="rounded-full border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                onClick={() => {
                  setItems((current) =>
                    current.length > 1
                      ? current.filter((candidate) => candidate.localId !== item.localId)
                      : current,
                  );
                }}
              >
                Quitar
              </button>
            </div>
          );
        })}
      </div>

      <input type="hidden" name="items" value={computed.payload} />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4">
        <button
          type="button"
          className="rounded-full border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-white"
          onClick={() => setItems((current) => [...current, createEmptyLineItem()])}
        >
          Añadir producto
        </button>
        <div className="text-right text-sm text-stone-600">
          <p className="font-medium text-stone-900">Subtotal</p>
          <p className="mt-1 text-lg font-semibold text-stone-950">{computed.subtotal.toFixed(2)}</p>
          <p className="mt-1 text-xs text-stone-500">Impuestos y descuentos en MVP: 0.00</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link href="/orders" className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50">
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          Guardar orden
        </button>
      </div>
    </form>
  );
}