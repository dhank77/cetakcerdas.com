import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BarChart3, CreditCard, FileText, HelpCircle, LayoutGrid, ListOrderedIcon, MessageSquare, MessageSquareShareIcon, Printer, Settings, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Halaman Print',
        href: route('print.redirect'),
        icon: Printer,
    },
    {
        title: 'Kiriman Pelanggan',
        href: '/bookings',
        icon: MessageSquareShareIcon,
    },
    {
        title: 'Riwayat Print',
        href: '/history',
        icon: ListOrderedIcon,
    },
    {
        title: 'Pesanan',
        href: '/orders',
        icon: FileText,
    },
    {
        title: 'Member',
        href: '/members',
        icon: Users,
    },
    {
        title: 'Laporan',
        href: '/reports',
        icon: BarChart3,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Pengaturan',
        href: '/setting',
        icon: Settings,
    },
    {
        title: 'Tagihan',
        href: '/billing',
        icon: CreditCard,
    },
    {
        title: 'Bantuan',
        href: '/help',
        icon: HelpCircle,
    },
    {
        title: 'Testimoni',
        href: '/testimonials',
        icon: MessageSquare,
    },
];

export function AppSidebar() {
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
