

const edit = () => {
    n.querySelectorAll(
        '[data-kt-permission-table-filter="edit"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault();
            $.get("permissions/"+ $(this).data("id") + "/edit", function(data){
                edit_name.value=data.rol.name;
                edit_id.value=data.rol.id;
                modal.show();
            })
        });
    });
}

const delete_items = () => {
    const e = n.querySelectorAll('[type="checkbox"]'),
        o = document.querySelector(
            '[data-kt-permission-table-select="delete_selected"]'
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
                url: "destroy_permissions",
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
                        html: `<span class='loader'></span>`,
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
}

const uncheck = () => {
    const t = document.querySelector(
            '[data-kt-permission-table-toolbar="base"]'
        ),
        e = document.querySelector(
            '[data-kt-permission-table-toolbar="selected"]'
        ),
        o = document.querySelector(
            '[data-kt-permission-table-select="selected_count"]'
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
}

let table_items,
btn_modal,
btn_cancel,
btn_submit,
modal,
validations,
form,
edit_name,
edit_id,
n

export function init() {
    modal = new bootstrap.Modal(document.querySelector("#kt_modal_add_permission"))
    form = document.querySelector("#kt_modal_add_permission_form")
    btn_modal = form.querySelector("#kt_modal_add_permission_close")
    btn_submit = form.querySelector("#kt_modal_add_permission_submit")
    btn_cancel = form.querySelector("#kt_modal_add_permission_cancel")
    edit_name = form.querySelector("#name")
    edit_id = form.querySelector("#id_rol")
    validations = FormValidation.formValidation(form, {
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
    })
    n = document.querySelector("#kt_permissions_table")
    table_items = $(n).DataTable({
        ajax: "permissions",
        processing: true,
        columns: [
            { data: "check", name: "check" },
            { data: "id", name: "id" },
            { data: "name", name: "name" },
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
    }).on("draw", function () {
        delete_items(), edit(), uncheck();
    })
    // edit()
    document.querySelector('[data-kt-permission-table-filter="search"]').addEventListener("keyup", function (e) {
        table_items.search(e.target.value).draw();
    })
    // CLOSE MODAL
    btn_modal.addEventListener("click", function (t) {
        t.preventDefault(), modal.hide();
    });
    // CLOSE MODAL
    btn_cancel.addEventListener("click", function (t) {
        t.preventDefault(), modal.hide();
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
                    (btn_submit.disabled = !0),
                    setTimeout(function () {
                        btn_submit.removeAttribute(
                            "data-kt-indicator"
                        ),

                        $.ajax({
                            url: "permissions",
                            type: "POST",
                            dataType:"json",
                            encode: "true",
                            headers: {
                                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                            },
                            data: $("#kt_modal_add_permission_form").serialize(),
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
                                            !1), table_items.ajax.reload(), form.reset());
                                });
                            },
                            beforeSend(){
                                Swal.fire({
                                    title: "<strong>Cargando</strong>",
                                    html: `<span class='loader'></span>`,
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
    });
}

document.addEventListener("DOMContentLoaded", () => {
    init();
});
