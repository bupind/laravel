<?php
/**
 * ApiController
 * @author  bupind
 * @created 2026-05-22
 */

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Api\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

abstract class ApiController extends Controller
{
    public function callAction($method, $parameters): mixed
    {
        $blocked = $this->runBehaviors(request(), $method);
        if($blocked instanceof JsonResponse) {
            return $blocked;
        }
        return $this->{$method}(...array_values($parameters));
    }

    protected function runBehaviors(Request $request, string $method): ?JsonResponse
    {
        foreach($this->behaviors() as $behavior) {
            if(!$this->behaviorAppliesTo($behavior, $method)) {
                continue;
            }
            $class = $behavior['class'] ?? null;
            if(!is_string($class) || $class === '') {
                continue;
            }
            $filter = app($class);
            if(!method_exists($filter, 'validate')) {
                continue;
            }
            $response = $filter->validate($request, $method, $behavior);
            if($response instanceof JsonResponse) {
                return $response;
            }
        }
        return null;
    }

    public function behaviors(): array
    {
        return [];
    }

    protected function behaviorAppliesTo(array $behavior, string $method): bool
    {
        $only = $behavior['only'] ?? [];
        if($only !== [] && !$this->methodInBehaviorList($method, $only)) {
            return false;
        }
        $except = $behavior['except'] ?? [];
        return !$this->methodInBehaviorList($method, $except);
    }

    protected function methodInBehaviorList(string $method, array $actions): bool
    {
        return in_array($method, $actions, true)
               || in_array(Str::kebab($method), $actions, true);
    }

    protected function respondList(string $name, mixed $data, string $message = 'Data successfully loaded.'): JsonResponse
    {
        return $this->respond($name, $message, 10001, 200, $data);
    }

    protected function respond(
        string $name,
        string $message,
        int    $code = 10001,
        int    $status = 200,
        mixed  $data = [],
        ?float $requestTime = null,
        array  $extra = [],
    ): JsonResponse
    {
        return ApiResponse::make($name, $message, $code, $status, $data, $requestTime, $extra);
    }

    protected function respondForm(string $name, array $schema, mixed $record = null, string $message = 'Form successfully loaded.'): JsonResponse
    {
        return $this->respond($name, $message, 10005, 200, [
            'Record' => $record,
            'Form'   => $schema,
        ]);
    }

    protected function respondCreated(string $name, mixed $data, string $message = 'Data successfully created.'): JsonResponse
    {
        return $this->respond($name, $message, 10002, 201, $data);
    }

    protected function respondUpdated(string $name, mixed $data, string $message = 'Data successfully updated.'): JsonResponse
    {
        return $this->respond($name, $message, 10003, 200, $data);
    }

    protected function respondDeleted(string $name, string $message = 'Data successfully deleted.'): JsonResponse
    {
        return $this->respond($name, $message, 10004, 200, []);
    }
}
