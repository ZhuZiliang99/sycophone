export function validateAuth(username: string, password: string): string | null {
    if (!username.trim() || !password.trim()) {
      return "Please fill in all fields"
    }
    if (username.trim().length < 2) {
      return "Username must be at least 2 characters"
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters"
    }
    return null // null = 通过
  }