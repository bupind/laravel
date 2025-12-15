"use strict"

import Catalogs from "./general.js"

const catalog = "usos"
const catalog_item = "uso"
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
    edit_uso,
    edit_active,
    check_active,
    n

const edit = () => {
    n.querySelectorAll(
        '[data-kt-uso-table-filter="edit"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            $.get("usos/"+ $(this).data("id") + "/edit", function(data){
                edit_id.value=data.uso.id
                edit_uso.value=data.uso.uso
                Catalogs.checked_edit(data.uso.activo, edit_active, check_active)
                modal.show()
            })
        })
    })
}
export function init() {
    modal = new bootstrap.Modal(document.querySelector("#kt_modal_add_uso"))
    // inicialize elements html
    btn_add = document.querySelector("#btn_add")
    form = document.querySelector("#kt_modal_add_uso_form")
    btn_modal = form.querySelector("#kt_modal_add_uso_close")
    btn_submit = form.querySelector("#kt_modal_add_uso_submit")
    btn_cancel = form.querySelector("#kt_modal_add_uso_cancel")
    edit_id = form.querySelector("#id_uso")
    edit_uso = form.querySelector("#uso")
    check_active = form.querySelector("#check_activo")
    edit_active = form.querySelector("#activo")
    validations = FormValidation.formValidation(form, {
        fields: {
            uso: {
                validators: {
                    notEmpty: {
                        message: "Ingrese el uso",
                    },
                    stringLength: {
                        max: 30,
                        message:
                            "El uso debe contener menos de 30 caracteres",
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
    n = document.querySelector("#kt_usos_table")
    table_items = $(n).DataTable({
        ajax: "usos",
        serverSide: true,
        processing: true,
        columns: [
            { data: "check", name: "check" },
            { data: "id", name: "id" },
            { data: "uso", name: "uso" },
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
    document.querySelector('[data-kt-uso-table-filter="search"]').addEventListener("keyup", function (e) {
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
    init()
})
