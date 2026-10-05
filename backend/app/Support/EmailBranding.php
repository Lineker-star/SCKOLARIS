<?php

namespace App\Support;

final class EmailBranding
{
    public static function logoUrl(): string
    {
        return config('services.frontend.url').'/logo-sckolaris-email.png';
    }

    public static function logoHtml(): string
    {
        return '<div style="text-align:center;margin-bottom:20px"><img src="'.e(self::logoUrl()).'" alt="SCKOLARIS" style="width:88px;height:88px;border-radius:18px;display:inline-block" /></div>';
    }
}
