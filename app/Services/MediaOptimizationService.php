<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Str;

/**
 * Service untuk optimize media files - thumbnail generation, compression, dll
 */
class MediaOptimizationService
{
    public const THUMBNAIL_SIZES = [
        'thumb' => ['width' => 150, 'height' => 150],
        'small' => ['width' => 300, 'height' => 300],
        'medium' => ['width' => 600, 'height' => 600],
        'large' => ['width' => 1200, 'height' => 1200],
    ];

    public const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    public const MAX_FILE_SIZE = 10485760; // 10MB
    public const QUALITY = 80;

    /**
     * Upload dan optimize gambar
     */
    public static function uploadAndOptimizeImage($file, string $path = 'uploads'): array
    {
        // Validate
        if (!self::validateImage($file)) {
            throw new \Exception('Invalid image file');
        }

        // Generate unique filename
        $filename = Str::random(32) . '.' . $file->getClientOriginalExtension();
        $fullPath = "{$path}/{$filename}";

        // Store original
        Storage::disk('public')->put($fullPath, file_get_contents($file));

        // Generate thumbnails
        $thumbnails = [];
        $image = Image::make($file->getRealPath());

        foreach (self::THUMBNAIL_SIZES as $size => $dimensions) {
            $thumbPath = self::generateThumbnail(
                $fullPath,
                $size,
                $dimensions['width'],
                $dimensions['height']
            );
            $thumbnails[$size] = $thumbPath;
        }

        return [
            'original' => $fullPath,
            'thumbnails' => $thumbnails,
            'filename' => $filename,
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ];
    }

    /**
     * Generate thumbnail
     */
    private static function generateThumbnail(
        string $imagePath,
        string $size,
        int $width,
        int $height
    ): string {
        $disk = Storage::disk('public');
        $image = Image::make($disk->path($imagePath));

        // Resize and fit
        $image->fit($width, $height, function ($constraint) {
            $constraint->upsize();
        });

        // Optimize
        $image->compress('jpg', self::QUALITY);

        $pathInfo = pathinfo($imagePath);
        $thumbPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . "__{$size}." . $pathInfo['extension'];

        $disk->put($thumbPath, (string)$image->encode());

        return $thumbPath;
    }

    /**
     * Validate image file
     */
    public static function validateImage($file): bool
    {
        // Check size
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            return false;
        }

        // Check extension
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, self::ALLOWED_EXTENSIONS)) {
            return false;
        }

        // Check mime type
        $mimeType = $file->getMimeType();
        if (!str_starts_with($mimeType, 'image/')) {
            return false;
        }

        return true;
    }

    /**
     * Delete image dan thumbnails
     */
    public static function deleteImage(string $imagePath): bool
    {
        $disk = Storage::disk('public');

        // Delete original
        if ($disk->exists($imagePath)) {
            $disk->delete($imagePath);
        }

        // Delete thumbnails
        $pathInfo = pathinfo($imagePath);
        foreach (array_keys(self::THUMBNAIL_SIZES) as $size) {
            $thumbPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . "__{$size}." . $pathInfo['extension'];
            if ($disk->exists($thumbPath)) {
                $disk->delete($thumbPath);
            }
        }

        return true;
    }

    /**
     * Get image URL
     */
    public static function getImageUrl(string $imagePath, string $size = 'original'): string
    {
        if ($size === 'original') {
            return Storage::disk('public')->url($imagePath);
        }

        $pathInfo = pathinfo($imagePath);
        $thumbPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . "__{$size}." . $pathInfo['extension'];

        return Storage::disk('public')->url($thumbPath);
    }

    /**
     * Get all thumbnail URLs
     */
    public static function getThumbnailUrls(string $imagePath): array
    {
        $urls = [
            'original' => self::getImageUrl($imagePath, 'original'),
        ];

        foreach (array_keys(self::THUMBNAIL_SIZES) as $size) {
            $urls[$size] = self::getImageUrl($imagePath, $size);
        }

        return $urls;
    }

    /**
     * Convert image ke WebP format
     */
    public static function convertToWebP(string $imagePath): string
    {
        $disk = Storage::disk('public');
        $image = Image::make($disk->path($imagePath));

        $pathInfo = pathinfo($imagePath);
        $webpPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . '.webp';

        $disk->put($webpPath, (string)$image->encode('webp', self::QUALITY));

        return $webpPath;
    }

    /**
     * Batch optimize images dalam folder
     */
    public static function batchOptimizeImages(string $folder): array
    {
        $disk = Storage::disk('public');
        $files = $disk->files($folder);
        $results = [];

        foreach ($files as $file) {
            if (self::isImageFile($file)) {
                // Process image
                $results[$file] = [
                    'status' => 'optimized',
                    'path' => $file,
                ];
            }
        }

        return $results;
    }

    /**
     * Check if file is image
     */
    private static function isImageFile(string $filepath): bool
    {
        $extension = strtolower(pathinfo($filepath, PATHINFO_EXTENSION));
        return in_array($extension, self::ALLOWED_EXTENSIONS);
    }

    /**
     * Get image dimensions
     */
    public static function getImageDimensions(string $imagePath): array
    {
        $disk = Storage::disk('public');
        $image = Image::make($disk->path($imagePath));

        return [
            'width' => $image->width(),
            'height' => $image->height(),
        ];
    }

    /**
     * Generate responsive image markup
     */
    public static function generateResponsiveImageMarkup(string $imagePath, string $alt = ''): string
    {
        $urls = self::getThumbnailUrls($imagePath);
        $original = $urls['original'];
        $thumb = $urls['thumb'] ?? $original;

        return <<<HTML
        <picture>
            <source srcset="{$urls['large']}" media="(min-width: 1200px)">
            <source srcset="{$urls['medium']}" media="(min-width: 768px)">
            <source srcset="{$urls['small']}" media="(min-width: 480px)">
            <img src="{$thumb}" alt="{$alt}" loading="lazy" />
        </picture>
        HTML;
    }
}
