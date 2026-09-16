import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({open, onOpenChange}: LoginDialogProps) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        console.log(response);
      } catch (error) {
        console.error(error);
      }
    }

    return (

        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login</DialogTitle>
              <DialogDescription>
                Login to your account to continue
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="gird gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} type="email" onChange={(e) => setEmail(e.target.value)} required></Input>
              </div>
              <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Loading…" : "Logged in"}
          </Button>
            </form>
          </DialogContent>

        </Dialog>
    )

}