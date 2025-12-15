"use strict"

import Catalogs from "./general.js"

const catalog = "marcas"
const catalog_item = "marca"
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
    select_empaque,
    edit_active,
    check_active,
    n

const edit = () => {
    n.querySelectorAll(
        '[data-kt-marca-table-filter="edit"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            $.get("marcas/"+ $(this).data("id") + "/edit", function(data){
                edit_id.value=data.marca.id
                $("#empaque_id").val(data.marca.empaque_id).trigger("change.select2")
                select_empaque.trigger('change');
                edit_nombre.value=data.marca.nombre
                Catalogs.checked_edit(data.marca.activo, edit_active, check_active)
                modal.show()
            })
        })
    })
}
export function init (){
    modal = new bootstrap.Modal(document.querySelector("#kt_modal_add_marca"))
    // inicialize elements html
    select_empaque = $('#empaque_id').select2()
    btn_add = document.querySelector("#btn_add")
    form = document.querySelector("#kt_modal_add_marca_form")
    btn_modal = form.querySelector("#kt_modal_add_marca_close")
    btn_submit = form.querySelector("#kt_modal_add_marca_submit")
    btn_cancel = form.querySelector("#kt_modal_add_marca_cancel")
    edit_id = form.querySelector("#id_marca")
    edit_nombre = form.querySelector("#nombre")
    check_active = form.querySelector("#check_activo")
    edit_active = form.querySelector("#activo")
    validations = FormValidation.formValidation(form, {
        fields: {
            nombre: {
                validators: {
                    notEmpty: {
                        message: "Ingrese el nombre de la marca",
                    },
                    stringLength: {
                        max:50,
                        message: "El nombre de la marca debe tener menos de 50 caracteres"
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
    n = document.querySelector("#kt_marcas_table")
    table_items = $(n).DataTable({
        ajax: "marcas",
        serverSide: true,
        processing: true,
        columns: [
            { data: "check", name: "check" },
            { data: "id", name: "id" },
            { data: "empaque", name: "empaque" },
            { data: "nombre", name: "nombre" },
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
        }
    }).on("draw", function () {
        Catalogs.delete_items(n, table_items, catalog, catalog_item, token), edit(), Catalogs.uncheck(n, catalog_item)
    }),

    document.querySelector('[data-kt-marca-table-filter="search"]').addEventListener("keyup", function (e) {
        table_items.search(e.target.value).draw()
    })
    select_empaque.on('change', function (e) {
        validations.revalidateField('empaque_id')
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

document.addEventListener("DOMContentLoaded", () =>{
    init()
})
