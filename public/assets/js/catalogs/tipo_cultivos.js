"use strict"

import Catalogs from "./general.js"
const catalog = "tipo_cultivos"
const catalog_item = "tipo_cultivo"
const token = $('meta[name="csrf-token"]').attr('content')

const edit = () => {
    n.querySelectorAll(
        '[data-kt-tipo_cultivo-table-filter="edit"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            $.get("tipo_cultivos/"+ $(this).data("id") + "/edit", function(data){
                edit_id.value=data.tipo_cultivo.id
                edit_tipo_cultivo.value=data.tipo_cultivo.tipo_cultivo
                Catalogs.checked_edit(data.tipo_cultivo.activo, edit_active, check_active)
                $("#tipo").val(data.tipo_cultivo.tipo).trigger("change.select2")
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
edit_tipo_cultivo,
edit_active,
check_active,
n

export function init() {
    modal = new bootstrap.Modal(document.querySelector("#kt_modal_add_tipo_cultivo"))
    // inicialize elements html
    btn_add = document.querySelector("#btn_add")
    form = document.querySelector("#kt_modal_add_tipo_cultivo_form")
    btn_modal = form.querySelector("#kt_modal_add_tipo_cultivo_close")
    btn_submit = form.querySelector("#kt_modal_add_tipo_cultivo_submit")
    btn_cancel = form.querySelector("#kt_modal_add_tipo_cultivo_cancel")
    edit_id = form.querySelector("#id_tipo_cultivo")
    edit_tipo_cultivo = form.querySelector("#tipo_cultivo")
    check_active = form.querySelector("#check_activo")
    edit_active = form.querySelector("#activo")
    validations = FormValidation.formValidation(form, {
        fields: {
            tipo_cultivo: {
                validators: {
                    notEmpty: {
                        message: "Ingrese el tipo de cultivo",
                    },
                    stringLength: {
                        max: 30,
                        message:
                            "El tipo de cultivo debe tener menos de 30 caracteres",
                    }
                },
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
    n = document.querySelector("#kt_tipo_cultivos_table")
    table_items = $(n).DataTable({
        ajax: "tipo_cultivos",
        serverSide: true,
        processing: true,
        columns: [
            { data: "check", name: "check" },
            { data: "id", name: "id" },
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
    document.querySelector('[data-kt-tipo_cultivo-table-filter="search"]').addEventListener("keyup", function (e) {
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
    init();
});
