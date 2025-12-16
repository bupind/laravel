<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class MakeCrudCommand extends Command
{
    protected      $signature   = 'make:crud {name}';
    protected      $description = 'Scaffold a new CRUD resource.';
    protected bool $replaceAll  = false;

    public function handle()
    {
        $name   = Str::studly($this->argument('name'));
        $paths  = [
            app_path("Http/Controllers/{$name}Controller.php"),
            app_path("Repositories/{$name}Repository.php"),
            app_path("Http/Requests/{$name}Request.php"),
            app_path("Models/{$name}.php"),
            database_path("migrations/*_create_" . Str::plural(Str::snake($name)) . "_table.php")
        ];
        $exists = false;
        foreach($paths as $path) {
            if(Str::contains($path, '*')) {
                $files = glob($path);
                if(!empty($files)) {
                    $exists = true;
                    break;
                }
            } elseif(File::exists($path)) {
                $exists = true;
                break;
            }
        }
        if($exists) {
            $this->replaceAll = $this->confirm("Module {$name} already exists. Replace all files?", false);
            if(!$this->replaceAll) {
                $this->warn("Skipped module {$name}.");
                return;
            }
        }
        $this->createController($name);
        $this->createRepository($name);
        $this->createRequest($name);
        $this->createModel($name);
        $this->createMigration($name);
        $this->createRoutes($name);
        $this->info("Module {$name} created successfully.");
    }

    protected function createController($name)
    {
        $path = app_path("Http/Controllers/{$name}Controller.php");
        $this->createFile($name, $path, 'controller');
    }

    protected function createFile($name, $path, $stubName)
    {
        if(File::exists($path)) {
            if(!$this->replaceAll) {
                $this->warn("Skipped existing file: {$path}");
                return;
            }
            $this->info("Replacing existing file: {$path}");
        }
        $stub      = File::get(base_path("resources/stubs/{$stubName}.stub"));
        $stub      = Str::replace('{{name}}', $name, $stub);
        $directory = File::dirname($path);
        if(!File::isDirectory($directory)) {
            File::makeDirectory($directory, 0755, true, true);
        }
        File::put($path, $stub);
    }

    protected function createRepository($name)
    {
        $path = app_path("Repositories/{$name}Repository.php");
        $this->createFile($name, $path, 'repository');
    }

    protected function createRequest($name)
    {
        $path = app_path("Http/Requests/{$name}Request.php");
        $this->createFile($name, $path, 'request');
    }

    protected function createModel($name)
    {
        $path = app_path("Models/{$name}.php");
        $this->createFile($name, $path, 'model');
    }

    protected function createMigration($name)
    {
        $tableName     = Str::plural(Str::snake($name));
        $migrationName = "create_{$tableName}_table";
        $timestamp     = now()->format('Y_m_d_His');
        $path          = database_path("migrations/{$timestamp}_{$migrationName}.php");
        if($this->replaceAll) {
            $oldMigrations = glob(database_path("migrations/*_{$migrationName}.php"));
            foreach($oldMigrations as $file) {
                File::delete($file);
                $this->info("Deleted old migration: {$file}");
            }
        }
        $stub = File::get(base_path("resources/stubs/migration.stub"));
        $stub = Str::replace('{{tableName}}', $tableName, $stub);
        File::put($path, $stub);
    }

    protected function createRoutes($name)
    {
        $routePath = base_path('routes/backend.php');
        if(!File::exists($routePath)) {
            $this->error('routes/backend.php not found!');
            return;
        }
        $slug          = Str::kebab($name);
        $controller    = "{$name}Controller";
        $routeBlock    = <<<PHP
            // {$name}
            Route::prefix('{$slug}')->name('{$slug}.')->group(function () {
                Route::get('datatable', [\\App\\Http\\Controllers\\{$controller}::class, 'datatable'])->name('datatable');
                Route::get('export/{format?}', [\\App\\Http\\Controllers\\{$controller}::class, 'export'])->name('export');
                Route::post('bulk', [\\App\\Http\\Controllers\\{$controller}::class, 'bulk'])->name('bulk');
                Route::resource('/', \\App\\Http\\Controllers\\{$controller}::class)->parameters(['' => '{$slug}']);
            });
            PHP;
        $content       = File::get($routePath);
        $escapedName   = preg_quote($name, '/');
        $escapedPlural = preg_quote($slug, '/');
        $pattern       = "/\/\/ {$escapedName}[\\s\\S]*?Route::resource\\('{$escapedPlural}',[\\s\\S]*?\\);/";
        if(preg_match($pattern, $content)) {
            if(!$this->replaceAll) {
                $this->warn("Skipped routes for {$name}.");
                return;
            }
            $content = preg_replace($pattern, trim($routeBlock), $content);
            File::put($routePath, $content);
            $this->info("Routes for {$name} replaced.");
            return;
        }
        File::append($routePath, $routeBlock);
        $this->info("Routes for {$name} created.");
    }
}
