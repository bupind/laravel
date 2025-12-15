"use strict"

import Catalogs from "./general.js"

let table_items,
        btn_modal,
        btn_add,
        btn_cancel,
        btn_submit,
        modal,
        validations,
        form,
        edit_id,
        edit_clave_aprobacion,
        edit_vigencia,
        edit_active,
        check_active,
        n

const catalog = "vigencias"
const catalog_item = "vigencia"
const token = $('meta[name="csrf-token"]').attr('content')
const edit = () => {
    n.querySelectorAll(
        '[data-kt-vigencia-table-filter="edit"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            $.get("vigencias/"+ $(this).data("id") + "/edit", function(data){
                edit_id.value=data.vigencia.id
                edit_clave_aprobacion.value = data.vigencia.clave_aprobacion
                edit_vigencia.value=data.vigencia.vigencia
                Catalogs.checked_edit(data.vigencia.activo, edit_active, check_active)
                modal.show()
            })
        })
    })
}

export function init() {
    modal = new bootstrap.Modal(document.querySelector("#kt_modal_add_vigencia"))
    // inicialize elements html
    btn_add = document.querySelector("#btn_add")
    form = document.querySelector("#kt_modal_add_vigencia_form")
    btn_modal = form.querySelector("#kt_modal_add_vigencia_close")
    btn_submit = form.querySelector("#kt_modal_add_vigencia_submit")
    btn_cancel = form.querySelector("#kt_modal_add_vigencia_cancel")
    edit_id = form.querySelector("#id_vigencia")
    edit_clave_aprobacion = form.querySelector("#clave_aprobacion")
    edit_vigencia = form.querySelector("#vigencia")
    check_active = form.querySelector("#check_activo")
    edit_active = form.querySelector("#activo")
    validations = FormValidation.formValidation(form, {
        fields: {
            clave_aprobacion: {
                validators: {
                    notEmpty: {
                        message: "Ingrese la clave de aprobación",
                    },
                    stringLength: {
                        max: 50,
                        message: "La vigencia debe tener menos de 50 caracteres",
                    }
                },
            },
            vigencia: {
                validators: {
                    notEmpty: { message: "Ingrese una fecha" },
                    format: {
                        pattern: "YYYY-MM-DD",
                        message: "La fecha no es válida",
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
    n = document.querySelector("#kt_vigencias_table")
    table_items = $(n).DataTable({
        ajax: "vigencias",
        columns: [
            { data: "check", name: "check" },
            { data: "id", name: "id" },
            { data: "clave_aprobacion", name: "clave_aprobacion" },
            { data: "vigencia", name: "vigencia" },
            { data: "activos", name: "activos" },
            { data: "buttons", name: "buttons" },
        ],
        order: [[2, "asc"]],
        columnDefs: [
            { orderable: !1, targets: 0 },

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
    // SEARCH FILTER
    document.querySelector('[data-kt-vigencia-table-filter="search"]').addEventListener("keyup", function (e) {
        table_items.search(e.target.value).draw()
    })
    // CHECK ACTIVE
    check_active.addEventListener("click", function (t) {
        Catalogs.checked(edit_active, check_active)
    })
    // BUTTON ADD
    btn_add.addEventListener("click", function (t) {
        t.preventDefault
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
                        const formData = new URLSearchParams(new FormData(document.querySelector(`#kt_modal_add_${catalog_item}_form`)))
                        Catalogs.submit_form(catalog, formData, token, modal, table_items, btn_submit, form)
                        validations.resetForm(true);

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

    $("#vigencia").flatpickr({
        singleDatePicker: true,
        showDropdowns: true,
        minYear: parseInt(moment().format("YYYY"),10),
        maxYear: parseInt(moment().format("YYYY"),10),
        locale: {
            format: 'YYYY-MM-DD',
            applyLabel: 'Aceptar',
            cancelLabel: 'Cancelar'
        },
        parentEl: '#kt_modal_add_complaint',
        drops: 'up'
    })
}

document.addEventListener("DOMContentLoaded", () => {
    init()
})
