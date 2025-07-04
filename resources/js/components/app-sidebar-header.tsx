import { Breadcrumbs } from '@/components/breadcrumbs';
import { NavUserHeader } from '@/components/nav-user-header';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <NavUserHeader />
            </div>
        </header>
    );
}
