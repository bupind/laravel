"use strict"

import Catalogs from "./general.js"

const catalog = "variedades"
const catalog_item = "variedad"
const token = $('meta[name="csrf-token"]').attr('content')

let table_items,
    btn_modal,
    btn_add,
    btn_cancel,
    btn_submit,
    modal,
    validations,
    form,
    edit_id,
    edit_variedad,
    edit_nombre_cientifico,
    edit_active,
    check_active,
    select_tipo_cultivo,
    n

const edit = () => {
    n.querySelectorAll(
        '[data-kt-variedades-table-filter="edit"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            $.get("variedades/"+ $(this).data("id") + "/edit", function(data){
                edit_id.value=data.variedad.id
                edit_variedad.value=data.variedad.variedad
                edit_nombre_cientifico.value=data.variedad.nombre_cientifico
                if(data.variedad.activo){
                    check_active.checked = true
                    edit_active.value = 1
                }
                else{
                    check_active.checked = false
                    edit_active.value = 0
                }
                $("#tipo_cultivo_id").val(data.variedad.tipo_cultivo_id).trigger("change.select2")
                modal.show()
            })
        })
    })
}

export function init(){

    (modal = new bootstrap.Modal(
        document.querySelector("#kt_modal_add_variedad")
    )),
    // inicialize elements html
    (btn_add = document.querySelector("#btn_add")),
    (select_tipo_cultivo = $('#tipo_cultivo_id').select2()),
    (form = document.querySelector("#kt_modal_add_variedad_form")),
    (btn_modal = form.querySelector("#kt_modal_add_variedad_close")),
    (btn_submit = form.querySelector("#kt_modal_add_variedad_submit")),
    (btn_cancel = form.querySelector("#kt_modal_add_variedad_cancel")),
    (edit_id = form.querySelector("#id_variedad")),
    (edit_variedad = form.querySelector("#variedad")),
    (edit_nombre_cientifico = form.querySelector("#nombre_cientifico")),
    (check_active = form.querySelector("#check_activo")),
    (edit_active = form.querySelector("#activo")),
    (validations = FormValidation.formValidation(form, {
        fields: {
            variedad: {
                validators: {
                    notEmpty: {
                        message: "Nombre de la variedad es requerido",
                    },
                    stringLength: {
                        max:50,
                        message: "El nombre de la variedad debe tener menos de 50 caracteres"
                    }
                },
            },
            nombre_cientifico: {
                validators: {
                    notEmpty: {
                        message: "Nombre científico es requerido",
                    },
                    stringLength: {
                        max:50,
                        message: "El nombre científico debe tener menos de 50 caracteres"
                    }
                },
            },
            tipo_cultivo_id: {
                validators: {
                    notEmpty: {
                        message: 'Seleccione un tipo de cultivo'
                    }
                }
            },
        },
        plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap: new FormValidation.plugins.Bootstrap5({
                rowSelector: ".fv-row",
                eleInvalidClass: "is-invalid",
                eleValidClass: "is-valid",
            })
        },
    })),
    n = document.querySelector("#kt_variedades_table")
    table_items = $(n).DataTable({
        ajax: "variedades",
        processing: true,
        columns: [
            { data: "check", name: "check" },
            { data: "id", name: "id" },
            { data: "variedad", name: "variedad" },
            { data: "nombre_cientifico", name: "nombre_cientifico" },
            { data: "tipo_cultivo", name: "tipo_cultivo" },
            { data: "activos", name: "activos" },
            { data: "buttons", name: "buttons" },
        ],
        order: [[2, "asc"]],
        language: {
            zeroRecords: "<div class='container-fluid '> <div class='d-flex flex-center'>" +
            "<span>No hay datos que mostrar</span></div></div>",
            info: "Mostrando página _PAGE_ de _PAGES_",
            infoEmpty: "No hay información",
            infoFiltered: "(Filtrando _MAX_ registros)",
            processing: "<span class='loader'></span>",
        },
        drawCallback: function() {
            $('[data-bs-toggle="tooltip"]').tooltip();
        },
    }).on("draw", function () {
        Catalogs.delete_items(n, table_items, catalog, catalog_item, token), edit(), Catalogs.uncheck(n, catalog_item)
    })
    document.querySelector('[data-kt-variedad-table-filter="search"]').addEventListener("keyup", function (e) {
        table_items.search(e.target.value).draw()
    })
    select_tipo_cultivo.on('change', function(){
        validations.revalidateField('tipo_cultivo_id')
    })
    // CHECK ACTIVE
    check_active.addEventListener("click", function (t) {
        Catalogs.checked(edit_active, check_active)
    })
    // BUTTON ADD
    btn_add.addEventListener("click", function (t) {
        Catalogs.checked(edit_active, check_active)
        form.reset()
        $("#pais_id").val(null).trigger("change.select2")
        modal.show()
    })
    // CLOSE MODAL
    btn_modal.addEventListener("click", function (t) {
        t.preventDefault(), modal.hide()
    })
    // CLOSE MODAL
    btn_cancel.addEventListener("click", function (t) {
        t.preventDefault(), modal.hide()
    })
    // SUBMIT
    btn_submit.addEventListener("click", function (e) {
        e.preventDefault(),
        validations &&
        validations.validate().then(function (e) {
            "Valid" == e
                ? (btn_submit.setAttribute(
                        "data-kt-indicator",
                        "on"
                    ),
                    (btn_submit.disabled = !0),
                    setTimeout(function () {
                        btn_submit.removeAttribute(
                            "data-kt-indicator"
                        )
                        const formData = new FormData(document.querySelector(`#kt_modal_add_${catalog_item}_form`))
                        Catalogs.submit_form(catalog, formData, token, modal, table_items, btn_submit, form, validations)

                    }, 1000))
                : Swal.fire({
                        text: "Error, faltan algunos datos, intente de nuevo por favor.",
                        icon: "error",
                        buttonsStyling: !1,
                        confirmButtonText: "Entendido!",
                        customClass: {
                            confirmButton: "btn btn-primary",
                        },
                    })
        })
    })
}

document.addEventListener("DOMContentLoaded", function () {
    init()
})
