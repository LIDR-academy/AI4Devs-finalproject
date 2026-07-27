// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { API } from "@/App";
import { getAuthHeaders } from "@/lib/api";
import { CheckCircle, ArrowRight, Loader2, XCircle } from "lucide-react";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 10;

/**
 * Stripe success page — polls payment status until paid/expired.
 */
const BillingSuccessPage = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "checking", message: "" });
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setState({ status: "error", message: "No session id provided." });
      return;
    }

    let cancelled = false;

    const poll = async (count) => {
      if (cancelled) return;
      if (count >= MAX_ATTEMPTS) {
        setState({
          status: "timeout",
          message: "El pago tarda mas de lo esperado. Revisa tu email; te avisaremos cuando se confirme.",
        });
        return;
      }
      try {
        const res = await fetch(`${API}/payments/checkout/status/${sessionId}`, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("status fetch failed");
        const data = await res.json();
        setAttempts(count + 1);

        if (data.payment_status === "paid") {
          setState({ status: "paid", message: "Pago completado. Tu plan ha sido actualizado.", data });
          return;
        }
        if (data.status === "expired") {
          setState({ status: "expired", message: "La sesion ha expirado. Vuelve a intentarlo." });
          return;
        }
        // still pending
        setState({ status: "pending", message: "Procesando pago...", data });
        setTimeout(() => poll(count + 1), POLL_INTERVAL_MS);
      } catch (e) {
        setState({ status: "error", message: "No se pudo verificar el pago." });
      }
    };

    poll(0);
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div
        className="w-full max-w-lg border border-zinc-200 p-8 bg-white shadow-[10px_10px_0_0_#2563eb]"
        data-testid="billing-success-page"
      >
        {state.status === "checking" || state.status === "pending" ? (
          <div className="text-center" data-testid="billing-state-pending">
            <Loader2 className="w-10 h-10 mx-auto mb-4 text-blue-600 animate-spin" />
            <h1
              className="text-2xl font-black text-zinc-900 tracking-tight uppercase mb-3"
              style={{ fontFamily: "'Chivo', sans-serif" }}
            >
              Procesando pago
            </h1>
            <p className="text-sm text-zinc-600 mb-2" style={{ fontFamily: "'Work Sans', sans-serif" }}>
              {state.message || "Verificando tu pago con Stripe..."}
            </p>
            <p
              className="text-[10px] text-zinc-400"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Intento {attempts} / {MAX_ATTEMPTS}
            </p>
          </div>
        ) : state.status === "paid" ? (
          <div className="text-center" data-testid="billing-state-paid">
            <div className="w-12 h-12 mx-auto mb-4 bg-emerald-500 flex items-center justify-center text-white">
              <CheckCircle className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <h1
              className="text-3xl font-black text-zinc-900 tracking-tight uppercase mb-3"
              style={{ fontFamily: "'Chivo', sans-serif" }}
            >
              Pago Completado
            </h1>
            <p className="text-sm text-zinc-600 mb-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
              Tu plan ha sido activado. Ya puedes crear proyectos y diagramas ilimitados.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase border-2 bg-deep-navy text-white border-zinc-900 hover:bg-blue-600 hover:border-blue-600 transition-colors"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              data-testid="billing-go-dashboard"
            >
              Ir al Dashboard
              <ArrowRight className="w-3.5 h-3.5 inline ml-2" />
            </button>
          </div>
        ) : (
          <div className="text-center" data-testid="billing-state-error">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-500 flex items-center justify-center text-white">
              <XCircle className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <h1
              className="text-3xl font-black text-zinc-900 tracking-tight uppercase mb-3"
              style={{ fontFamily: "'Chivo', sans-serif" }}
            >
              {state.status === "expired" ? "Sesion expirada" : "Hubo un problema"}
            </h1>
            <p className="text-sm text-zinc-600 mb-6" style={{ fontFamily: "'Work Sans', sans-serif" }}>
              {state.message}
            </p>
            <Link to="/pricing">
              <button
                className="px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase border border-zinc-200 hover:bg-deep-navy hover:text-white transition-colors"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                data-testid="billing-back-pricing"
              >
                Volver a planes
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingSuccessPage;
