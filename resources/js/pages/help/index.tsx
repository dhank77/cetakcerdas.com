import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageCircle } from 'lucide-react';

const Index = () => {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6 overflow-x-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Pusat Bantuan</h1>
                <p className="text-muted-foreground">
                    Temukan jawaban atas pertanyaan Anda atau hubungi kami untuk bantuan lebih lanjut.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <a
                    href="mailto:support@cetakcerdas.com"
                    className="block transform transition-all duration-300 hover:scale-[1.02] group"
                >
                    <Card className="h-full border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Email Support</CardTitle>
                            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-2">
                                support@cetakcerdas.com
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                Kirimkan pertanyaan atau masalah Anda melalui email.
                            </p>
                        </CardContent>
                    </Card>
                </a>

                <a
                    href="https://wa.me/6282396151291"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transform transition-all duration-300 hover:scale-[1.02] group"
                >
                    <Card className="h-full border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 hover:shadow-lg hover:shadow-green-200/50 dark:hover:shadow-green-900/30 transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">WhatsApp Support</CardTitle>
                            <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                                +62 823-9615-1291
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400">
                                Hubungi kami melalui WhatsApp untuk respon cepat.
                            </p>
                        </CardContent>
                    </Card>
                </a>
            </div>
        </div>
    );
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bantuan',
        href: '#',
    },
];

Index.layout = (page: React.ReactElement) => (
    <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Bantuan" />
        {page}
    </AppLayout>
);

export default Index;
