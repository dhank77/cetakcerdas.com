import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronDown, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

export function NavUserHeader() {
    const { auth } = usePage<SharedData>().props;
    const isMobile = useIsMobile();
    const getInitials = useInitials();
    const initials = getInitials(auth.user.name);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 gap-2 px-3 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                >
                    {isMobile ? (
                        <User className="h-4 w-4" />
                    ) : (
                        <>
                            <Avatar className="h-7 w-7">
                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden sm:flex flex-col items-start text-left">
                                <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
                                    {auth.user.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                                    {auth.user.email}
                                </span>
                            </div>
                            <ChevronDown className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-56 rounded-lg"
                align="end"
                side="bottom"
                sideOffset={8}
            >
                <UserMenuContent user={auth.user} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}