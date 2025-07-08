import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { formatCurrency } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { Download, Eye, FileText } from 'lucide-react';

interface Booking {
    id: number;
    name: string;
    whatsapp: string;
    file_name: string;
    file_url: string;
    file_type: string;
    total_price: number;
    total_pages: number;
    bw_pages: number;
    color_pages: number;
    photo_pages: number;
    timestamp_id: string;
    user_name: string;
    created_at: string;
}

interface Props {
    bookings: Booking[];
}

const BookingsIndex = ({ bookings }: Props) => {
    const handleDownload = (fileUrl: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePreview = (fileUrl: string) => {
        window.open(fileUrl, '_blank');
    };

    return (
        <div className="space-6 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className='flex flex-col gap-y-4'>
                    <h1 className="text-3xl font-bold tracking-tight">Kiriman Pelanggan</h1>
                    <p className="text-muted-foreground">Kelola file yang dikirim pelanggan untuk dicetak</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Daftar Kiriman File
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {bookings.length === 0 ? (
                        <div className="py-8 text-center">
                            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">Belum ada kiriman file dari pelanggan</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Nama Pelanggan</TableHead>
                                        <TableHead>WhatsApp</TableHead>
                                        <TableHead>Pemilik Toko</TableHead>
                                        <TableHead>File</TableHead>
                                        <TableHead>Total Halaman</TableHead>
                                        <TableHead>Detail Halaman</TableHead>
                                        <TableHead>Total Harga</TableHead>
                                        <TableHead>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-medium">{booking.created_at}</TableCell>
                                            <TableCell>{booking.name}</TableCell>
                                            <TableCell>
                                                <a
                                                    href={`https://wa.me/${booking.whatsapp.replace(/^0/, '62')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 underline hover:text-green-800"
                                                >
                                                    {booking.whatsapp}
                                                </a>
                                            </TableCell>
                                            <TableCell>{booking.user_name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">
                                                        {booking.file_type === 'application/pdf' ? 'PDF' : booking.file_type}
                                                    </Badge>
                                                    <span className="max-w-[150px] truncate text-sm text-muted-foreground">{booking.file_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{booking.total_pages} halaman</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-sm">
                                                    {booking.bw_pages > 0 && <div>BW: {booking.bw_pages}</div>}
                                                    {booking.color_pages > 0 && <div>Color: {booking.color_pages}</div>}
                                                    {booking.photo_pages > 0 && <div>Photo: {booking.photo_pages}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-green-600">{formatCurrency(booking.total_price)}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handlePreview(booking.file_url)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDownload(booking.file_url, booking.file_name)}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

BookingsIndex.layout = (page: React.ReactElement) => (
    <AppSidebarLayout>
        <Head title="Kiriman Pelanggan" />
        {page}
    </AppSidebarLayout>
);

export default BookingsIndex;
