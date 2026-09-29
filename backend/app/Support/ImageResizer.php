<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Redimensionne une image uploadée (GD) avant stockage — extrait de
 * DocumentController::storeCover() pour être réutilisé par les photos de
 * profil/d'identité (AccountController). Sans ça, une photo prise
 * directement par un téléphone (souvent plusieurs Mo, largement plus
 * grande que nécessaire pour un avatar affiché au maximum à 96px) serait
 * re-téléchargée à sa taille originale à chaque affichage, partout dans
 * l'app — un poids inutile, surtout sur une connexion instable.
 */
class ImageResizer
{
    /**
     * @return string Le chemin stocké (disque "public"), au format JPEG.
     */
    public static function resizeAndStore(UploadedFile $file, string $directory, int $maxDimension, int $quality = 82): string
    {
        $source = match ($file->getMimeType()) {
            'image/png' => imagecreatefrompng($file->getRealPath()),
            'image/webp' => imagecreatefromwebp($file->getRealPath()),
            default => imagecreatefromjpeg($file->getRealPath()),
        };

        $width = imagesx($source);
        $height = imagesy($source);
        $scale = min(1, $maxDimension / max($width, $height));
        $newWidth = max(1, (int) round($width * $scale));
        $newHeight = max(1, (int) round($height * $scale));

        $resized = imagecreatetruecolor($newWidth, $newHeight);
        imagecopyresampled($resized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        imagedestroy($source);

        ob_start();
        imagejpeg($resized, null, $quality);
        $contents = ob_get_clean();
        imagedestroy($resized);

        $filename = trim($directory, '/').'/'.Str::uuid().'.jpg';
        Storage::disk('public')->put($filename, $contents);

        return $filename;
    }
}
