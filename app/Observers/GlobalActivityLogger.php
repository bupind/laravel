<?php
/**
 * GlobalActivityLogger
 * @author  bupind
 * @created 2026-05-19
 */

namespace App\Observers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class GlobalActivityLogger
{
    public function created(Model $model)
    {
        $this->logActivity('created', $model);
    }

    protected function logActivity(string $action, Model $model, array $properties = [])
    {
        if($model->getTable() === 'activity_log') {
            return;
        }
        activity(class_basename($model))
            ->causedBy(Auth::user())
            ->performedOn($model)
            ->event($action)
            ->withProperties($properties ?: $model->getAttributes())
            ->log("{$action} " . class_basename($model));
    }

    public function updated(Model $model)
    {
        $this->logActivity('updated', $model, $model->getChanges());
    }

    public function deleted(Model $model)
    {
        $this->logActivity('deleted', $model);
    }
}
