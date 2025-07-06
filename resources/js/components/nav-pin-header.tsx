import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Lock, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function NavPinHeader() {
    const { auth } = usePage<SharedData>().props;
    const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    if (!auth.user.pin) {
        return null;
    }

    const copyToClipboard = async () => {
        try {
            const pinText = String(auth.user.pin);
            
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(pinText);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = pinText;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }
            
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy PIN:', err);
        }
    };

    return (
        <Dialog open={isPinDialogOpen} onOpenChange={setIsPinDialogOpen}>
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <DialogTrigger asChild>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-10 w-10 p-0 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Lock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </Button>
                        </TooltipTrigger>
                    </DialogTrigger>
                    <TooltipContent>
                        <p>Lihat PIN</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        PIN Akses Anda
                    </DialogTitle>
                    <DialogDescription>
                        PIN ini digunakan untuk mengakses halaman print dokumen.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
                        <div className="flex items-center justify-center gap-4">
                            <div className="text-3xl font-mono font-bold tracking-widest text-gray-900 dark:text-gray-100">
                                {auth.user.pin}
                            </div>
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={copyToClipboard}
                                            className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            {isCopied ? (
                                                <Check className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{isCopied ? 'Tersalin!' : 'Copy PIN'}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Simpan PIN ini dengan aman. Jangan bagikan kepada orang lain.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}