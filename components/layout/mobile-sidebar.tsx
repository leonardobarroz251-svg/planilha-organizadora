"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BrandMark } from "@/components/shared/brand-mark";
import { SidebarNav } from "./sidebar-nav";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu" />
        }
      >
        <Menu size={18} />
      </SheetTrigger>
      <SheetContent side="left" className="w-[260px] border-r border-[var(--line)] bg-[var(--surface-2)] p-0">
        <div className="px-5 pt-5 pb-4">
          <BrandMark size={26} withWordmark />
        </div>
        <SidebarNav onItemClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
