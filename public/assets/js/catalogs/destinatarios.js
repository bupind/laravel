"use strict"

import Catalogs from "./general.js"
const catalog = "destinatarios"
const catalog_item = "destinatario"
const token = $('meta[name="csrf-token"]').attr('content')

const edit = () => {
    n.querySelectorAll(
        '[data-kt-destinatario-table-filter="edit"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            $.get("destinatarios/"+ $(this).data("id") + "/edit", function(data){
                edit_id.value=data.destinatario[0].id
                $("#empaque_id").val(data.destinatario[0].empaque_id).trigger("change.select2")
                select_empaque.trigger('change');
                edit_nombre.value=data.destinatario[0].nombre
                edit_nombre_corto.value=data.destinatario[0].nombre_corto
                edit_domicilio.value=data.destinatario[0].domicilio
                edit_colonia.value = data.destinatario[0].colonia
                edit_telefonos.value = data.destinatario[0].telefonos
                edit_num_ext.value = data.destinatario[0].num_ext
                edit_num_int.value = data.destinatario[0].num_int
                edit_cp.value = data.destinatario[0].cp
                edit_correos.value=data.destinatario[0].correos
                // CHANGE ESTADO
                $("#pais_id").val(data.destinatario[0].pais_id).trigger("change.select2")
                var_estado = data.destinatario[0].estado_id
                select_pais.trigger('change');
                // CHANGE MUNICIPIO
                $("#estado_id").val(data.destinatario[0].estado_id).trigger("change.select2")
                var_municipio = data.destinatario[0].municipio_id
                select_estado.trigger('change');
                // CHANGE LOCALIDAD
                $("#municipio_id").val(data.destinatario[0].municipio_id).trigger("change.select2")
                var_localidad = data.destinatario[0].localidad_id
                select_localidad.trigger('change');
                // reset variables
                var_municipio = 0
                var_estado = 0
                var_localidad = 0
                Catalogs.checked_edit(data.destinatario[0].activo, edit_active, check_active)
                modal.show()
            })
        })
    })
}

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
edit_domicilio,
edit_colonia,
edit_num_ext,
edit_num_int,
edit_cp,
edit_telefonos,
edit_correos,
select_empaque,
select_pais,
select_estado,
select_municipio,
select_localidad,
edit_active,
check_active,
var_municipio = 0,
var_estado = 0,
var_localidad = 0,
n

export function init(){
    modal = new bootstrap.Modal(document.querySelector("#kt_modal_add_destinatario"))
    // inicialize elements html
    select_empaque = $('#empaque_id').select2()
    select_pais = $('#pais_id').select2()
    select_estado = $('#estado_id').select2()
    select_municipio = $('#municipio_id').select2()
    select_localidad = $('#localidad_id').select2()
    btn_add = document.querySelector("#btn_add")
    form = document.querySelector("#kt_modal_add_destinatario_form")
    btn_modal = form.querySelector("#kt_modal_add_destinatario_close")
    btn_submit = form.querySelector("#kt_modal_add_destinatario_submit")
    btn_cancel = form.querySelector("#kt_modal_add_destinatario_cancel")
    edit_id = form.querySelector("#id_destinatario")
    edit_nombre = form.querySelector("#nombre")
    edit_nombre_corto = form.querySelector("#nombre_corto")
    edit_domicilio = form.querySelector("#domicilio")
    edit_colonia = form.querySelector("#colonia")
    edit_telefonos = form.querySelector("#telefonos")
    edit_num_int = form.querySelector("#num_int")
    edit_num_ext = form.querySelector("#num_ext")
    edit_cp = form.querySelector("#cp")
    edit_correos = form.querySelector("#correos")
    check_active = form.querySelector("#check_activo")
    edit_active = form.querySelector("#activo")
    validations = FormValidation.formValidation(form, {
        fields: {
            nombre: {
                validators: {
                    notEmpty: {
                        message: "Ingrese el nombre del destinatario",
                    },
                    stringLength: {
                        max: 500,
                        message:
                            "El nombre del destinatario debe tener menos de 500 caracteres",
                    }
                },
            },
            domicilio: {
                validators: {
                    notEmpty: {
                        message: "Ingrese el domicilio del destinatario",
                    },
                },
            },
            cp: {
                validators: {
                    notEmpty: {
                        message: "Ingrese el código postal del destinatario",
                    },
                    stringLength: {
                        min: 5,
                        max: 5,
                        message:
                            "El código postal del destinatario debe tener 5 caracteres",
                    }
                },
            },
            empaque_id: {
                validators: {
                    notEmpty: {
                        message: "Seleccione el empaque",
                    },
                },
            },
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
            }
        },
        plugins: {
            trigger: new FormValidation.plugins.Trigger(),
            bootstrap: new FormValidation.plugins.Bootstrap5({
                rowSelector: ".fv-row",
            })
        },
    })
    n = document.querySelector("#kt_destinatarios_table")
    table_items = $(n).DataTable({
        ajax: "destinatarios",
        serverSide: true,
        processing: true,
        columns: [
            { data: "check", name: "check" },
            { data: "id", name: "id" },
            { data: "nombre_fiscal", name: "nombre_fiscal" },
            { data: "nombre", name: "nombre" },
            { data: "nombre_corto", name: "nombre_corto" },
            { data: "domicilio", name: "domicilio" },
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
    document.querySelector('[data-kt-destinatario-table-filter="search"]').addEventListener("keyup", function (e) {
        table_items.search(e.target.value).draw()
    })
    // SELECT EMPAQUE
    select_empaque.on('change', function (e) {
        validations.revalidateField('empaque_id')
    })
    // SELECT EMPAQUE
    select_pais.on('change', function (e) {
        validations.revalidateField('pais_id')
        validations.disableValidator('estado_id')
        validations.disableValidator('municipio_id')
        Catalogs.get_next_selects("estados", select_pais.val(), select_estado, var_estado)
        // var_estado = 0
    })
    // SELECT ESTADO
    select_estado.on('change', function (e) {
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
    // SELECT MUNICIPIO
    select_municipio.on('change', function (e) {
        let municipio_changue
        if (var_municipio === 0) {
            municipio_changue = select_municipio.val()
            }
        else{
            municipio_changue = var_municipio
        }
        Catalogs.get_next_selects("localidades", municipio_changue, select_localidad, var_localidad)
    })
    // CHECK ACTIVE
    check_active.addEventListener("click", function (t) {
        Catalogs.checked(edit_active, check_active)
    })
    // BUTTON ADD
    btn_add.addEventListener("click", function (t) {
        Catalogs.checked(edit_active, check_active)
        form.reset()
        $("#empaque_id").val(null).trigger("change.select2")
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

document.addEventListener('DOMContentLoaded', function () {
    init()
})
