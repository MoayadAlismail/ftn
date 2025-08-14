"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreditCard, ShieldCheck, Receipt, Loader2 } from "lucide-react";

export default function BillingPage() {
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-600 mt-1">Manage your plan, payment method, and invoices.</p>
      </div>

      {/* Current Plan */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <div>
              <div className="text-lg font-semibold">Starter Plan</div>
              <div className="text-sm text-gray-600">Great for early hiring—includes 10 invites per month</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">SAR 49</div>
            <div className="text-sm text-gray-500">per month</div>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button className="bg-primary hover:bg-primary/90">Upgrade</Button>
          <Button variant="outline">Cancel Plan</Button>
        </div>
      </Card>

      {/* Payment Method */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-primary" />
            <div>
              <div className="text-lg font-semibold">Payment Method</div>
              <div className="text-sm text-gray-600">Visa •••• 4242, expires 05/27</div>
            </div>
          </div>
          <Button
            variant="outline"
            disabled={isUpdating}
            onClick={() => {
              setIsUpdating(true);
              setTimeout(() => setIsUpdating(false), 1200);
            }}
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
          </Button>
        </div>
      </Card>

      {/* Invoices */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Receipt className="w-6 h-6 text-primary" />
          <div className="text-lg font-semibold">Invoices</div>
        </div>
        <div className="divide-y">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 text-sm">
              <div className="text-gray-700">Invoice #{202400 + i}</div>
              <div className="text-gray-500">Aug {10 + i}, 2025</div>
              <div className="font-medium">SAR 49.00</div>
              <Button variant="outline" size="sm">Download</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

