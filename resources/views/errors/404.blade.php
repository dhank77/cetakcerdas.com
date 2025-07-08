@extends('errors::minimal')

@section('title', __('Halaman Tidak Ditemukan'))
@section('code', '404')
@section('message', __('Halaman Tidak Ditemukan'))
@section('description', __('Maaf, Halaman yang Anda cari tidak dapat ditemukan. Mungkin telah dihapus, namanya diubah, atau tidak pernah ada.'))
@section('icon')
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M10 10h.01M14 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
@endsection
