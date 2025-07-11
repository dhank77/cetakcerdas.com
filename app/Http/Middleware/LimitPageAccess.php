<?php

namespace App\Http\Middleware;

use App\Models\PageVisit;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class LimitPageAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->slug != '') {
            return $next($request);
        }

        $cookieName = 'visitor_id';
        $visitorId = $request->cookie($cookieName);

        if (!$visitorId) {
            $visitorId = uniqid('visitor_', true);
            Cookie::queue(Cookie::make($cookieName, $visitorId, 60 * 24 * 30));
        }

        $page = $request->path();
        $ip = $request->ip();
        $userAgent = substr($request->userAgent(), 0, 255);

        $visit = PageVisit::where('ip_address', $ip)
            ->where('page', $page)
            ->whereDate('created_at', now())
            ->first();

        if (!$visit) {
            $visit = PageVisit::create([
                'ip_address' => $ip,
                'page' => $page,
                'visitor_id' => $visitorId,
                'user_agent' => $userAgent,
                'visit_count' => 0,
            ]);
        }


        if ($visit->visit_count >= 5) {
            abort(429, 'Anda telah mencapai batas akses halaman ini.');
        }

        $visit->increment('visit_count');

        return $next($request);
    }
}
