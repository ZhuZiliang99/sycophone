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
import { validateLogin } from "@/lib/validator";

type LoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({open, onOpenChange}: LoginDialogProps) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      const message = validateLogin(email, password);
      if (message) {
        setError(message);
        return;
      }
      setError("");
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
          <DialogContent className="rounded border border-1 border-[var(--login-border)] bg-[var(--bg)] text-[var(--login-text)] p-8 ring-0" >
            <DialogHeader className="border-b border-[var(--login-border)] pb-4">
              <div className="flex justify-center">
                <DialogTitle className="!font-[Georgia] text-4xl flex justify-center ">User.</DialogTitle>
                  <DialogTitle className='!font-[Georgia] text-4xl italic text-[#d4a878]'>Login</DialogTitle>
                </div>
                <DialogDescription className="text-center text-[var(--login-text)]">
                  Login to your account to continue.
                </DialogDescription>  
            </DialogHeader>
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid gap-2">
                <Label htmlFor="email" className="tracking-widest font-normal text-[12px]">EMAIL</Label>
                <Input id="email" 
                  className="border-[var(--login-border)] rounded-sm h-9 mb-2 focus-visible:border-[var(--acid)] focus-visible:ring-[var(--acid)] focus-visible:ring-0" 
                  value={email} 
                  type="email" 
                  onChange={(e) => setEmail(e.target.value)} required>
                </Input>
                <Label htmlFor="password"  className="tracking-widest font-normal text-[12px]">PASSWORD</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="border-[var(--login-border)] rounded-sm h-9 mb-2 focus-visible:border-[var(--acid)] focus-visible:ring-[var(--acid)] focus-visible:ring-0"
                  />
                  {error && <p className="text-[var(--acid)] text-[12px]">{error}</p>}
                  <Button type="submit" disabled={loading} className="tracking-widest font-normal text-[12px] border-[var(--login-border)] rounded-sm h-9 mb-2 text-[var(--login-text)] active:border-[var(--acid)]">
                    {loading ? "LOADING…" : "LOG IN"}
                  </Button>
                  <Button type="submit" disabled={loading} className="tracking-widest font-normal text-[12px] border-[var(--login-border)] rounded-sm h-9 mb-2 text-[var(--login-text)] active:border-[var(--acid)]">
                    {"REGISTER"}
                  </Button>
              </div>
            </form>
          </DialogContent>

        </Dialog>
    )

}