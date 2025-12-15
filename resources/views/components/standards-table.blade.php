@props(['standards'=> []])
<div class="row mb-12">
    <div class="col-6">
        <label class="fs-6 fw-bold mb-2">Norma</label>
        <select id="select_standard" class="form-select" data-control="select2" data-placeholder="Selecciona una norma" data-allow-clear="true">
            <option></option>
            @foreach ($standards as $standard)
                <option value="{{ $standard->id }}">{{ $standard->name }}</option>
            @endforeach
        </select>
        <div class="col-md-6 fv-row d-none">
            <input class="form-control form-control-solid" placeholder="Seleccione Fecha" id="edit_standards" name="edit_standards"/>
        </div>
    </div>
    <div class="col-4 fv-row">
        <label class="fs-6 fw-bold mb-2">Observaciones</label>
        <input type="text" class="form-control" placeholder="Ingresa alguna observación" name="observations" id="observations" />
    </div>
    <div class="col-2">
        <button class="btn btn-flex btn-light-success" id="btn_add_standard">
           <i class="ki-outline ki-plus fs-1"></i>
            </span>Agregar
        </button>
    </div>
</div>
<div class="row mb-12">
    <table class="table table-row-bordered gy-5" id="kt_standards_table">
        <thead>
            <tr class="text-start text-gray-400 fw-bolder fs-7 text-uppercase gs-0">
                <th class="">id</th>
                <th class="">Norma</th>
                <th class="">Observaciones</th>
                <th class="">Eliminar</th>
            </tr>
        </thead>
        <tbody class="fw-bold text-gray-600">

        </tbody>
    </table>
</div>
