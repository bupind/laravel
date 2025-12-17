<form method="POST" action="{{ route($route . '.import.store') }}" enctype="multipart/form-data">
    @csrf
    <div class="mb-3">
        <label>File Import</label> <input type="file" name="file" class="form-control" required>
    </div>

    <a href="{{ $template }}" class="btn btn-sm btn-outline-primary"> Download Template </a>

    <button class="btn btn-primary float-end">
        Import
    </button>
</form>
