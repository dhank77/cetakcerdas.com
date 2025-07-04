import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';

const Header = () => {
    const { appearance, updateAppearance } = useAppearance();

    const toggleDarkMode = () => {
        const newAppearance = appearance === 'dark' ? 'light' : 'dark';
        updateAppearance(newAppearance);
    };

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">📄</div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">CetakCerdas.Com</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Analisis Dokumen Berbasis AI</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={toggleDarkMode} className="gap-2">
                        <span>{appearance === 'dark' ? '☀️' : '🌙'}</span>
                        <span>{appearance === 'dark' ? 'Terang' : 'Gelap'}</span>
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Header;