export interface PageDetail {
    halaman: number;
    jenis: 'hitam_putih' | 'warna' | 'foto';
    persentase_warna: number;
}

export interface AnalysisResult {
    file_url?: string;
    price_color: number;
    price_bw: number;
    price_photo: number;
    total_price: number;
    total_pages: number;
    color_pages: number;
    bw_pages: number;
    photo_pages: number;
    page_details: PageDetail[];
    pengaturan: {
        threshold_warna: string;
        threshold_foto: string;
        price_setting_color?: number;
        price_setting_bw?: number;
        price_setting_photo?: number;
    };
}