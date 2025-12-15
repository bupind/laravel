"use strict";
var KTrolesList = (function () {
    var table_items,
        btn_modal,
        btn_cancel,
        btn_submit,
        modal,
        validations,
        form,
        edit_name,
        edit_id,
        n,
        input_permission,
        input_arr,
        btn_add,
        edit = () => {
            n.querySelectorAll(
                '[data-kt-role-table-filter="edit"]'
            ).forEach((e) => {
                e.addEventListener("click", function (e) {
                    e.preventDefault();
                    $.get("roles/"+ $(this).data("id") + "/edit", function(data){
                        edit_name.value=data.rol.name;
                        edit_id.value=data.rol.id;
                        let permissionNames = data.rol.permissions.map(permission => permission.name);
                        input_permission.value = permissionNames;
                        if (input_permission.tagify) {
                            input_permission.tagify.destroy();
                        }
                        let prueba = JSON.parse(input_arr.value)
                        input_permission.tagify = new Tagify(input_permission, {
                            whitelist: prueba,
                            dropdown: {
                                maxItems: 20,
                                classname: "tagify__inline__suggestions",
                                enabled: 0,
                                closeOnSelect: false
                            }
                        });
                        modal.show();
                    })
                });
            });
        },
        delete_items = () => {
            const e = n.querySelectorAll('[type="checkbox"]'),
                o = document.querySelector(
                    '[data-kt-role-table-select="delete_selected"]'
                );
            e.forEach((t) => {
                t.addEventListener("click", function () {
                    setTimeout(function () {
                        uncheck();
                    }, 50);
                });
            }),
            o.addEventListener("click", function () {
                let arr_items_deleted=[];
                e.forEach((e) => {
                    e.checked && arr_items_deleted.push($(e).data("id"));
                });
                Swal.fire({
                    text: "Estas seguro de eliminar los registros seleccionados?",
                    icon: "warning",
                    showCancelButton: !0,
                    buttonsStyling: !1,
                    confirmButtonText: "Si, eliminar!",
                    cancelButtonText: "No, cancelar",
                    customClass: {
                        confirmButton: "btn fw-bold btn-danger",
                        cancelButton: "btn fw-bold btn-active-light-primary",
                    },
                }).then(function (o) {
                    o.value
                    ?
                    $.ajax({
                        url: "destroy_roles",
                        type: "POST",
                        dataType:"json",
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        data: {
                            ids:arr_items_deleted
                        },
                        success: function (result) {
                            Swal.fire({
                                text: "Datos eliminados correctamente!",
                                icon: "success",
                                buttonsStyling: !1,
                                confirmButtonText:"Entendido!",
                                customClass: {
                                    confirmButton:"btn btn-primary",
                                },
                            }).then(function (e) {
                                e.isConfirmed && table_items.ajax.reload();
                            });
                        },
                        beforeSend(){
                            Swal.fire({
                                title: "<strong>Cargando</strong>",
                                html: `<div class="loader"></div>`,
                                showConfirmButton: false,
                            });
                        },
                        error(data){
                            Swal.fire({
                                icon: "error",
                                title: "Error",
                                text: "Ocurrió un error en la base de datos!",
                            });
                                console.log(data);
                        }
                    })

                    : "cancel" === o.dismiss &&
                        Swal.fire({
                            text: "Los registros no se eliminaron.",
                            icon: "error",
                            buttonsStyling: !1,
                            confirmButtonText: "Entendido!",
                            customClass: {
                                confirmButton: "btn fw-bold btn-primary",
                            },
                        });
                });
            });
        };
        const uncheck = () => {
            const t = document.querySelector(
                    '[data-kt-role-table-toolbar="base"]'
                ),
                e = document.querySelector(
                    '[data-kt-role-table-toolbar="selected"]'
                ),
                o = document.querySelector(
                    '[data-kt-role-table-select="selected_count"]'
                ),
                c = n.querySelectorAll('tbody [type="checkbox"]');
            let r = !1,
                l = 0;
            c.forEach((t) => {
                t.checked && ((r = !0), l++);
            }),
                r ? ((o.innerHTML = l),
                    t.classList.add("d-none"),
                    e.classList.remove("d-none"))
                    : (t.classList.remove("d-none"), e.classList.add("d-none"));
        };
        return {
            init: function () {
                (modal = new bootstrap.Modal(
                    document.querySelector("#kt_modal_add_role")
                )),
                // inicialize elements html
                (form = document.querySelector("#kt_modal_add_role_form")),
                (btn_modal = form.querySelector("#kt_modal_add_role_close")),
                (btn_submit = form.querySelector("#kt_modal_add_role_submit")),
                (btn_cancel = form.querySelector("#kt_modal_add_role_cancel")),
                (btn_add = document.querySelector("#btn_add")),
                (edit_name = form.querySelector("#name")),
                (edit_id = form.querySelector("#id_rol")),
                (input_permission = document.querySelector("#permissions")),
                (input_arr = document.querySelector("#prueba")),
                (validations = FormValidation.formValidation(form, {
                    fields: {
                        name: {
                            validators: {
                                notEmpty: {
                                    message: "Nombre requerido",
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
                })),
                (n = document.querySelector("#kt_roles_table")) &&
                    (n.querySelectorAll("tbody tr").forEach((t) => {
                        // formats
                        }),
                        (table_items = $(n).DataTable({
                            ajax: "roles",
                            processing: true,
                            columns: [
                                { data: "check", name: "check" },
                                { data: "id", name: "id" },
                                { data: "name", name: "name" },
                                { data: "permissions", name: "permissions" },
                                { data: "buttons", name: "buttons" },
                            ],
                            order: [[2, "asc"]],
                            columnDefs: [
                                { orderable: !1, targets: 0 },
                                {
                                    targets: [1],
                                    visible: false,
                                    searchable: false,
                                },
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
                        })).on("draw", function () {
                            delete_items(), edit(), uncheck();
                        }),
                        delete_items(),
                        edit(),
                        document.querySelector('[data-kt-role-table-filter="search"]').addEventListener("keyup", function (e) {
                            table_items.search(e.target.value).draw();
                        })
                    );
                // CLOSE MODAL
                btn_modal.addEventListener("click", function (t) {
                    t.preventDefault(), modal.hide();
                });
                // CLOSE MODAL
                btn_cancel.addEventListener("click", function (t) {
                    t.preventDefault(), modal.hide();
                });
                // BTN ADD
                btn_add.addEventListener("click", function (t) {
                    t.preventDefault()
                    form.reset()
                    input_permission.tagify.removeAllTags();
                    modal.show()
                });
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
                                setTimeout(function () {
                                    btn_submit.removeAttribute(
                                        "data-kt-indicator"
                                    ),

                                    $.ajax({
                                        url: "roles",
                                        type: "POST",
                                        dataType:"json",
                                        encode: "true",
                                        headers: {
                                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                                        },
                                        data: $("#kt_modal_add_role_form").serialize(),
                                        success: function (result) {
                                                Swal.fire({
                                                text: "Datos guardados exitosamente!",
                                                icon: "success",
                                                buttonsStyling: !1,
                                                confirmButtonText:
                                                    "Entendido!",
                                                customClass: {
                                                confirmButton:
                                                    "btn btn-primary",
                                            },
                                            }).then(function (e) {
                                                e.isConfirmed &&
                                                    (modal.hide(),
                                                    (btn_submit.disabled =
                                                        !1), table_items.ajax.reload(), form.reset(), btn_add.focus());
                                            });
                                        },
                                        beforeSend(){
                                            Swal.fire({
                                                title: "<strong>Cargando</strong>",
                                                html: `<div class="loader"></div>`,
                                                showConfirmButton: false,
                                                });
                                        },
                                        error(data){
                                            Swal.fire({
                                                icon: "error",
                                                title: "Error",
                                                text: "Ocurrio un error en la base de datos!",
                                            });
                                                console.log(data);
                                        }
                                    });

                                }, 1000))
                            : Swal.fire({
                                    text: "Error, faltan algunos datos, intente de nuevo por favor.",
                                    icon: "error",
                                    buttonsStyling: !1,
                                    confirmButtonText: "Entendido!",
                                    customClass: {
                                        confirmButton: "btn btn-primary",
                                    },
                                });
                    });
                })
                let prueba = JSON.parse(input_arr.value)
                if (input_permission.tagify) {
                    input_permission.tagify.destroy();
                }

                // Inicializa Tagify
                input_permission.tagify = new Tagify(input_permission, {
                    whitelist: prueba,
                    dropdown: {
                        maxItems: 20,
                        classname: "tagify__inline__suggestions",
                        enabled: 0,
                        closeOnSelect: false
                    }
                });
            },
        };
})();
KTUtil.onDOMContentLoaded(function () {
    KTrolesList.init();
});
