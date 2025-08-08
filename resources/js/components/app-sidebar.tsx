import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    CreditCard,
    HelpCircle,
    LayoutGrid,
    ListOrderedIcon,
    MessageSquare,
    MessageSquareShareIcon,
    Printer,
    Settings,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { props } = usePage();
    const user = (props.auth as { user?: import('@/types').User })?.user;
    const isPremium = user?.is_premium || false;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutGrid,
            routeName: 'dashboard',
        },
        {
            title: 'Download Aplikasi Desktop',
            href: route('desktop.download'),
            icon: Printer,
            routeName: 'desktop.download',
        },
        {
            title: 'Riwayat Print',
            href: route('history.index'),
            icon: ListOrderedIcon,
            routeName: 'history.index',
        },
        {
            title: 'Kiriman Pelanggan',
            href: route('bookings.index'),
            icon: MessageSquareShareIcon,
            routeName: 'bookings.index',
        },
        {
            title: 'Member',
            href: isPremium ? route('members.index') : '/premium',
            icon: Users,
            isPro: !isPremium,
            routeName: 'members.index',
        },
        {
            title: 'Laporan',
            href: isPremium ? route('reports.index') : '/premium',
            icon: BarChart3,
            isPro: !isPremium,
            routeName: 'reports.index',
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Pengaturan',
            href: route('setting.index'),
            icon: Settings,
            routeName: 'setting.index',
        },
        {
            title: 'Tagihan',
            href: route('billing.index'),
            icon: CreditCard,
            routeName: 'billing.index',
        },
        {
            title: 'Bantuan',
            href: route('help'),
            icon: HelpCircle,
            routeName: 'help',
        },
        {
            title: 'Testimoni',
            href: route('testimonials.index'),
            icon: MessageSquare,
            routeName: 'testimonials.index',
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-gray-200 dark:border-gray-800">
            <SidebarHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="transition-colors hover:bg-white/50 dark:hover:bg-gray-800/50">
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-white dark:bg-gray-900">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-gray-700 dark:from-gray-900 dark:to-gray-800">
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
