import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SharedData, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Calendar,
    CreditCard,
    FileText,
    HelpCircle,
    LayoutGrid,
    MessageSquare,
    Package,
    Printer,
    Settings,
    Truck,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Pengaturan',
        href: '/settings',
        icon: Settings,
    },
    {
        title: 'Billing',
        href: '/billing',
        icon: CreditCard,
    },
    {
        title: 'Bantuan',
        href: '/help',
        icon: HelpCircle,
    },
    {
        title: 'Dukungan',
        href: '/support',
        icon: MessageSquare,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Halaman Print',
            href: route('print', { slug: auth.user.slug }),
            icon: Printer,
        },
        {
            title: 'Pesanan',
            href: '/orders',
            icon: FileText,
        },
        {
            title: 'Inventori',
            href: '/inventory',
            icon: Package,
        },
        {
            title: 'Pelanggan',
            href: '/customers',
            icon: Users,
        },
        {
            title: 'Laporan',
            href: '/reports',
            icon: BarChart3,
        },
        {
            title: 'Pengiriman',
            href: '/shipping',
            icon: Truck,
        },
        {
            title: 'Jadwal Produksi',
            href: '/schedule',
            icon: Calendar,
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
