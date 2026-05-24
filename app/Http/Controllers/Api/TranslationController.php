<?php
/**
 * TranslationController
 * @author  bupind
 * @created 2026-05-21
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Translations\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TranslationController extends Controller
{
    public function __invoke(Request $request, TranslationService $translations): JsonResponse
    {
        $locale     = $request->string('locale', 'id')->toString();
        $scope      = $request->string('scope', 'frontend')->toString();
        $namespaces = $request->filled('namespaces')
            ? explode(',', $request->string('namespaces')->toString())
            : null;
        return response()->json([
            'locale'     => $locale,
            'scope'      => $scope,
            'namespaces' => $namespaces,
            'messages'   => $translations->getMessages($locale, $scope, $namespaces),
        ]);
    }

    public function resolve(Request $request, TranslationService $translations): JsonResponse
    {
        $locale = $request->string('locale', 'id')->toString();
        $scope  = $request->string('scope', 'frontend')->toString();
        $keys   = $request->input('keys', []);
        if(is_string($keys)) {
            $keys = array_filter(array_map('trim', explode(',', $keys)));
        }
        if(!is_array($keys)) {
            $keys = [];
        }
        return response()->json($translations->resolveKeys($locale, $scope, $keys));
    }
}
