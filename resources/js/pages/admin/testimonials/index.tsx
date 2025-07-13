import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link } from '@inertiajs/react';
import { Check, Clock, Eye, Mail, MessageSquare, Star, TrendingUp, User, X } from 'lucide-react';

interface Testimonial {
    id: number;
    customer_name: string;
    customer_email: string;
    rating: number;
    title: string;
    content: string;
    status: string;
    created_at: string;
}

interface Stats {
    total_testimonials: number;
    approved_testimonials: number;
    pending_testimonials: number;
    average_rating: number;
}

interface Props {
    testimonials: Testimonial[];
    stats: Stats;
}

const TestimonialsIndex = ({ testimonials, stats }: Props) => {
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
            approved: 'default',
            pending: 'secondary',
            rejected: 'destructive',
        };

        const labels: Record<string, string> = {
            approved: 'Disetujui',
            pending: 'Menunggu',
            rejected: 'Ditolak',
        };

        return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`h-4 w-4 ${star <= rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">({rating}/5)</span>
            </div>
        );
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Testimoni</h1>
                <p className="text-muted-foreground">Kelola testimoni dan ulasan dari pelanggan</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Testimoni</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_testimonials}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
                        <Check className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.approved_testimonials}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending_testimonials}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rating Rata-rata</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.average_rating}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Testimonials List */}
            <div className="grid gap-4">
                {testimonials.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">Belum ada testimoni</h3>
                            <p className="text-center text-muted-foreground">Testimoni dari pelanggan akan muncul di sini.</p>
                        </CardContent>
                    </Card>
                ) : (
                    testimonials.map((testimonial) => (
                        <Card key={testimonial.id}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-2 flex items-center space-x-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">{testimonial.customer_name}</CardTitle>
                                                <CardDescription className="flex items-center space-x-2">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{testimonial.customer_email}</span>
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="mb-2">{renderStars(testimonial.rating)}</div>
                                        <h4 className="mb-2 font-semibold">{testimonial.title}</h4>
                                        <p className="line-clamp-3 text-sm text-muted-foreground">{testimonial.content}</p>
                                    </div>
                                    <div className="flex items-center space-x-3">{getStatusBadge(testimonial.status)}</div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="mr-1 h-3 w-3" />
                                        {formatDate(testimonial.created_at)}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {testimonial.status === 'pending' && (
                                            <>
                                                <Button variant="outline" size="sm">
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Setujui
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <X className="mr-2 h-4 w-4" />
                                                    Tolak
                                                </Button>
                                            </>
                                        )}
                                        <Link href={route('testimonials.show', testimonial.id)}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="mr-2 h-4 w-4" />
                                                Detail
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

TestimonialsIndex.layout = (page: React.ReactElement) => (
    <AppSidebarLayout>
        <Head title="Testimoni" />
        {page}
    </AppSidebarLayout>
);

export default TestimonialsIndex;
