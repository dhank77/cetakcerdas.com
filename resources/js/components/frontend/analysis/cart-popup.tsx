import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { ShoppingCart, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useState, useRef } from 'react';

interface CartItem {
    id: string;
    fileName: string;
    totalPrice: number;
    totalPages: number;
    bwPages: number;
    colorPages: number;
    photoPages: number;
    priceBw: number;
    priceColor: number;
    pricePhoto: number;
    timestamp: number;
}

interface CartPopupProps {
    isVisible: boolean;
    onClose: () => void;
    onFinish: () => void;
}

const CartPopup: React.FC<CartPopupProps> = ({ isVisible, onClose, onFinish }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Load cart from localStorage
    useEffect(() => {
        const loadCartItems = () => {
            const savedCart = localStorage.getItem('printCart');
            if (savedCart) {
                setCartItems(JSON.parse(savedCart));
            } else {
                setCartItems([]);
            }
        };

        loadCartItems();

        // Listen for storage changes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'printCart') {
                loadCartItems();
            }
        };

        // Listen for custom cart update events
        const handleCartUpdate = () => {
            loadCartItems();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('cartUpdated', handleCartUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, [isVisible]);

    const handleFinish = useCallback(() => {
        const currentCart = localStorage.getItem('printCart');
        const currentCartItems = currentCart ? JSON.parse(currentCart) : [];
        
        router.post(
            route('print.order'),
            {
                items: JSON.stringify(currentCartItems),
                url: window.location.href,
            },
            {
                onSuccess: () => {
                    localStorage.removeItem('printCart');
                    setCartItems([]);
                    if (timerRef.current) {
                        clearTimeout(timerRef.current);
                        timerRef.current = null;
                    }
                    onFinish();
                },
            },
        );
    }, [onFinish]);

    // Auto close after 1 minute
    useEffect(() => {
        // Clear existing timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (isVisible && cartItems.length > 0) {
            timerRef.current = setTimeout(
                () => {
                    handleFinish();
                    console.log('Cart auto closed');
                },
                1 * 60 * 1000,
            ); // 1 minute
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isVisible, cartItems.length, handleFinish]);

    const removeItem = (id: string) => {
        const updatedItems = cartItems.filter((item) => item.id !== id);
        setCartItems(updatedItems);
        localStorage.setItem('printCart', JSON.stringify(updatedItems));

        // Auto close if cart becomes empty
        if (updatedItems.length === 0) {
            setTimeout(() => {
                onClose();
            }, 500);
        }
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + item.totalPrice, 0);
    };

    const getTotalPages = () => {
        return cartItems.reduce((total, item) => total + item.totalPages, 0);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 max-h-96 w-80 overflow-hidden">
            <Card className="border-2 border-green-200 shadow-lg dark:border-green-800">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Keranjang Cetak
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
                            <X className="h-3 w-3" />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {cartItems.length === 0 ? (
                        <div className="py-4 text-center text-sm text-gray-500">Keranjang kosong</div>
                    ) : (
                        <>
                            <div className="max-h-40 space-y-2 overflow-y-auto">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between rounded bg-gray-50 p-2 text-xs dark:bg-gray-800">
                                        <div className="flex-1">
                                            <div className="truncate font-medium">{item.fileName}</div>
                                            <div className="text-gray-500">
                                                {item.totalPages} hal • Rp {item.totalPrice.toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeItem(item.id)}
                                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Total ({getTotalPages()} halaman):</span>
                                    <span className="text-green-600 dark:text-green-400">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <Button onClick={handleFinish} className="w-full bg-green-600 text-white hover:bg-green-700" size="sm">
                                Selesai Pesanan
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CartPopup;
