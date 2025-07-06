import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { User } from '@/types';
import { Lock } from 'lucide-react';
import { useCallback, useState, useImperativeHandle, forwardRef } from 'react';

interface PinModalProps {
    user: User | null;
    isProduction: boolean;
    onPinSuccess: () => void;
}

export interface PinModalRef {
    checkStoredPin: () => Promise<boolean>;
}

const PinModal = forwardRef<PinModalRef, PinModalProps>(({ user, isProduction, onPinSuccess }, ref) => {
    const [showPinModal, setShowPinModal] = useState(true);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [pinAttempts, setPinAttempts] = useState(0);
    const maxPinAttempts = 3;

    // Hash function for PIN storage with fallback
    const hashPin = useCallback(async (pinValue: string, userSlug: string): Promise<string> => {
        const input = pinValue + userSlug + 'cetak-cerdas-salt';

        // Check if Web Crypto API is available
        if (window.crypto && window.crypto.subtle) {
            try {
                const encoder = new TextEncoder();
                const data = encoder.encode(input);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
            } catch (error) {
                console.warn('Web Crypto API failed, using fallback hash:', error);
            }
        }

        // Fallback: Simple hash function (not cryptographically secure but sufficient for this use case)
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        // Convert to positive hex string
        return Math.abs(hash).toString(16).padStart(8, '0');
    }, []);

    // Alternative: Even simpler fallback using btoa (Base64)
    const hashPinSimple = useCallback((pinValue: string, userSlug: string): string => {
        const input = pinValue + userSlug + 'cetak-cerdas-salt';

        // Check if Web Crypto API is available
        if (window.crypto && window.crypto.subtle) {
            // Use the async version above
            return '';
        }

        // Simple Base64 encoding as fallback
        try {
            return btoa(input).replace(/[+/=]/g, '').substring(0, 16);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // Final fallback: simple string manipulation
            let hash = '';
            for (let i = 0; i < input.length; i++) {
                hash += input.charCodeAt(i).toString(16);
            }
            return hash.substring(0, 16);
        }
    }, []);

    const checkStoredPin = useCallback(async (): Promise<boolean> => {
        if (!user?.slug) return false;

        try {
            const storedHash = localStorage.getItem(`pin_hash_${user.slug}`);
            if (!storedHash) return false;

            const correctPin = user?.pin ?? 0;
            const expectedHash = await hashPin(correctPin.toString(), user.slug);

            return storedHash === expectedHash;
        } catch (error) {
            console.error('Error checking stored PIN:', error);
            localStorage.removeItem(`pin_hash_${user.slug}`);
            return false;
        }
    }, [user?.slug, user?.pin, hashPin]);

    // Expose checkStoredPin function to parent component
    useImperativeHandle(ref, () => ({
        checkStoredPin
    }), [checkStoredPin]);

    const storePinHash = useCallback(
        async (pinValue: string): Promise<void> => {
            if (!user?.slug) return;

            try {
                const hash = await hashPin(pinValue, user.slug);
                localStorage.setItem(`pin_hash_${user.slug}`, hash);
            } catch (error) {
                console.error('Error storing PIN hash:', error);
                const simpleHash = hashPinSimple(pinValue, user.slug);
                localStorage.setItem(`pin_hash_${user.slug}`, simpleHash);
            }
        },
        [user?.slug, hashPin, hashPinSimple],
    );

    const handlePinSubmit = useCallback(async () => {
        const correctPin = user?.pin ?? 0;
        const pinNumber = parseInt(pin);

        if (pinNumber === correctPin) {
            setShowPinModal(false);
            setPinError('');
            setPinAttempts(0);

            await storePinHash(pin);
            setPin('');
            onPinSuccess();
        } else {
            setPinAttempts((prev) => prev + 1);
            const remainingAttempts = maxPinAttempts - pinAttempts - 1;

            if (remainingAttempts > 0) {
                setPinError(`PIN salah. Sisa percobaan: ${remainingAttempts}`);
            } else {
                setPinError('Terlalu banyak percobaan yang salah. Silakan coba lagi nanti.');
                setTimeout(() => {
                    setPinAttempts(0);
                    setPinError('');
                    setPin('');
                }, 5000);
            }
            setPin('');
        }
    }, [user?.pin, pin, storePinHash, onPinSuccess, pinAttempts]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 transition-colors duration-300 dark:from-gray-900 dark:to-gray-800">
            <Dialog open={showPinModal} onOpenChange={() => {}}>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Masukkan PIN Akses
                        </DialogTitle>
                        <DialogDescription>
                            Halaman ini memerlukan PIN untuk diakses. Masukkan PIN yang benar untuk melanjutkan.
                            {!isProduction && (
                                <span className="mt-2 block text-yellow-600 dark:text-yellow-400">Mode Development: PIN dinonaktifkan</span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Masukkan PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handlePinSubmit()}
                                className="text-center text-lg tracking-widest"
                                maxLength={6}
                                disabled={pinAttempts >= maxPinAttempts}
                            />
                            {pinError && <p className="text-sm text-red-600 dark:text-red-400">{pinError}</p>}
                            {pinAttempts >= maxPinAttempts && (
                                <p className="text-sm text-blue-600 dark:text-blue-400">Menunggu 5 detik sebelum dapat mencoba lagi...</p>
                            )}
                        </div>
                        <Button onClick={handlePinSubmit} className="w-full" disabled={!pin || pinAttempts >= maxPinAttempts}>
                            Buka Halaman
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
});

PinModal.displayName = 'PinModal';

export default PinModal;
