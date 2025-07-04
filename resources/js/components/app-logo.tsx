import { Printer } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                <Printer className="size-5 text-white" />
            </div>
            <div className="ml-3 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-gray-900 dark:text-white">CetakCerdas</span>
                <span className="truncate text-xs text-gray-500 dark:text-gray-400">Smart Printing</span>
            </div>
        </>
    );
}
