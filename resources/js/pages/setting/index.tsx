import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Setting } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AlertCircle, Lock } from 'lucide-react';

interface Props {
    setting: Setting | null;
}

const Index = ({ setting }: Props) => {
    const isProMember = false;

    const { data, setData, post, processing, errors, reset } = useForm({
        bw_price: setting?.bw_price || 0,
        color_price: setting?.color_price || 0,
        photo_price: setting?.photo_price || 0,
        threshold_color: setting?.threshold_color || 20,
        threshold_photo: setting?.threshold_photo || 50,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (setting) {
            post(route('setting.update', setting.id));
        } else {
            post(route('setting.store'));
        }
    };

    return (
        <div className="mx-auto my-10 max-w-4xl space-y-6">
            {!isProMember && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Beberapa pengaturan hanya tersedia untuk member pro. Upgrade akun Anda untuk mengakses semua fitur.
                    </AlertDescription>
                </Alert>
            )}

            <Card className='min-w-4xl'>
                <CardHeader>
                    <CardTitle>Pengaturan Harga</CardTitle>
                    <CardDescription>Atur harga per halaman untuk berbagai jenis dokumen</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="bw_price">Harga Hitam Putih (per halaman)</Label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500">Rp</span>
                                    <Input
                                        id="bw_price"
                                        type="number"
                                        step="25"
                                        min="0"
                                        value={data.bw_price}
                                        onChange={(e) => setData('bw_price', parseFloat(e.target.value) || 0)}
                                        className="pl-10"
                                        placeholder="0"
                                    />
                                </div>
                                <InputError message={errors.bw_price} />
                            </div>

                            {/* Harga Warna */}
                            <div className="space-y-2">
                                <Label htmlFor="color_price">Harga Warna (per halaman)</Label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500">Rp</span>
                                    <Input
                                        id="color_price"
                                        type="number"
                                        step="25"
                                        min="0"
                                        value={data.color_price}
                                        onChange={(e) => setData('color_price', parseFloat(e.target.value) || 0)}
                                        className="pl-10"
                                        placeholder="0"
                                    />
                                </div>
                                <InputError message={errors.color_price} />
                            </div>

                            {/* Harga Foto - Pro Only */}
                            <div className="space-y-2">
                                <Label htmlFor="photo_price" className="flex items-center gap-2">
                                    Harga Foto (per halaman)
                                    {!isProMember && <Lock className="h-4 w-4 text-gray-400" />}
                                </Label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-500">Rp</span>
                                    <Input
                                        id="photo_price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.photo_price || 0}
                                        onChange={(e) => setData('photo_price', parseFloat(e.target.value) || 0)}
                                        className="pl-10"
                                        placeholder="0"
                                        disabled={!isProMember}
                                    />
                                </div>
                                <InputError message={errors.photo_price} />
                                {!isProMember && <p className="text-sm text-gray-500">Fitur ini hanya tersedia untuk member pro</p>}
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="mb-4 text-lg font-medium">Pengaturan Threshold</h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Threshold Warna - Pro Only */}
                                <div className="space-y-2">
                                    <Label htmlFor="threshold_color" className="flex items-center gap-2">
                                        Threshold Warna (%)
                                        {!isProMember && <Lock className="h-4 w-4 text-gray-400" />}
                                    </Label>
                                    <Input
                                        id="threshold_color"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={data.threshold_color || 20}
                                        onChange={(e) => setData('threshold_color', parseFloat(e.target.value) || 20)}
                                        placeholder="20"
                                        disabled={!isProMember}
                                    />
                                    <InputError message={errors.threshold_color} />
                                    {!isProMember && <p className="text-sm text-gray-500">Fitur ini hanya tersedia untuk member pro</p>}
                                </div>

                                {/* Threshold Foto - Pro Only */}
                                <div className="space-y-2">
                                    <Label htmlFor="threshold_photo" className="flex items-center gap-2">
                                        Threshold Foto (%)
                                        {!isProMember && <Lock className="h-4 w-4 text-gray-400" />}
                                    </Label>
                                    <Input
                                        id="threshold_photo"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={data.threshold_photo || 50}
                                        onChange={(e) => setData('threshold_photo', parseFloat(e.target.value) || 50)}
                                        placeholder="50"
                                        disabled={!isProMember}
                                    />
                                    <InputError message={errors.threshold_photo} />
                                    {!isProMember && <p className="text-sm text-gray-500">Fitur ini hanya tersedia untuk member pro</p>}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 border-t pt-6">
                            <Button type="button" variant="outline" onClick={() => reset()} disabled={processing}>
                                Reset
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan',
        href: '#',
    },
];

Index.layout = (page: React.ReactElement) => (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Pengaturan" />
        {page}
    </AppLayout>
);

export default Index;
