import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    return (

        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                

            </DialogTrigger>
        </Dialog>
    )

}