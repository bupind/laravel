"use strict"

import Catalogs from "./general.js"

const catalog_fat = "estados"
const catalog_fat2 = "municipios"
const catalog = "puertos"
const catalog_item = "puerto"
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
    edit_puerto,
    edit_nombre_corto,
    edit_transporte,
    edit_active,
    edit_placas,
    check_active,
    check_placas,
    select_pais,
    select_estado,
    select_estado2,
    select_municipio,
    var_pais = 0,
    var_estado = 0,
    var_municipio = 0,
    n

const edit = () => {
    n.querySelectorAll(
        '[data-kt-puerto-table-filter="edit"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            $.get("puertos/"+ $(this).data("id") + "/edit", function(data){
                edit_id.value=data.puerto[0].id
                edit_puerto.value=data.puerto[0].puerto
                edit_nombre_corto.value=data.puerto[0].nombre_corto
                edit_transporte.value=data.puerto[0].medio_transporte
                Catalogs.checked_edit(data.puerto[0].placas, edit_placas, check_placas)
                Catalogs.checked_edit(data.puerto[0].activo, edit_active, check_active)
                $("#medio_transporte").val(data.puerto[0].medio_transporte).trigger("change.select2")

                $("#pais_id").val(data.puerto[0].pais_id).trigger("change.select2")
                var_pais = data.puerto[0].pais_id
                var_estado = data.puerto[0].estado_id
                var_municipio = data.puerto[0].municipio_id
                select_pais.trigger('change');
                $("#estado_id").val(data.puerto[0].estado_id).trigger("change.select2")
                select_estado.trigger('change');
                var_pais = 0
                 var_estado = 0
                 var_municipio = 0
                modal.show()
            })
        })
    })
}
export function init(){
    modal = new bootstrap.Modal(document.querySelector("#kt_modal_add_puerto"))
    // inicialize elements html
    select_pais = $('#pais_id').select2()
    select_estado = $('#estado_id').select2()
    select_estado2 = document.querySelector("#estado_id")
    select_municipio = document.querySelector("#municipio_id")
    btn_add = document.querySelector("#btn_add")
    form = document.querySelector("#kt_modal_add_puerto_form")
    btn_modal = form.querySelector("#kt_modal_add_puerto_close")
    btn_submit = form.querySelector("#kt_modal_add_puerto_submit")
    btn_cancel = form.querySelector("#kt_modal_add_puerto_cancel")
    edit_id = form.querySelector("#id_puerto")
    edit_puerto = form.querySelector("#puerto")
    edit_nombre_corto = form.querySelector("#nombre_corto")
    edit_transporte = form.querySelector("#medio_transporte")
    check_active = form.querySelector("#check_activo")
    check_placas = form.querySelector("#check_placas")
    edit_active = form.querySelector("#activo")
    edit_placas = form.querySelector("#placas")
    validations = FormValidation.formValidation(form, {
        fields: {
            pais_id: {
                validators: {
                    notEmpty: {
                        message: "Seleccione un país",
                    },
                },
            },
            estado_id: {
                validators: {
                    notEmpty: {
                        message: "Seleccione un estado",
                    },
                },
            },
            municipio_id: {
                validators: {
                    notEmpty: {
                        message: "Seleccione un municipio",
                    },
                },
            },
            puerto: {
                validators: {
                    notEmpty: {
                        message: "Ingrese el puerto",
                    },
                    stringLength: {
                        max: 50,
                        message: "El puerto debe tener menos de 50 caracteres",
                    }
                },
            },
            medio_transporte: {
                validators: {
                    notEmpty: {
                        message: "Seleccione el medio de transporte",
                    },
                },
            },
        },
        plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap: new FormValidation.plugins.Bootstrap5({
                rowSelector: ".fv-row",
                eleInvalidClass: "is-invalid",
                eleValidClass: "is-valid",
            }),
        },
    })
    n = document.querySelector("#kt_puertos_table")
    table_items = $(n).DataTable({
        ajax: "puertos",
        serverSide: true,
        processing: true,
        columns: [
            { data: "check", name: "check" },
            { data: "buttons", name: "buttons" },
            { data: "id", name: "id" },
            { data: "puerto", name: "puerto" },
            { data: "pais", name: "pais" },
            { data: "estado", name: "estado" },
            { data: "municipio", name: "municipio" },
            { data: "nombre_corto", name: "nombre_corto" },
            { data: "medio_transporte", name: "medio_transporte" },
            { data: "placas", name: "placas" },
            { data: "activos", name: "activos" },
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
    document.querySelector('[data-kt-puerto-table-filter="search"]').addEventListener("keyup", function (e) {
        table_items.search(e.target.value).draw()
    })

    // CHECK ACTIVE
    check_active.addEventListener("click", function (t) {
        Catalogs.checked(edit_active, check_active)
    })
        // CHECK INSPECTOR
    check_placas.addEventListener("click", function (t) {
        Catalogs.checked(edit_placas, check_placas)
    })
    // BUTTON ADD
    btn_add.addEventListener("click", function (t) {
        Catalogs.checked(edit_active, check_active)
        form.reset()
        $("#pais_id").val(null).trigger("change.select2")
        $("#estado_id").val(null).trigger("change.select2")
        $("#municipio_id").val(null).trigger("change.select2")
        $("#medio_transporte").val(null).trigger("change.select2")
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
    // CHANGE PAIS
    select_pais.on('change', function() {
        validations.revalidateField('pais_id')
        validations.disableValidator('estado_id')
        validations.disableValidator('municipio_id')
        validations.disableValidator('medio_transporte')
        let pais_change = 0;
        if (var_pais == 0) {
            pais_change = select_pais.val()
        }
        else{
            pais_change = var_pais
        }
        Catalogs.get_next_selects(catalog_fat, pais_change, select_estado, var_estado)
    })
    // CHANGE ESTADO
    select_estado.on('change', function() {
        const select_estado2 = $('#municipio_id').select2()
        let estado_id_changue
        if (var_estado == 0) {
            estado_id_changue = select_estado.val()
            }
        else{
            estado_id_changue = var_estado
        }
        Catalogs.get_next_selects(catalog_fat2, estado_id_changue, select_estado2, var_municipio)
    })
    // SUBMIT
    btn_submit.addEventListener("click", function (e) {
        e.preventDefault()
        validations.enableValidator('estado_id')
        validations.enableValidator('municipio_id')
        validations.enableValidator('medio_transporte')
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
