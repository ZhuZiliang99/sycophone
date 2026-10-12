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
import { validateAuth } from "@/lib/validator";

type Mode = "login" | "register";

type AuthResponse = {
  token: string;
  username: string;
  role: string;
};

type LoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ERROR_TEXT: Record<number, string> = {
  401: "Wrong username or password",
  409: "Username already exists",
};

export function LoginDialog({open, onOpenChange}: LoginDialogProps) {
    const [mode, setMode] = useState<Mode>("login");
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const isLogin = mode === "login";

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      const message = validateAuth(username, password);
      if (message) {
        setError(message);
        return;
      }
      setError("");
      setLoading(true);
      try {
        const response = await fetch(`/api/auth/${mode}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (!response.ok) {
          setError(ERROR_TEXT[response.status] ?? "Something went wrong");
          return;
        }
        const data: AuthResponse = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({ username: data.username, role: data.role }));
        onOpenChange(false);
      } catch {
        setError("Network error, is the backend running?");
      } finally {
        setLoading(false);
      }
    }

    const resetForm = () => {
      setUsername("");
      setPassword("");
      setError("");
    }

    const switchMode = (next: Mode) => {
      setMode(next);
      setError("");
      resetForm();
    };

    const handleOpenChange = (open: boolean) => {
      if (!open) {
        handleClose();
      }
      onOpenChange(open);
    }

    const handleClose = () => {
      resetForm();
      setMode("login");
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="rounded border border-1 border-[var(--login-border)] bg-[var(--bg)] text-[var(--login-text)] p-8 ring-0" >
            <DialogHeader className="border-b border-[var(--login-border)] pb-4">
              <div className="flex justify-center">
                <DialogTitle className="!font-[Georgia] text-4xl flex justify-center ">User.</DialogTitle>
                  <DialogTitle className='!font-[Georgia] text-4xl italic text-[#d4a878]'>{isLogin ? "Login" : "Register"}</DialogTitle>
                </div>
                <DialogDescription className="text-center text-[var(--login-text)]">
                  {isLogin ? "Login to your account to continue." : "Create an account to get started."}
                </DialogDescription>
                <div className="flex justify-center gap-8 pt-1">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className={`cursor-pointer text-[12px] tracking-widest pb-1 border-b transition-colors ${isLogin ? "text-[#d4a878] border-[#d4a878]" : "text-[var(--login-text)] border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    LOG IN
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className={`cursor-pointer text-[12px] tracking-widest pb-1 border-b transition-colors ${!isLogin ? "text-[#d4a878] border-[#d4a878]" : "text-[var(--login-text)] border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    REGISTER
                  </button>
                </div>
            </DialogHeader>
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid gap-2">
                <Label htmlFor="username" className="tracking-widest font-normal text-[12px]">USERNAME</Label>
                <Input id="username"
                  className="border-[var(--login-border)] rounded-sm h-9 mb-2 focus-visible:border-[var(--acid)] focus-visible:ring-[var(--acid)] focus-visible:ring-0"
                  value={username}
                  type="text"
                  autoComplete="username"
                  onChange={(e) => setUsername(e.target.value)} required>
                </Input>
                <Label htmlFor="password"  className="tracking-widest font-normal text-[12px]">PASSWORD</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    className="border-[var(--login-border)] rounded-sm h-9 mb-2 focus-visible:border-[var(--acid)] focus-visible:ring-[var(--acid)] focus-visible:ring-0"
                  />
                  {error && <p className="text-[var(--acid)] text-[12px]">{error}</p>}
                  <Button type="submit" disabled={loading} className="cursor-pointer tracking-widest font-normal text-[12px] border-[var(--login-border)] rounded-sm h-9 mb-2 text-[var(--login-text)] active:border-[var(--acid)]">
                    {loading ? "LOADING…" : isLogin ? "LOG IN" : "REGISTER"}
                  </Button>
                  <Button onClick={() => handleOpenChange(false)} type="button" disabled={loading} className="cursor-pointer tracking-widest font-normal text-[12px] border-[var(--login-border)] rounded-sm h-9 mb-2 text-[var(--login-text)] active:border-[var(--acid)]">
                    CANCEL
                  </Button>
              </div>
            </form>
          </DialogContent>

        </Dialog>
    )
}
