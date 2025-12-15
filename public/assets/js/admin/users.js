"use strict"

const delete_permission = () => {
    document.querySelectorAll('[data-kt-customer-table-filter="delete_row"]').forEach((e) => {
        e.addEventListener("click", function (e) {
        e.preventDefault()
        const o = e.target.closest("tr"),
            n = o.querySelectorAll("td")[0].innerText
        Swal.fire({
            text: "Seguro que deseas eliminar el permiso " + n + "?",
            icon: "warning",
            showCancelButton: !0,
            buttonsStyling: !1,
            confirmButtonText: "Si, borrar!",
            cancelButtonText: "No, cancelelar",
            customClass: {
            confirmButton: "btn fw-bold btn-danger",
            cancelButton: "btn fw-bold btn-active-light-primary",
            },
        }).then(function (e) {
            e.value
            ? Swal.fire({
                text: "Eliminado correctamente!.",
                icon: "success",
                buttonsStyling: !1,
                confirmButtonText: "Entendido",
                customClass: { confirmButton: "btn fw-bold btn-primary" },
                }).then(function () {
                table_permissions.row($(o)).remove().draw()
                })
            : "cancel" === e.dismiss &&
                Swal.fire({
                text: "El permiso "+ n + " no se elimino.",
                icon: "error",
                buttonsStyling: !1,
                confirmButtonText: "Entendido",
                customClass: { confirmButton: "btn fw-bold btn-primary" },
                })
        })
        })
    })
}

const delete_country = () => {
    document.querySelectorAll('[data-kt-customer-table-filter="delete_country"]').forEach((e) => {
        e.addEventListener("click", function (e) {
        e.preventDefault()
        const o = e.target.closest("tr"),
            n = o.querySelectorAll("td")[1].innerText
        Swal.fire({
            text: "Seguro que deseas eliminar el estado " + n + "?",
            icon: "warning",
            showCancelButton: !0,
            buttonsStyling: !1,
            confirmButtonText: "Si, borrar!",
            cancelButtonText: "No, cancelelar",
            customClass: {
            confirmButton: "btn fw-bold btn-danger",
            cancelButton: "btn fw-bold btn-active-light-primary",
            },
        }).then(function (e) {
            e.value
            ? Swal.fire({
                text: "Eliminado correctamente!.",
                icon: "success",
                buttonsStyling: !1,
                confirmButtonText: "Entendido",
                customClass: { confirmButton: "btn fw-bold btn-primary" },
                }).then(function () {
                table_countries.row($(o)).remove().draw()
                })
            : "cancel" === e.dismiss &&
                Swal.fire({
                text: "El estado "+ n + " no se elimino.",
                icon: "error",
                buttonsStyling: !1,
                confirmButtonText: "Entendido",
                customClass: { confirmButton: "btn fw-bold btn-primary" },
                })
        })
        })
    })
}

const delete_standard = () => {
    document.querySelectorAll('[data-kt-standard-table-filter="delete_standard"]').forEach((e) => {
        e.addEventListener("click", function (e) {
        e.preventDefault()
        const o = e.target.closest("tr"),
            n = o.querySelectorAll("td")[1].innerText
        Swal.fire({
            text: "Seguro que deseas eliminar la norma " + n + " del usuario?",
            icon: "warning",
            showCancelButton: !0,
            buttonsStyling: !1,
            confirmButtonText: "Si, borrar!",
            cancelButtonText: "No, cancelelar",
            customClass: {
            confirmButton: "btn fw-bold btn-danger",
            cancelButton: "btn fw-bold btn-active-light-primary",
            },
        }).then(function (e) {
            e.value
            ? Swal.fire({
                text: "Eliminado correctamente!.",
                icon: "success",
                buttonsStyling: !1,
                confirmButtonText: "Entendido",
                customClass: { confirmButton: "btn fw-bold btn-primary" },
                }).then(function () {
                table_standards.row($(o)).remove().draw()
                })
            : "cancel" === e.dismiss &&
                Swal.fire({
                text: "La norma "+ n + " no se elimino.",
                icon: "error",
                buttonsStyling: !1,
                confirmButtonText: "Entendido",
                customClass: { confirmButton: "btn fw-bold btn-primary" },
                })
        })
        })
    })
}

const edit = () => {
    n.querySelectorAll(
        '[data-kt-user-table-filter="edit"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            $.get("users/"+ $(this).data("id") + "/edit", function(data){
                edit_name.value=data.user.name
                edit_id.value=data.user.id
                edit_email.value=data.user.email
                edit_address.value=data.user.address
                edit_phone.value=data.user.phone
                edit_last_name.value=data.user.last_name
                edit_employee_number.value=data.user.employee_number
                edit_last_id.value=data.user.last_id
                modal.show()
            })
        })
    })
    n.querySelectorAll(
        '[data-kt-user-table-filter="reset-pass"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            $.get(`reset_pass/${$(this).data("id")}`, function(data){
                Swal.fire({
                    icon: "success",
                    title: "Actualizado",
                    text: "La contraseña se actualizo correctamente!",
                })
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: `Hubo un problema al actualizar la contraseña: ${errorThrown}`,
                })
            })
        })

    }),
    n.querySelectorAll(
        '[data-kt-user-table-filter="permissions"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            table_permissions.clear().draw()
            edit_id_permission.value=$(this).data("id")
            // GET USER PERMISSION
            $.ajax({
                url: "get_user_permission",
                type: "GET",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                data: {
                    user_id:$(this).data("id")
                },
                success: function (result) {
                    $.each(result.user, function(index){
                        table_permissions.row.add([result.user[index], `<button type="button" class="btn btn-active-light-danger btn-sm me-0 ms-0" data-kt-customer-table-filter="delete_row">
                        <i class="ki-outline ki-trash text-danger fs-2"></i>
                    </button>`]).draw()
                    })
                    delete_permission()
                    Swal.close()
                    modal_permission.show()
                },
                beforeSend(){
                    Swal.fire({
                        title: "<strong>Cargando</strong>",
                        html: `<span class='loader'></span>`,
                        showConfirmButton: false,
                        })
                },
                error(data){
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Ocurrio un error en la base de datos!",
                    })
                        console.log(data)
                }
            })

        })
    })
    n.querySelectorAll(
        '[data-kt-user-table-filter="add-countries"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            $("#select_country").val(null).trigger("change.select2")
            table_countries.clear().draw()
            edit_id_country.value=$(this).data("id")
            // GET USER PERMISSION
            $.ajax({
                url: "get_user_countries",
                type: "GET",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                data: {
                    user_id:$(this).data("id")
                },
                success: function (result) {
                    $.each(result.user, function(index){
                        table_countries.row.add([result.user[index].estado_id, result.user[index].nombre, `<button type="button" class="btn btn-active-light-danger btn-sm me-0 ms-0" data-kt-customer-table-filter="delete_country">
                        <i class="ki-outline ki-trash text-danger fs-2"></i>
                    </button>`]).draw()
                    })
                    Swal.close()
                    modal_countries.show()
                },
                beforeSend(){
                    Swal.fire({
                        title: "<strong>Cargando</strong>",
                        html: `<span class='loader'></span>`,
                        showConfirmButton: false,
                        })
                },
                error(data){
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Ocurrio un error en la base de datos!",
                    })
                        console.log(data)
                }
            })

        })
    })
    n.querySelectorAll(
        '[data-kt-user-table-filter="add-standards"]'
    ).forEach((e) => {
        e.addEventListener("click", function (e) {
            e.preventDefault()
            $("#select_standard").val(null).trigger("change.select2")
            table_standards.clear().draw()
            edit_id_standard.value=$(this).data("id")
            // GET USER PERMISSION
            $.ajax({
                url: "get_user_standards",
                type: "GET",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                data: {
                    user_id:$(this).data("id")
                },
                success: function (result) {
                    $.each(result.user, function(index){
                        console.log(result.user[index])
                        table_standards.row.add([result.user[index].standard_id, result.user[index].name, result.user[index].validity, `<button type="button" class="btn btn-active-light-success btn-sm me-0 ms-0" data-kt-standard-table-filter="delete_standard">
                        <i class="ki-outline ki-trash text-danger fs-2"></i>
                    </button>`]).draw()
                    })
                    Swal.close()
                    modal_standards.show()
                },
                beforeSend(){
                    Swal.fire({
                        title: "<strong>Cargando</strong>",
                        html: `<span class='loader'></span>`,
                        showConfirmButton: false,
                        })
                },
                error(data){
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Ocurrio un error en la base de datos!",
                    })
                        console.log(data)
                }
            })

        })
    })
}

const delete_items = () => {
    const e = n.querySelectorAll('[type="checkbox"]'),
        o = document.querySelector(
            '[data-kt-user-table-select="delete_selected"]'
        )
    e.forEach((t) => {
        t.addEventListener("click", function () {
            setTimeout(function () {
                uncheck()
            }, 50)
        })
    }),
    o.addEventListener("click", function () {
        let arr_items_deleted=[]
        e.forEach((e) => {
            e.checked && arr_items_deleted.push($(e).data("id"))
        })
        console.log(arr_items_deleted)
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
                url: "destroy_users",
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
                        e.isConfirmed && table_items.ajax.reload()
                    })
                },
                beforeSend(){
                    Swal.fire({
                        title: "<strong>Cargando</strong>",
                        html: `<span class='loader'></span>`,
                        showConfirmButton: false,
                    })
                },
                error(data){
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Ocurrio un error en la base de datos!",
                    })
                        console.log(data)
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
                })
        })
    })
}

const uncheck = () => {
    const t = document.querySelector(
            '[data-kt-user-table-toolbar="base"]'
        ),
        e = document.querySelector(
            '[data-kt-user-table-toolbar="selected"]'
        ),
        o = document.querySelector(
            '[data-kt-user-table-select="selected_count"]'
        ),
        c = n.querySelectorAll('tbody [type="checkbox"]')
    let r = !1,
        l = 0
    c.forEach((t) => {
        t.checked && ((r = !0), l++)
    }),
        r ? ((o.innerHTML = l),
            t.classList.add("d-none"),
            e.classList.remove("d-none"))
            : (t.classList.remove("d-none"), e.classList.add("d-none"))
}

let table_items,
        table_permissions,
        table_countries,
        table_standards,
        btn_modal,
        btn_add_user,
        btn_cancel,
        btn_submit,
        btn_add_permission,
        btn_add_standard,
        btn_add_country,
        btn_save_permissions,
        btn_save_countries,
        btn_save_standards,
        modal,
        modal_permission,
        modal_countries,
        modal_standards,
        validations,
        form,
        edit_name,
        edit_email,
        edit_last_name,
        edit_address,
        edit_phone,
        edit_id,
        edit_id_permission,
        edit_id_country,
        edit_id_standard,
        edit_employee_number,
        edit_last_id,
        edit_validity,
        n,
        select_permission,
        select_country,
        select_standard

export function init() {
    $("#validity").daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        minYear: 2020,
        locale: {
            format: 'YYYY-MM-DD',
            cancelLabel: 'Clear'
        }
    })
    // Modals
    modal = new bootstrap.Modal(document.querySelector("#kt_modal_add_user"))
    modal_permission = new bootstrap.Modal(document.querySelector("#kt_modal_permission"))
    modal_countries = new bootstrap.Modal(document.querySelector("#kt_modal_countries"))
    modal_standards = new bootstrap.Modal(document.querySelector("#kt_modal_standards"))
    // inicialize elements html
    btn_add_permission = document.querySelector("#btn_add_permission")
    btn_add_user = document.querySelector("#btn_add_user")
    btn_add_standard = document.querySelector("#btn_add_standard")
    btn_add_country = document.querySelector("#btn_add_country")
    btn_save_permissions = document.querySelector("#btn_save_permissions")
    btn_save_countries = document.querySelector("#btn_save_countries")
    btn_save_standards = document.querySelector("#btn_save_standards")
    select_permission = document.querySelector("#select_permission")
    select_country = document.querySelector("#select_country")
    select_standard = document.querySelector("#select_standard")
    edit_id_permission = document.querySelector("#user_id")
    edit_id_country = document.querySelector("#user_id_country")
    edit_id_standard = document.querySelector("#user_id_standard")
    edit_validity = document.querySelector("#validity")
    form = document.querySelector("#kt_modal_add_user_form")
    btn_modal = form.querySelector("#kt_modal_add_user_close")
    btn_submit = form.querySelector("#kt_modal_add_user_submit")
    btn_cancel = form.querySelector("#kt_modal_add_user_cancel")
    edit_name = form.querySelector("#name")
    edit_last_name = form.querySelector("#last_name")
    edit_email = form.querySelector("#email")
    edit_address = form.querySelector("#address")
    edit_phone = form.querySelector("#phone")
    edit_id = form.querySelector("#id_user")
    edit_employee_number = form.querySelector("#employee_number")
    edit_last_id = form.querySelector("#last_id")
    validations = FormValidation.formValidation(form, {
        fields: {
            name: {
                validators: {
                    notEmpty: {
                        message: "Nombre requerido",
                    },
                    stringLenght: {
                        max: 50,
                        message: "El nombre debe tener menos de 50 caracteres",
                    }
                },
            },
            last_name: {
                validators: {
                    notEmpty: {
                        message: "Apellido requerido",
                    },
                    stringLenght: {
                        max: 50,
                        message: "El apellido debe tener menos de 50 caracteres",
                    }
                },
            },
            email: {
                validators: {
                    notEmpty: {
                        message: "Email requerido",
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
    n = document.querySelector("#kt_users_table")
    table_items = $(n).DataTable({
        ajax: "users",
        processing: true,
        columns: [
            { data: "check", name: "check" },
            { data: "id", name: "id" },
            { data: "employee_number", name: "employee_number" },
            { data: "email", name: "email" },
            { data: "name", name: "name" },
            { data: "last_name", name: "last_name" },
            { data: "phone", name: "phone" },
            { data: "address", name: "address" },
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
        delete_items(), edit(), uncheck()
    })
    document.querySelector('[data-kt-user-table-filter="search"]').addEventListener("keyup", function (e) {
        table_items.search(e.target.value).draw()
    })
    // TABLE PERMISSIONS
    table_permissions = $("#kt_users_permissions_table").DataTable({
        order: [[1, "asc"]],
        columnDefs: [
            { orderable: !1, targets: 0 },
        ],
        language: {
            zeroRecords: "<div class='container-fluid '> <div class='d-flex flex-center'>" +
            "<span>No hay datos que mostrar</span></div></div>",
            info: "Mostrando página _PAGE_ de _PAGES_",
            infoEmpty: "<div class='container-fluid'>No hay Información</div>",
            infoFiltered: "(Filtrando _MAX_ registros)",
            processing:
                "<span class='fa-stack fa-lg'>\n\
                <i class='fa fa-spinner fa-spin fa-stack-2x fa-fw'></i>\n\
            </span>&emsp;Processing Message here...",
        },
    }).on("draw", function(){
        delete_permission()
    })
    // TABLE COUNTRIES
    table_countries = $("#kt_users_countries_table").DataTable({
        order: [[1, "asc"]],
        columnDefs: [
            { orderable: !1, targets: 0 },
        ],
        language: {
            zeroRecords: "<div class='container-fluid '> <div class='d-flex flex-center'>" +
            "<span>No hay datos que mostrar</span></div></div>",
            info: "Mostrando página _PAGE_ de _PAGES_",
            infoEmpty: "<div class='container-fluid'>No hay Información</div>",
            infoFiltered: "(Filtrando _MAX_ registros)",
            processing:
                "<span class='fa-stack fa-lg'>\n\
                <i class='fa fa-spinner fa-spin fa-stack-2x fa-fw'></i>\n\
            </span>&emsp;Processing Message here...",
        },
    }).on("draw", function(){
        delete_country()
    })
    // TABLE COUNTRIES
    table_standards = $("#kt_users_standards_table").DataTable({
        order: [[1, "asc"]],
        columnDefs: [
            { orderable: !1, targets: 0 },
        ],
        language: {
            zeroRecords: "<div class='container-fluid '> <div class='d-flex flex-center'>" +
            "<span>No hay datos que mostrar</span></div></div>",
            info: "Mostrando página _PAGE_ de _PAGES_",
            infoEmpty: "<div class='container-fluid'>No hay Información</div>",
            infoFiltered: "(Filtrando _MAX_ registros)",
            processing:
                "<span class='fa-stack fa-lg'>\n\
                <i class='fa fa-spinner fa-spin fa-stack-2x fa-fw'></i>\n\
            </span>&emsp;Processing Message here...",
        },
    }).on("draw", function(){
        delete_standard()
    })
    // CLOSE MODAL
    btn_add_user.addEventListener("click", function (t) {
        t.preventDefault()
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
    // ADD PERMISSION TO DATATABLE
    btn_add_permission.addEventListener("click", function (t) {
        t.preventDefault()
        if(select_permission.value != ""){
            var data = table_permissions.rows().data() // All data datatable permissions
            let repeat=false
            for (var i = 0; i < data.length; i++) {
                if (data[i][0] === select_permission.value) {
                    repeat=true
                }
            }
            if(repeat){
                Swal.fire({
                    title: "Advertencia!",
                    text: "El permiso " + select_permission.value +" ya esta asignado al usuario!",
                    icon: "warning"
                    })
            }else{
                table_permissions.row.add([select_permission.value, `<button type="button" class="btn btn-active-light-danger btn-sm me-0 ms-0" data-kt-customer-table-filter="delete_row">
                    <i class="ki-outline ki-trash text-danger fs-2"></i>
                    </button>`]).draw()
            }
        }
        else{
            Swal.fire({
                title: "Advertencia!",
                text: "Seleccione un permiso!",
                icon: "warning"
            })
        }

    })
    // ADD STANDARD TO DATATABLE
    btn_add_standard.addEventListener("click", function (t) {
        t.preventDefault()
        if(select_standard.value != ""){
            var data = table_standards.rows().data() // All data datatable permissions
            let repeat=false
            for (var i = 0; i < data.length; i++) {
                if (data[i][0] == select_standard.value) {
                    repeat=true
                }
            }
            if(repeat){
                Swal.fire({
                    title: "Advertencia!",
                    text: "La norma " + $("#select_standard option:selected").text() +" ya esta asignado al usuario",
                    icon: "info"
                    })
            }else{
                table_standards.row.add([select_standard.value , $("#select_standard option:selected").text(), edit_validity.value ,`<button type="button" class="btn btn-active-light-danger btn-sm me-0 ms-0" data-kt-standard-table-filter="delete_standard">
                       <i class="ki-outline ki-trash text-danger fs-2"></i>
                    </button>`]).draw()
            }
        }
        else{
            Swal.fire({
                title: "Advertencia!",
                text: "Selecciona una norma!",
                icon: "warning"
                })
        }

    })
    // ADD COUNTRY TO DATATABLE
    btn_add_country.addEventListener("click", function (t) {
        t.preventDefault()
        if(select_country.value != ""){
            var data = table_countries.rows().data() // All data datatable permissions
            let repeat=false
            for (var i = 0; i < data.length; i++) {
                if (data[i][0] == select_country.value) {
                    repeat=true
                }
            }
            if(repeat){
                Swal.fire({
                    title: "Advertencia!",
                    text: "El estado " + $("#select_country option:selected").text() +" ya esta asignado al usuario!",
                    icon: "warning"
                    })
            }else{
                table_countries.row.add([select_country.value, $("#select_country option:selected").text(), `<button type="button" class="btn btn-active-light-danger btn-sm me-0 ms-0" data-kt-customer-table-filter="delete_country">
                    <i class="ki-outline ki-trash text-danger fs-2"></i>
                    </button>`]).draw()
            }
        }
        else{
            Swal.fire({
                title: "Advertencia!",
                text: "Seleccione un permiso!",
                icon: "warning"
                })
        }

    })
    // SAVE PERMISSIONS TO USER
    btn_save_permissions.addEventListener("click", function (t) {
        t.preventDefault()
        var data = table_permissions.column(0).data().toArray()
        // Realizar la petición AJAX
        $.ajax({
            url: 'save_user_permissions',
            type: 'POST',
            data: {
                permissions:JSON.stringify(data),
                user_id:edit_id_permission.value
            },
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
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
                        (modal_permission.hide())
                })
            },
            error: function(error) {
                console.error('Error al guardar datos:', error)
            }
        })
    })
    // SAVE COUNTRIES TO USER
    btn_save_countries.addEventListener("click", function (t) {
        t.preventDefault()
        var data = table_countries.column(0).data().toArray()
        // Realizar la petición AJAX
        $.ajax({
            url: 'save_user_countries',
            type: 'POST',
            data: {
                countries:JSON.stringify(data),
                user_id:edit_id_country.value
            },
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
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
                        (modal_countries.hide())
                })
            },
            error: function(error) {
                console.error('Error al guardar datos:', error)
            }
        })
    })
    // SAVE STANDARDS TO USER
    btn_save_standards.addEventListener("click", function (t) {
        t.preventDefault()
        let standards = [];
        table_standards.rows().data().each(function (value) {
            standards.push({
                standard_id: value[0],
                validity: value[2]
            });
        });
        // Realizar la petición AJAX
        $.ajax({
            url: 'save_user_standards',
            type: 'POST',
            data: {
                standards:JSON.stringify(standards),
                user_id:edit_id_standard.value
            },
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function(response) {
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
                        (modal_standards.hide())
                })
            },
            error: function(error) {
                console.error('Error al guardar datos:', error)
            }
        })
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
                        ),

                        $.ajax({
                            url: "users",
                            type: "POST",
                            dataType:"json",
                            encode: "true",
                            headers: {
                                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                            },
                            data: $("#kt_modal_add_user_form").serialize(),
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
                                            !1), table_items.ajax.reload(), form.reset(), validations.resetForm(true))
                                })
                            },
                            beforeSend(){
                                Swal.fire({
                                    title: "<strong>Cargando</strong>",
                                    html: `<span class='loader'></span>`,
                                    showConfirmButton: false,
                                    })
                            },
                            error(data){
                                Swal.fire({
                                    icon: "error",
                                    title: "Error",
                                    text: "Ocurrio un error en la base de datos!",
                                })
                                    console.log(data)
                            }
                        })

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
