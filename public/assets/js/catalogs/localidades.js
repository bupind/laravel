"use strict"

import Catalogs from "./general.js"

const catalog_fat = "estados"
const catalog = "localidades"
const catalog_item = "localidad"
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
    edit_nombre,
    edit_nombre_corto,
    edit_codigo,
    edit_active,
    check_active,
    select_pais,
    select_estado,
    select_municipio,
    var_estado = 0,
    var_municipio = 0,
    n

const edit = () => {
    n.querySelectorAll(
        '[data-kt-localidad-table-filter="edit"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            $.get("localidades/"+ $(this).data("id") + "/edit", function(data){
                edit_id.value = data.localidad[0].id
                edit_nombre.value = data.localidad[0].nombre
                edit_nombre_corto.value = data.localidad[0].nombre_corto
                edit_codigo.value = data.localidad[0].codigo
                if(data.localidad[0].activo){
                    check_active.checked = true
                    edit_active.value = 1
                }
                else{
                    check_active.checked = false
                    edit_active.value = 0
                }
                // CHANGE ESTADO
                $("#pais_id").val(data.localidad[0].pais_id).trigger("change.select2")
                var_estado = data.localidad[0].estado_id
                select_pais.trigger('change');
                // CHANGE MUNICIPIO
                $("#estado_id").val(data.localidad[0].estado_id).trigger("change.select2")
                var_municipio = data.localidad[0].municipio_id
                select_estado.trigger('change');
                var_estado = 0
                var_municipio = 0
                modal.show()
            })
        })
    })
}
export function init() {

    modal = new bootstrap.Modal( document.querySelector("#kt_modal_add_localidad"))
    // inicialize elements html
    select_pais = $('#pais_id').select2()
    select_estado = $('#estado_id').select2()
    select_municipio = $('#municipio_id').select2()
    btn_add = document.querySelector("#btn_add")
    form = document.querySelector("#kt_modal_add_localidad_form")
    btn_modal = form.querySelector("#kt_modal_add_localidad_close")
    btn_submit = form.querySelector("#kt_modal_add_localidad_submit")
    btn_cancel = form.querySelector("#kt_modal_add_localidad_cancel")
    edit_id = form.querySelector("#id_localidad")
    edit_nombre = form.querySelector("#nombre")
    edit_nombre_corto = form.querySelector("#nombre_corto")
    edit_codigo = form.querySelector("#codigo")
    check_active = form.querySelector("#active_check")
    edit_active = form.querySelector("#activo")
    validations = FormValidation.formValidation(form, {
        fields: {
            nombre: {
                validators: {
                    notEmpty: {
                        message: "Nombre requerido",
                    },
                    stringLength: {
                        max: 100,
                        message: "El nombre debe tener un máximo de 100 caracteres",
                    }
                },
            },
            pais_id: {
                validators: {
                    notEmpty: {
                        message: 'Seleccione un país'
                    }
                }
            },
            estado_id: {
                validators: {
                    notEmpty: {
                        message: 'Seleccione un estado'
                    }
                }
            },
            municipio_id: {
                validators: {
                    notEmpty: {
                        message: 'Seleccione un municipio'
                    }
                }
            },
        },
        plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap: new FormValidation.plugins.Bootstrap5({
                rowSelector: ".fv-row",
                invalidClass: "is-invalid",
                validClass: "is-valid",
            }),
        },
    })
    n = document.querySelector("#kt_localidades_table")
    table_items = $(n).DataTable({
        ajax: "localidades",
        serverSide: true,
        processing: true,
        columns: [
            { data: "check", name: "check" },
            { data: "id", name: "id" },
            { data: "nombre", name: "nombre" },
            { data: "nombre_corto", name: "nombre_corto" },
            { data: "municipio", name: "municipio" },
            { data: "estado", name: "estado" },
            { data: "pais", name: "pais" },
            { data: "codigo", name: "codigo" },
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
    }),

    document.querySelector('[data-kt-localidad-table-filter="search"]').addEventListener("keyup", function (e) {
        table_items.search(e.target.value).draw()
    })
    // CHECK ACTIVE
    check_active.addEventListener("click", function (t) {
        Catalogs.checked(edit_active, check_active)
    })
    // BUTTON ADD
    btn_add.addEventListener("click", function (t) {
        Catalogs.checked(edit_active, check_active)
        form.reset()
        $("#municipio_id").val(null).trigger("change.select2")
        $("#estado_id").val(null).trigger("change.select2")
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
        Catalogs.get_next_selects(catalog_fat, select_pais.val(), select_estado, var_estado)
    })
    select_estado.on('change', function() {
        let estado_id_changue
        if (var_estado == 0) {
            estado_id_changue = select_estado.val()
        }
        else{
            console.log("el valor es", var_estado)
            estado_id_changue = var_estado
        }
        Catalogs.get_next_selects("municipios", estado_id_changue, select_municipio, var_municipio)
    })
    // SUBMIT
    btn_submit.addEventListener("click", function (e) {
        e.preventDefault()
        validations.enableValidator('estado_id')
        validations.enableValidator('municipio_id')
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

document.addEventListener("DOMContentLoaded", () => {
    init();
});
