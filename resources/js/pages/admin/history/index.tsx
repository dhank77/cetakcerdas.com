import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';
import { Clock, Eye, FileText, Printer } from 'lucide-react';

interface PrintHistoryItem {
    id: number;
    document_name: string;
    pages: number;
    copies: number;
    total_cost: number;
    status: string;
    created_at: string;
}

interface Props {
    history: PrintHistoryItem[];
}

const HistoryIndex = ({ history }: Props) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            completed: 'default',
            pending: 'secondary',
            failed: 'destructive',
        };

        return (
            <Badge variant={variants[status] || 'outline'}>{status === 'completed' ? 'Selesai' : status === 'pending' ? 'Menunggu' : 'Gagal'}</Badge>
        );
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Riwayat Print</h1>
                <p className="text-muted-foreground">Lihat riwayat semua dokumen yang telah dicetak</p>
            </div>

            <div className="grid gap-4">
                {history.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Printer className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">Belum ada riwayat print</h3>
                            <p className="text-center text-muted-foreground">
                                Riwayat print akan muncul di sini setelah Anda melakukan pencetakan dokumen.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    history.map((item) => (
                        <Card key={item.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <CardTitle className="text-base">{item.document_name}</CardTitle>
                                            <CardDescription className="mt-1 flex items-center space-x-4">
                                                <span>{item.pages} halaman</span>
                                                <span>•</span>
                                                <span>{item.copies} copy</span>
                                                <span>•</span>
                                                <span className="flex items-center">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    {formatDate(item.created_at)}
                                                </span>
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        {getStatusBadge(item.status)}
                                        <div className="text-right">
                                            <div className="font-semibold">{formatCurrency(item.total_cost)}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex justify-end">
                                    <Button variant="outline" size="sm">
                                        <Eye className="mr-2 h-4 w-4" />
                                        Detail
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

HistoryIndex.layout = (page: React.ReactElement) => (
    <AppSidebarLayout>
        <Head title="Riwayat Print" />
        {page}
    </AppSidebarLayout>
);

export default HistoryIndex;
