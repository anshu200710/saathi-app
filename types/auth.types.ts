export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  name: string;
  avatar?: string;
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  otp?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}
