import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Crown } from 'lucide-react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-2">
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Menu Utama
            </SidebarGroupLabel>
            <SidebarMenu className="space-y-1">
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={item.routeName ? route().current(item.routeName) : page.url.startsWith(item.href)}
                            tooltip={{ children: item.title }}
                            className="group relative hover:bg-blue-50 dark:hover:bg-gray-800 data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-100 data-[active=true]:to-purple-100 dark:data-[active=true]:from-blue-900/50 dark:data-[active=true]:to-purple-900/50 data-[active=true]:text-blue-700 dark:data-[active=true]:text-blue-300 transition-all duration-200"
                        >
                            <Link href={item.href} prefetch={!item.href.includes('print-redirect')}>
                                {item.icon && <item.icon className="group-data-[active=true]:text-blue-600 dark:group-data-[active=true]:text-blue-400" />}
                                <div className="flex items-center justify-between flex-1">
                                    <span className="font-medium">{item.title}</span>
                                    {item.isPro && (
                                        <Badge variant="secondary" className="ml-2 text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200">
                                            <Crown className="h-3 w-3 mr-1" />
                                            PRO
                                        </Badge>
                                    )}
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
