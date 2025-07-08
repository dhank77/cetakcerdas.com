@extends('errors::minimal')

@section('title', __('Terjadi kesalahan'))
@section('code', '500')
@section('message', __('Terjadi kesalahan'))
@section('description', __('Mohon maaf, terjadi gangguan pada sistem kami. Tim kami sedang bekerja keras untuk memperbaikinya. Silakan coba lagi nanti.'))
@section('icon')
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
@endsection
