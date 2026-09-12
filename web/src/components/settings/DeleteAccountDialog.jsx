import React, { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CONFIRM_WORD = "DELETE";

// Secure account deletion flow: requires typing DELETE, purges the user's data,
// then signs the user out.
export default function DeleteAccountDialog({ open, onOpenChange }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setBusy(true);
    try {
      await base44.functions.invoke("delete-account", {});
      await base44.auth.logout("/login");
    } catch (e) {
      console.error(e);
      setBusy(false);
      toast({ title: "Could not delete account. Try again.", variant: "destructive" });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (busy) return;
        onOpenChange(o);
        if (!o) setValue("");
      }}
    >
      <DialogContent className="max-w-sm border-white/10 bg-[#0b0b1a] text-white sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex select-none items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            Delete account?
          </DialogTitle>
          <DialogDescription className="text-white/60">
            This permanently deletes <span className="font-semibold text-white/80">all your wallpapers</span> and signs
            you out of the app. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <p className="text-xs text-white/50">
          Type <span className="font-bold tracking-widest text-rose-300">DELETE</span> to confirm.
        </p>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="DELETE"
          disabled={busy}
          className="border-white/10 bg-black/40 text-white placeholder:text-white/30"
        />

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            className="select-none text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="select-none"
            disabled={busy || value.trim().toUpperCase() !== CONFIRM_WORD}
            onClick={handleDelete}
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Deleting…
              </>
            ) : (
              "Delete forever"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}