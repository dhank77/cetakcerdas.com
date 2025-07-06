import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { User } from '@/types';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

const Header = ({ isLocked, user }: { isLocked?: boolean, user?: User | null }) => {

    const { auth, flash } = usePage<SharedData>().props;

    const { appearance, updateAppearance } = useAppearance();

    const toggleDarkMode = () => {
        const newAppearance = appearance === 'dark' ? 'light' : 'dark';
        updateAppearance(newAppearance);
    };

    if (flash.type && flash.messages) {
        const message = Array.isArray(flash.messages) ? flash.messages.join('\n') : String(flash.messages);

        const validTypes = ['success', 'error', 'warning', 'info'];
        const toastType = validTypes.includes(flash.type) ? flash.type : 'info';

        toast[toastType](message);
    }

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
            <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                    {/* Logo Section - Responsive */}
                    <Link href="/" className="flex-shrink-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="text-xl sm:text-2xl">🖨️</div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                                    <span className="hidden sm:inline">CetakCerdas.Com</span>
                                    <span className="sm:hidden">CetakCerdas</span>
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                    <span className="hidden sm:inline">Analisis Dokumen Berbasis AI</span>
                                    <span className="sm:hidden">AI Document</span>
                                </p>
                            </div>
                        </div>
                    </Link>
                    
                    {/* Actions Section - Responsive */}
                    <div className='flex gap-x-2 sm:gap-x-4 items-center flex-shrink-0'>
                        {
                            (!auth.user && isLocked) || user == null && (
                                <div className='flex gap-x-1 sm:gap-x-2 items-center'>
                                    <Link href="/login">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="text-xs sm:text-sm px-2 sm:px-4"
                                        >
                                            <span>Masuk</span>
                                        </Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button 
                                            size="sm" 
                                            className="text-xs sm:text-sm px-2 sm:px-4"
                                        >
                                            <span className="hidden sm:inline">Daftar Gratis</span>
                                            <span className="sm:hidden">Daftar</span>
                                        </Button>
                                    </Link>
                                </div>
                            )
                        }
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={toggleDarkMode} 
                            className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
                        >
                            <span className="text-sm sm:text-base">
                                {appearance === 'dark' ? '☀️' : '🌙'}
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            <Toaster />
        </header>
    );
};

export default Header;
