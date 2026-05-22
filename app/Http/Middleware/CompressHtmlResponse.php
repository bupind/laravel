<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * CompressHtmlResponse
 * @author bupind
 * @created 2026-05-19
 */
class CompressHtmlResponse
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $content = $response->getContent();

        if (! is_string($content) || trim($content) === '') {
            return $response;
        }

        if (! $this->shouldCompress($response, $content)) {
            return $response;
        }

        $response->setContent($this->compress($content));

        return $response;
    }

    private function shouldCompress(Response $response, string $content): bool
    {
        if (! $response->isSuccessful()) {
            return false;
        }

        $contentType = (string) $response->headers->get('Content-Type', '');

        return str_contains($contentType, 'text/html')
            || ($contentType === '' && str_starts_with(ltrim($content), '<'));
    }

    private function compress(string $html): string
    {
        $blocks = [];
        $html = preg_replace_callback(
            '#<(script|style|pre|textarea)\b[^>]*>.*?</\1>#is',
            static function (array $matches) use (&$blocks): string {
                $key = '___HTML_COMPRESS_BLOCK_' . count($blocks) . '___';
                $blocks[$key] = $matches[0];

                return $key;
            },
            $html
        ) ?? $html;

        $html = preg_replace('/>\s+</', '><', $html) ?? $html;
        $html = preg_replace('/[ \t\r\n]+/', ' ', $html) ?? $html;
        $html = trim($html);

        return strtr($html, $blocks);
    }
}
