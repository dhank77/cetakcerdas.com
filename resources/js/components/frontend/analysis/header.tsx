import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { User } from '@/types';

const Header = ({ isLocked, user }: { isLocked?: boolean, user?: User | null }) => {

    const { auth } = usePage<SharedData>().props;

    const { appearance, updateAppearance } = useAppearance();

    const toggleDarkMode = () => {
        const newAppearance = appearance === 'dark' ? 'light' : 'dark';
        updateAppearance(newAppearance);
    };

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/">
                        <div className="flex items-center gap-3">
                            <div className="text-2xl">🖨️</div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">CetakCerdas.Com</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Analisis Dokumen Berbasis AI</p>
                            </div>
                        </div>
                    </Link>
                    <div className='flex gap-x-4 items-center'>
                        {
                            (!auth.user && isLocked) || user == null && (
                                <div className='flex gap-x-2 items-center'>
                                    <Link href="/login">
                                        <Button variant="outline" size="lg">Masuk</Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button>Daftar Gratis</Button>
                                    </Link>
                                </div>
                            )
                        }
                        <Button variant="outline" size="icon" onClick={toggleDarkMode} className="gap-2">
                            <span>{appearance === 'dark' ? '☀️' : '🌙'}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
