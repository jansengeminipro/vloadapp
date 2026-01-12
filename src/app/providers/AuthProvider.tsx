import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/shared/lib/supabase';

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: 'trainer' | 'student';
    trainer_id?: string;
    avatar_url?: string;
    birth_date?: string;
    height?: number;
    weight?: number;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    role: 'trainer' | 'student' | null;
    loading: boolean;
    signInWithEmail: (email: string, options?: { data?: any }) => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [role, setRole] = useState<'trainer' | 'student' | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else setLoading(false);
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setRole(null);
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            if (data) {
                setProfile(data as Profile);
                setRole(data.role as 'trainer' | 'student');
            } else {
                setRole(null);
                setProfile(null);
                console.warn('User profile found but has no data:', userId);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setRole(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    interface SignInOptions {
        data?: {
            [key: string]: any;
        };
    }

    const signInWithEmail = async (email: string, options?: SignInOptions) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: options
        });
        if (error) throw error;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setRole(null);
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, role, loading, signInWithEmail, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
