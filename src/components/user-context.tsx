"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = () => {
            // Simple way to get session from cookie (if non-HttpOnly) or meta
            // For simplicity, we'll try to fetch a "me" endpoint or just parse cookies if possible
            // But since we have an API for dashboard stats that returns user, we can use that or a dedicated one
            fetch("/api/dashboard/stats")
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        setUser(data.user);
                    } else {
                        setUser(null);
                    }
                })
                .catch(() => setUser(null))
                .finally(() => setLoading(false));
        };

        if (pathname !== "/login" && pathname !== "/register") {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [pathname]);

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        router.push("/login");
    };

    return (
        <UserContext.Provider value={{ user, loading, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
