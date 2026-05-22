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
}
