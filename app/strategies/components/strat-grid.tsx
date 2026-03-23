"use client";

import React, { useState } from "react";
import { Strategy } from "@/app/strategies/supabase.ts";
import { AddStratModal } from "@/app/strategies/components/strategy-modal.tsx";
import { CardGrid } from "@/components/card-grid";
import { Card, CardHeader, CardBody } from "@/components/card";

function StratCard({ strat }: { strat: Strategy }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="font-medium">{strat.strategy}</h3>
        </CardHeader>
        <CardBody>
          <p className="text-neutral-400 text-sm mb-3">{strat.description}</p>
          <button
            onClick={() => setOpen(true)}
            className="px-3 py-1.5 rounded hover:bg-neutral-800 text-sm transition-colors text-neutral-400"
          >
            Edit
          </button>
        </CardBody>
      </Card>

      <AddStratModal
        isOpen={open}
        onClose={() => setOpen(false)}
        mode="edit"
        stratToEdit={strat}
      />
    </>
  );
}

interface StratGridProps {
  strats: Strategy[];
}

export function StratGrid({ strats }: StratGridProps) {
  if (!strats || strats.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <p className="text-neutral-400">No strats found.</p>
      </div>
    );
  }

  return (
    <CardGrid>
      {strats.map((item) => (
        <StratCard key={item.strategy_id} strat={item} />
      ))}
    </CardGrid>
  );
}
