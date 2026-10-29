"use client";

import { useAction } from "@/hooks/useAction";
import { residentApi } from "@/lib/api/resident";
import type { PaymentOrder } from "@/lib/types/portal";

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayInstance {
  open: () => void;
}
type RazorpayCtor = new (opts: Record<string, unknown>) => RazorpayInstance;

const SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpay(): Promise<RazorpayCtor> {
  const w = window as unknown as { Razorpay?: RazorpayCtor };
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.onload = () => (w.Razorpay ? resolve(w.Razorpay) : reject(new Error("Payment window could not load")));
    s.onerror = () => reject(new Error("Could not load the payment gateway. Check your internet."));
    document.body.appendChild(s);
  });
}

async function pay(refType: "booking" | "maintenance", refId: number) {
  const order: PaymentOrder = await residentApi.initiatePayment(refType, refId);

  // Dev / test gateway: the backend accepts a fixed signature, no checkout window.
  if (order.gateway === "mock") {
    return residentApi.verifyPayment({
      payment_id: order.payment_id,
      gateway_order_id: order.gateway_order_id,
      gateway_payment_id: `mock_pay_${Date.now()}`,
      signature: "mock_signature",
    });
  }

  const Razorpay = await loadRazorpay();
  return new Promise((resolve, reject) => {
    const rz = new Razorpay({
      key: order.key_id,
      amount: order.amount_paise,
      currency: order.currency,
      order_id: order.gateway_order_id,
      name: "Odeslo",
      handler: (r: RazorpayResponse) =>
        residentApi
          .verifyPayment({ payment_id: order.payment_id, gateway_order_id: r.razorpay_order_id, gateway_payment_id: r.razorpay_payment_id, signature: r.razorpay_signature })
          .then(resolve, reject),
      modal: {
        ondismiss: () => {
          residentApi.failPayment(order.payment_id, "Cancelled by user").catch(() => {});
          reject(new Error("Payment cancelled"));
        },
      },
    });
    rz.open();
  });
}

/** Pay a booking or maintenance bill. Works with the mock gateway (dev) and Razorpay checkout. */
export function usePay(onDone?: () => void) {
  return useAction((a: { refType: "booking" | "maintenance"; refId: number }) => pay(a.refType, a.refId), {
    invalidate: [["resident"]],
    success: "Payment successful",
    onSuccess: onDone,
  });
}
