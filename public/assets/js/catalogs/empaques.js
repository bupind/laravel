"use strict"

import Catalogs from "./general.js"

const catalog = "empaques"
const catalog_item = "empaque"
const cat_localidades = "localidades"
const token = $('meta[name="csrf-token"]').attr('content')
// Variables
let table_items,
    btn_modal,
    btn_add,
    btn_cancel,
    btn_submit,
    modal,
    validations,
    form,
    edit_id,
    edit_nombre_corto,
    edit_nombre_fiscal,
    edit_domicilio_fiscal,
    edit_colonia,
    edit_rfc,
    edit_telefonos,
    edit_num_ext,
    edit_num_int,
    edit_cp,
    edit_active,
    edit_tipo,
    check_active,
    check_tipo,
    select_municipio,
    select_municipio2,
    select_localidad,
    select_localidad_22,
    image_empaque,
    var_localidad2 = 0,
    var_localidad = 0,
    n
//
const edit = () => {
    n.querySelectorAll(
        '[data-kt-empaque-table-filter="edit"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            $("#municipio_id").val(null).trigger("change.select2")
            $("#localidad_id").val(null).trigger("change.select2")
            $.get("empaques/"+ $(this).data("id") + "/edit", function(data){
                edit_id.value=data.empaque[0].id
                edit_nombre_corto.value = data.empaque[0].nombre_corto
                edit_nombre_fiscal.value = data.empaque[0].nombre_fiscal
                edit_domicilio_fiscal.value = data.empaque[0].domicilio_fiscal
                edit_colonia.value = data.empaque[0].colonia
                edit_rfc.value = data.empaque[0].rfc
                edit_telefonos.value = data.empaque[0].telefonos
                edit_num_ext.value = data.empaque[0].num_ext
                edit_num_int.value = data.empaque[0].num_int
                edit_cp.value = data.empaque[0].cp
                // CHANGE LOCALIDAD
                $("#municipio_id").val(data.empaque[0].municipio_id).trigger("change.select2")
                var_localidad = data.empaque[0].localidad_id
                select_municipio.trigger('change');
                Catalogs.checked_edit(data.empaque[0].activo, edit_active, check_active)
                if(data.empaque[0].tipo == "Física"){
                    edit_tipo.value = "Física"
                    check_tipo.checked = true
                }
                else{
                    edit_tipo.value = "Moral"
                    check_tipo.checked = false
                }
                modal.show()
                var_localidad = 0
            })
        })
    })
}

export function init() {
    modal = new bootstrap.Modal(document.querySelector("#kt_modal_add_empaque"))
    // inicialize elements html
    select_municipio = $('#municipio_id').select2()
    select_municipio2 = $('#municipio_id2').select2()
    select_localidad = $("#localidad_id").select2()
    select_localidad_22 = document.querySelector("#localidad_doc_id")
    btn_add = document.querySelector("#btn_add")
    form = document.querySelector("#kt_modal_add_empaque_form")
    image_empaque = document.querySelector("#image_empaque")
    btn_modal = form.querySelector("#kt_modal_add_empaque_close")
    btn_submit = form.querySelector("#kt_modal_add_empaque_submit")
    btn_cancel = form.querySelector("#kt_modal_add_empaque_cancel")
    edit_id = form.querySelector("#id_empaque")
    edit_nombre_corto = form.querySelector("#nombre_corto")
    edit_nombre_fiscal = form.querySelector("#nombre_fiscal")
    edit_domicilio_fiscal = form.querySelector("#domicilio_fiscal")
    edit_colonia = form.querySelector("#colonia")
    edit_rfc = form.querySelector("#rfc")
    edit_telefonos = form.querySelector("#telefonos")
    edit_num_int = form.querySelector("#num_int")
    edit_num_ext = form.querySelector("#num_ext")
    edit_cp = form.querySelector("#cp")
    edit_tipo = form.querySelector("#tipo")
    check_active = form.querySelector("#check_activo")
    check_tipo = form.querySelector("#check_tipo")
    edit_active = form.querySelector("#activo")
    validations = FormValidation.formValidation(form, {
        fields: {
            nombre_fiscal: {
                validators: {
                    notEmpty: {
                        message: "Ingrese el nombre fiscal",
                    },
                    stringLength: {
                        max: 200,
                        message: "El nombre fiscal debe tener menos de 100 caracteres",
                    }
                },
            },
            domicilio_fiscal:{
                validators: {
                    notEmpty: {
                        message: "Ingrese el domicilio fiscal",
                    },
                    stringLength: {
                        max: 1000,
                        message: "El domicilio fiscal debe tener menos de 1000 caracteres",
                    }
                },
            },
            num_ext:{
                validators: {
                    notEmpty: {
                        message: "Ingrese el numero exterior",
                    },
                    stringLength: {
                        max: 10,
                        message: "El numero exterior debe tener menos de 10 caracteres",
                    }
                },
            },
            cp:{
                validators: {
                    notEmpty: {
                        message: "Ingrese el código postal",
                    },
                    stringLength: {
                        min: 5,
                        max: 5,
                        message: "El código postal debe tener 5 caracteres",
                    }
                }
            },
            municipio_id:{
                validators: {
                    notEmpty: {
                        message: "Seleccione un municipio",
                    },
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
    })
    n = document.querySelector("#kt_empaques_table")
    table_items = $(n).DataTable({
        ajax: "empaques",
        serverSide: true,
        processing: true,
        columns: [
            { data: "check", name: "check" },
            { data: "id", name: "id" },
            { data: "nombre_corto" , name : "nombre_corto" },
            { data: "nombre_fiscal" , name : "nombre_fiscal" },
            { data: "domicilio_fiscal" , name : "domicilio_fiscal" },
            { data: "rfc" , name : "rfc" },
            { data: "activos", name: "activos" },
            { data: "buttons", name: "buttons" },
        ],
        order: [[2, "asc"]],
        columnDefs: [
            { orderable: !1, targets: 0 },
            { orderable: !1, targets: 1 },
            { orderable: !1, targets: 2 },
        ],
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
    document.querySelector('[data-kt-empaque-table-filter="search"]').addEventListener("keyup", function (e) {
        table_items.search(e.target.value).draw()
    })
    // CHECK TIPO
    check_tipo.addEventListener("click", function (t) {
        if (check_tipo.checked) {
            edit_tipo.value = "Física"
        } else {
            edit_tipo.value = "Moral"
        }
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
        $("#municipio_id2").val(null).trigger("change.select2")
        $("#localidad_id").val(null).trigger("change.select2")
        $("#localidad_doc_id").val(null).trigger("change.select2")
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
        // CHANGE MUNICIPIO
    select_municipio.on('change', function() {
        validations.disableValidator('municipio_id')
        validations.disableValidator('localidad_id')
        Catalogs.get_next_selects(cat_localidades, select_municipio.val(), select_localidad, var_localidad)
    })
        // CHANGE MUNICIPIO2
    select_municipio2.on('change', function() {
        validations.disableValidator('municipio_id2')
        validations.disableValidator('localidad_doc_id')
        const select_estado2 = $('#localidad_doc_id').select2()
        Catalogs.get_next_selects(cat_localidades, select_municipio2.val(), select_estado2, var_localidad2)
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
