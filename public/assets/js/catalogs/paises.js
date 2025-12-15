
"use strict"

import Catalogs from "./general.js"

const catalog = "paises"
const catalog_item = "pais"
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
    check_active,
    edit_active,
    n

const edit = () => {
    n.querySelectorAll(
        '[data-kt-pais-table-filter="edit"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            $.get("paises/"+ $(this).data("id") + "/edit", function(data){
                edit_id.value=data.pais.id
                edit_nombre.value=data.pais.nombre
                edit_nombre_corto.value=data.pais.nombre_corto
                edit_codigo.value=data.pais.codigo
                if(data.pais.activo){
                    check_active.checked = true
                    edit_active.value = 1
                }
                else{
                    check_active.checked = false
                    edit_active.value = 0
                }
                modal.show()
            })
        })
    })
}
export function init(){
    modal = new bootstrap.Modal(document.querySelector("#kt_modal_add_pais"))
    // inicialize elements html
    btn_add = document.querySelector("#btn_add")
    form = document.querySelector("#kt_modal_add_pais_form")
    btn_modal = form.querySelector("#kt_modal_add_pais_close")
    btn_submit = form.querySelector("#kt_modal_add_pais_submit")
    btn_cancel = form.querySelector("#kt_modal_add_pais_cancel")
    edit_id = form.querySelector("#id_pais")
    edit_nombre = form.querySelector("#nombre")
    edit_nombre_corto = form.querySelector("#nombre_corto")
    edit_codigo = form.querySelector("#codigo")
    edit_active = form.querySelector("#activo")
    check_active = form.querySelector("#check_activo")
    validations = FormValidation.formValidation(form, {
        fields: {
            nombre: {
                validators: {
                    notEmpty: {
                        message: "Nombre requerido",
                    },
                    stringLength: {
                        max: 50,
                        message: "El nombre debe tener un máximo de 50 caracteres",
                    },
                },
            }
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
    n = document.querySelector("#kt_paises_table")
    table_items = $(n).DataTable({
        ajax: "paises",
        processing: true,
        columns: [
            { data: "check", name: "check" },
            { data: "id", name: "id" },
            { data: "nombre", name: "nombre" },
            { data: "nombre_corto", name: "nombre_corto" },
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
    })
    document.querySelector('[data-kt-pais-table-filter="search"]').addEventListener("keyup", function (e) {
        table_items.search(e.target.value).draw()
    })

    // CHECK ACTIVE
    check_active.addEventListener("click", (t) => {
        Catalogs.checked(edit_active, check_active)
    })
    // BUTTON ADD
    btn_add.addEventListener("click", (t) => {
        Catalogs.checked(edit_active, check_active)
        form.reset()
        modal.show()
    })
    // })
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
