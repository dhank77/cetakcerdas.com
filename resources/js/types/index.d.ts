import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    isPro?: boolean;
    routeName?: string;
}

export interface Flash {
    type?: 'success' | 'error' | 'info' | 'warning';
    messages?: string | string[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    flash: Flash;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    slug?: string;
    pin?: number;
    avatar?: string;
    is_premium?: boolean;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Setting {
    id: number;
    user_id: number;
    bw_price: number;
    color_price: number;
    photo_price: number | null;
    threshold_color: number | null;
    threshold_photo: number | null;
    created_at: string;
    updated_at: string;
}
