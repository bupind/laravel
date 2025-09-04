<?php

namespace App\Http\Controllers\Backend;

use App\Models\PurchaseStatus;
use Crud\Backend\Controllers\BackendController;
use Crud\Backend\Form;
use Crud\Backend\Grid;
use Crud\Backend\Show;

class PurchaseStatusController extends BackendController
{
    protected string $title = 'Purchase Status';

    protected function grid(): Grid
    {
        $grid = new Grid(new PurchaseStatus());
        $grid->column('currentStatus', 'Current Status')->sortable();
        $grid->column('status', 'Status')->sortable();
        $grid->column('latestStatus', 'Latest Status')->sortable();
        $grid->filter(function($filter) {
            $filter->disableIdFilter();
            $filter->like('currentStatus', 'Current Status');
            $filter->equal('status', 'Status')->select([
                'pending'   => 'Pending',
                'active'    => 'Active',
                'completed' => 'Completed',
                'decline'   => 'Decline',
                'on-hold'   => 'On-Hold',
                'cancelled' => 'Cancelled',
                'refunded'  => 'Refunded',
                'failed'    => 'Failed',
                'trash'     => 'Trash',
            ]);
            $filter->equal('latestStatus', 'Latest Status');
        });
        return $grid;
    }

    protected function detail($id): Show
    {
        $show = new Show(PurchaseStatus::findOrFail($id));
        $show->field('currentStatus', 'Current Status');
        $show->field('status', 'Status');
        $show->field('latestStatus', 'Latest Status');
        return $show;
    }

    protected function form(): Form
    {
        $form = new Form(new PurchaseStatus());
        $form->text('currentStatus', 'Current Status');
        $form->text('status', 'Status');
        $form->text('latestStatus', 'Latest Status');
        return $form;
    }
}
