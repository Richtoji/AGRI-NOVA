"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type RoleType = "FARMER" | "BUYER" | "EQUIPMENT_OWNER" | "VETERINARY_EXPERT" | "DELIVERY_PARTNER" | "ADMIN" | "SUPER_ADMIN";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: RoleType;
  phone: string;
  avatarUrl: string;
  kycStatus: string;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  unit: string;
}

interface AuthRoleContextType {
  currentRole: RoleType;
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  login: (email: string, password: string, role: RoleType) => Promise<{ success: boolean; error?: string }>;
  registerUser: (name: string, email: string, phone: string, role: RoleType, password?: string, confirmPassword?: string, roleMetadata?: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (name: string, email: string, phone: string) => void;
  logout: () => Promise<void>;
  cartCount: number;
  cartItems: CartItem[];
  addToCart: (productId: string, quantity: number) => Promise<{ success: boolean; error?: string }>;
  updateCartItemQuantity: (id: string, newQuantity: number) => Promise<{ success: boolean; error?: string }>;
  removeFromCart: (id: string) => Promise<void>;
  isCartOpen: boolean;
  toggleCart: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  fetchCart: () => Promise<void>;
}

const AuthRoleContext = createContext<AuthRoleContextType | undefined>(undefined);

export const AuthRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<RoleType>("FARMER");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
      } else {
        setCartItems([]);
      }
    } catch (e) {
      console.error("Failed to fetch cart:", e);
    }
  };

  const addToCart = async (productId: string, quantity: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Unable to add product to cart." };
      }
      await fetchCart();
      return { success: true };
    } catch (e) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const updateCartItemQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return { success: false, error: "Invalid quantity." };
    try {
      const res = await fetch(`/api/cart/item/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Unable to update quantity." };
      }
      await fetchCart();
      return { success: true };
    } catch (e) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      await fetch(`/api/cart/item/${id}`, { method: "DELETE" });
      await fetchCart();
    } catch (e) {
      console.error("Failed to remove cart item:", e);
    }
  };

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Check auth session on load
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          setCurrentRole(data.user.role as RoleType);
          setIsLoggedIn(true);
          await fetchCart();
        }
      } catch (e) {
        // Not logged in or expired
      }
    };
    fetchSession();
  }, []);

  const login = async (email: string, password: string, role: RoleType): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" };
      }
      
      setCurrentUser(data.user);
      setCurrentRole(data.user.role as RoleType);
      setIsLoggedIn(true);
      await fetchCart();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: "Network error during login" };
    }
  };

  const registerUser = async (
    name: string,
    email: string,
    phone: string,
    role: RoleType,
    password?: string,
    confirmPassword?: string,
    roleMetadata?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      return { success: false, error: "Access denied. Public registration for administrative roles is prohibited." };
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, confirmPassword, role, roleMetadata })
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || "Server validation failed." };
      }

      // Automatically log the user in by fetching session token through login or immediately trusting register response
      // Since our register route doesn't issue a JWT cookie currently, we will just call login!
      return await login(email, password || "", role);
      
    } catch (err: any) {
      console.error("Failed to connect to backend registration endpoint", err);
      return { success: false, error: "Network error during registration" };
    }
  };

  const updateProfile = (name: string, email: string, phone: string) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    };
    setCurrentUser(updatedUser);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCartItems([]);
    window.location.href = "/auth/login";
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <AuthRoleContext.Provider
      value={{
        currentRole,
        currentUser,
        isLoggedIn,
        login,
        registerUser,
        updateProfile,
        logout,
        cartCount,
        cartItems,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        isCartOpen,
        toggleCart,
        theme,
        toggleTheme,
        fetchCart,
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = () => {
  const context = useContext(AuthRoleContext);
  if (!context) {
    throw new Error("useAuthRole must be used within an AuthRoleProvider");
  }
  return context;
};
