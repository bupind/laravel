"use strict"

import Catalogs from "./general.js"

const catalog = "estados"
const catalog_item = "estado"
const token = $('meta[name="csrf-token"]').attr('content')

var table_items,
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
    n

const edit = () => {
    n.querySelectorAll(
        '[data-kt-estado-table-filter="edit"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            // Catalogs.checked(check_active)
            $.get("estados/"+ $(this).data("id") + "/edit", function(data){
                edit_id.value=data.estado.id
                edit_nombre.value=data.estado.nombre
                edit_nombre_corto.value=data.estado.nombre_corto
                edit_codigo.value=data.estado.codigo
                if(data.estado.activo){
                    check_active.checked = true
                    edit_active.value = 1
                }
                else{
                    check_active.checked = false
                    edit_active.value = 0
                }
                $("#pais_id").val(data.estado.pais_id).trigger("change.select2")
                modal.show()
            })
        })
    })

}

export default function init(){
    modal = new bootstrap.Modal(document.querySelector("#kt_modal_add_estado"))
    // inicialize elements html
    btn_add = document.querySelector("#btn_add")
    select_pais = $('#pais_id').select2()
    form = document.querySelector("#kt_modal_add_estado_form")
    btn_modal = form.querySelector("#kt_modal_add_estado_close")
    btn_submit = form.querySelector("#kt_modal_add_estado_submit")
    btn_cancel = form.querySelector("#kt_modal_add_estado_cancel")
    edit_id = form.querySelector("#id_estado")
    edit_nombre = form.querySelector("#nombre")
    edit_nombre_corto = form.querySelector("#nombre_corto")
    edit_codigo = form.querySelector("#codigo")
    check_active = form.querySelector("#check_activo")
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
                        message: "El nombre no debe tener más de 100 caracteres",
                    }
                }
            },
            pais_id: {
                validators: {
                    notEmpty: {
                        message: 'Seleccione un país'
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
            }),
        },
    })
    n = document.querySelector("#kt_estados_table")
    table_items = $(n).DataTable({
        ajax: "estados",
        serverSide: true,
        processing: true,
        columns: [
            { data: "check", name: "check" },
            { data: "id", name: "id" },
            { data: "nombre", name: "nombre" },
            { data: "nombre_corto", name: "nombre_corto" },
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

    document.querySelector('[data-kt-estado-table-filter="search"]').addEventListener("keyup", function (e) {
        table_items.search(e.target.value).draw()
    })
    // CHECK ACTIVE
    check_active.addEventListener("click", function (t) {
        Catalogs.checked(edit_active, check_active)
    }),
        // SELECT VARIEDADES
    // SELECT VARIEDADES
    select_pais.on('change', function() {
        validations.revalidateField('pais_id');
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

document.addEventListener("DOMContentLoaded", () => {
    init()
})
