"use strict"

import Operation from "./general.js"

const token = $('meta[name="csrf-token"]').attr('content')
let blockUI, target
let embarque_id = 0
const exportButtons = () => {
    const documentTitle = 'Embarques';
    var buttons = new $.fn.dataTable.Buttons(table_items, {
        buttons: [
            {
                extend: 'copyHtml5',
                title: documentTitle
            },
            {
                extend: 'excelHtml5',
                title: documentTitle
            },
            {
                extend: 'csvHtml5',
                title: documentTitle
            },
            {
                extend: 'pdfHtml5',
                title: documentTitle
            }
        ]
    }).container().appendTo($('#kt_datatable_example_buttons'));

    const exportButtons = document.querySelectorAll('#kt_datatable_example_export_menu [data-kt-export]');
    exportButtons.forEach(exportButton => {
        exportButton.addEventListener('click', e => {
            e.preventDefault();
            const exportValue = e.target.getAttribute('data-kt-export');
            const target = document.querySelector('.dt-buttons .buttons-' + exportValue);
            target.click();
        });
    });
}
const handleSearchDatatable = () => {
    const filterSearch = document.querySelector('[data-kt-filter="search"]');
    filterSearch.addEventListener('keyup', function (e) {
        table_items.search(e.target.value).draw();
    });
}
let table_items,
    edit_folio,
    btn_search,
    btn_products,
    btn_standards,
    btn_add_product,
    btn_add_standard,
    btn_save_standards,
    btn_save,
    btn_finish,
    btn_import,
    form_products,
    form_rpv,
    span_fecha_embarque,
    span_hora_embarque,
    select_standard,
    select_marca,
    select_empaque,
    select_destinatario,
    select_lugar,
    select_uso,
    select_puerto,
    edit_numero_economico,
    edit_placas,
    edit_origen,
    dates,
    filter,
    modal,
    modal_standards,
    modal_upload,
    modal_import,
    modal_cancel,
    table_products,
    table_standards,
    observations,
    var_destinatario = 0,
    validations,
    n

    const save_embarque = (formulario, embarque_id) => {
        const clase = "p_input"
        const inputs = formulario.querySelectorAll(`input.${clase}`)
        let datosFormulario = {}
        datosFormulario = {
            embarque_id: embarque_id,
            folio_embarque: edit_folio.value,
            lugar_id: select_lugar.val(),
            empaque_id: select_empaque.val(),
            destinatario_id: select_destinatario.val(),
            uso_id: select_uso.val(),
            puerto_id: select_puerto.val(),
            numero_economico: edit_numero_economico.value,
            placas_transporte: edit_placas.value,
            origen: edit_origen.value
        }
        Array.from(inputs).forEach(input => {
            switch(input.type) {
                case 'checkbox':
                    datosFormulario[input.id] = input.checked
                    break
                case 'radio':
                    if(input.checked) {
                        datosFormulario[input.name] = input.value
                    }
                    break
                case 'select-multiple':
                    datosFormulario[input.id] = Array.from(input.selectedOptions).map(option => option.value)
                    break
                default:
                    datosFormulario[input.id] = input.value
            }
        })
        fetch(`save_embarque_rpv`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token
            },
            body: JSON.stringify(datosFormulario)
        })
        .then(
            async response => {
                return response.json();
            }
        )
        .then(data => {
            Swal.fire({
                text: "Datos guardados exitosamente!",
                icon: "success",
                buttonsStyling: false,
                confirmButtonText: "Entendido!",
                customClass: {
                    confirmButton: "btn btn-primary",
                },
            }).then(({ isConfirmed }) => {
                if (isConfirmed) {
                    location.reload()
                }
            })
        })
        .catch((error) => {
            console.error('Error:', error)
        })
        Swal.fire({
            title: "<strong>Cargando</strong>",
            html: `<span class='loader'></span>`,
            showConfirmButton: false,
        })
    }
    const finish_embarque = (formulario, embarque_id) => {
        const clase = "p_input"
        const inputs = formulario.querySelectorAll(`input.${clase}`)
        let datosFormulario = {}
        datosFormulario = {
            embarque_id: embarque_id,
            folio_embarque: edit_folio.value,
            lugar_id: select_lugar.val(),
            empaque_id: select_empaque.val(),
            destinatario_id: select_destinatario.val(),
            uso_id: select_uso.val(),
            puerto_id: select_puerto.val(),
            numero_economico: edit_numero_economico.value,
            placas_transporte: edit_placas.value,
            origen: edit_origen.value
        }
        Array.from(inputs).forEach(input => {
            switch(input.type) {
                case 'checkbox':
                    datosFormulario[input.id] = input.checked
                    break
                case 'radio':
                    if(input.checked) {
                        datosFormulario[input.name] = input.value
                    }
                    break
                case 'select-multiple':
                    datosFormulario[input.id] = Array.from(input.selectedOptions).map(option => option.value)
                    break
                default:
                    datosFormulario[input.id] = input.value
            }
        })
        fetch(`finish_embarque_rpv`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token
            },
            body: JSON.stringify(datosFormulario)
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw data;
            }
            return data;
        })
        .then(data => {
            Swal.fire({
                text: "Datos guardados y embarque terminado exitosamente!",
                icon: "success",
                buttonsStyling: false,
                confirmButtonText: "Entendido!",
                customClass: {
                    confirmButton: "btn btn-primary",
                },
            }).then(({ isConfirmed }) => {
                if (isConfirmed) {
                    location.reload();
                }
            });
        })
        .catch(error => {
            Swal.fire({
                text: error.error || "Ocurrió un error inesperado.",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Entendido!",
                customClass: {
                    confirmButton: "btn btn-primary",
                },
            });
        });

        // Mensaje de carga mientras se procesa la solicitud
        Swal.fire({
            title: "<strong>Cargando</strong>",
            html: `<span class='loader'></span>`,
            showConfirmButton: false,
        });
    }
    const edit = () => {
        n.querySelectorAll(
            '[data-kt-admin-table-filter="edit"]'
        ).forEach((e) => {
            e.addEventListener("click", function (e) {
                e.preventDefault()
                fetch(`get_embarque_edit/${$(this).data("id")}`, {
                    method: "GET",
                    headers:{
                        'Content-Type': 'application/json'
                    }
                })
                .then(response =>{
                    if(!response.ok){
                        throw new Error('Error en la base de datos')
                    }
                    return response.json()
                })
                .then(data => {
                    const {plantilla, embarque, marcas } = data
                    delete plantilla.id
                    delete plantilla.created_at
                    delete plantilla.deleted_at
                    delete plantilla.updated_at

                    span_fecha_embarque.value  = (embarque.fecha_embarque).substring(0,10)
                    span_hora_embarque.value  = (embarque.fecha_embarque).substring(11)
                    edit_folio.value  = embarque.folio_embarque
                    edit_folio.disabled = false
                    for (const [key, value] of Object.entries(plantilla)) {
                        const elementos = document.getElementsByName(key);
                        if (elementos.length > 0) {
                            if (elementos[0].type === 'radio') {
                            elementos.forEach(radio => {
                                radio.checked = radio.value == value;
                            });
                            } else if (elementos[0].type === 'checkbox') {
                            elementos[0].checked = Boolean(value);
                            } else {
                                elementos[0].value = value;
                            }
                        }
                    }
                    for (const [key, value] of Object.entries(embarque)) {
                        const embarques_data = document.getElementsByName(key);
                        if (embarques_data.length > 0) {
                            if (embarques_data[0].tagName.toLowerCase() === 'span') {
                                embarques_data[0].innerText = value;
                            } else {
                                embarques_data[0].value = value;
                            }
                        }
                    }
                    // MARCAS
                    select_marca.empty()
                    marcas.forEach(item => {
                        const option = new Option(item.nombre, item.id);
                        select_marca.append(option)
                    })
                    $("#empaque_id").val(data.embarque.empaque_id).trigger("change.select2")
                    var_destinatario = data.embarque.destinatario_id
                    select_empaque.trigger('change');
                    $("#uso_id").val(data.embarque.uso_id).trigger("change.select2")
                    $("#lugar_id").val(data.embarque.lugar_id).trigger("change.select2")
                    $("#puerto_id").val(data.embarque.puerto_id).trigger("change.select2")
                    edit_numero_economico.value = data.embarque.numero_economico
                    edit_placas.value = data.embarque.placas_transporte
                    edit_origen.value = data.embarque.origen
                    document.getElementById('btn_products').setAttribute('data-embarque', embarque.id);
                    document.getElementById('btn_standards').setAttribute('data-embarque', embarque.id);
                    document.querySelector('#kt_accordion_1_header_2 button').classList.remove('collapsed');
                    document.querySelector('#kt_accordion_1_body_2').classList.add('show');
                    document.querySelectorAll('.accordion-collapse').forEach((accordion) => {
                        if (accordion !== document.querySelector('#kt_accordion_1_body_2')) {
                            accordion.classList.remove('show');
                        }
                    });
                    embarque_id = embarque.id
                    btn_save.classList.remove("d-none")
                    btn_finish.classList.remove("d-none")
                    blockUI.release()
                })
                .catch(error => {
                    console.error(error)
                })

            })
        })
    }
    const upload = () => {
        n.querySelectorAll(
            '[data-kt-admin-table-filter="upload"]'
        ).forEach((e) => {
            e.addEventListener("click", function (e) {
                e.preventDefault()
                modal_upload.show()

            })
        })
    }
    const print = () => {
        n.querySelectorAll(
            '[data-kt-admin-table-filter="print"]'
        ).forEach((e) => {
            e.addEventListener("click", function (e) {
                e.preventDefault()
                Swal.fire("Esta en mantenimiento")

            })
        })
    }
    const copy = () => {
        n.querySelectorAll(
            '[data-kt-admin-table-filter="copy"]'
        ).forEach((e) => {
            e.addEventListener("click", function (e) {
                e.preventDefault()

                Swal.fire({
                    title: "Copiar DV",
                    text: "Estás a punto de realizar una copia de este embarque, ¿Estás seguro?",
                    icon: "info",
                    showCancelButton: !0,
                    buttonsStyling: !1,
                    confirmButtonText: "Sí, copiar!",
                    cancelButtonText: "No, cancelar",
                    customClass: {
                        confirmButton: "btn fw-bold btn-success",
                        cancelButton: "btn fw-bold btn-active-light-primary",
                    },
                }).then((e) => {
                    e.value &&
                    fetch(`copy_embarque_rpv/${$(this).data('id')}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    })
                    .then(
                        async response => {
                            return response.json();
                        }
                    )
                    .then(data => {
                        Swal.fire({
                            text: "DV copiado exitosamente!",
                            icon: "success",
                            buttonsStyling: false,
                            confirmButtonText: "Entendido!",
                            customClass: {
                                confirmButton: "btn btn-primary",
                            },
                        }).then(({ isConfirmed }) => {
                            if (isConfirmed) {
                                location.reload()
                            }
                            else{
                                console.log("no se recargo")
                                Swal.close()
                            }
                        })
                    })
                    .catch((error) => {
                        console.error('Error:', error)
                    })
                    Swal.fire({
                        title: "<strong>Cargando</strong>",
                        html: `<span class='loader'></span>`,
                        showConfirmButton: false,
                    })
                })
            })
        })
    }
    const delete_embarque = () => {
        n.querySelectorAll(
            '[data-kt-admin-table-filter="delete"]'
        ).forEach((e) => {
            e.addEventListener("click", function (e) {
                e.preventDefault()
                Swal.fire({
                    title: "¿Estás seguro?",
                    text: "No podrás realizar ningúna acción con este DV!",
                    icon: "warning",
                    showCancelButton: !0,
                    buttonsStyling: !1,
                    confirmButtonText: "Sí, eliminar!",
                    cancelButtonText: "No, cancelar",
                    customClass: {
                        confirmButton: "btn fw-bold btn-danger",
                        cancelButton: "btn fw-bold btn-active-light-primary",
                    },
                }).then((e) => {
                    e.value &&
                        modal_cancel.show()
                        $('#form_cancel').attr('action', `/operation/cancel_embarque/${$(this).data("id")}`)
                });

            })
        })
    }

export default function init(){
    target = document.querySelector("#kt_block_ui_1_target")
    blockUI = new KTBlockUI(target, {
        overlayClass: "bg-success bg-opacity-15",
        message: '<div class="blockui-message"><span class="spinner-border text-primary"></span> Bloqueado seleccione un embarque...</div>'
    })
    modal = new bootstrap.Modal(document.querySelector("#kt_modal_add_product"))
    modal_standards = new bootstrap.Modal(document.querySelector("#kt_modal_edit_standards"))
    modal_upload = new bootstrap.Modal(document.querySelector("#kt_modal_upload"))
    modal_import = new bootstrap.Modal(document.querySelector("#kt_modal_import"))
    modal_cancel = new bootstrap.Modal(document.querySelector("#kt_modal_cancel"))
    span_fecha_embarque = document.querySelector('#fecha_embarque_new')
    span_hora_embarque = document.querySelector('#hora_embarque_new')
    form_products = document.querySelector("#kt_modal_add_product_form")
    form_rpv = document.querySelector("#form_rpv")
    dates = document.querySelector('#dates')
    filter = document.querySelector('#dates_filter')
    edit_folio = document.querySelector('#FolioRPV')
    btn_search = document.querySelector('#btn_search')
    btn_products = document.getElementById('btn_products')
    btn_standards = document.getElementById('btn_standards')
    btn_add_product = document.querySelector("#btn_add_product")
    btn_add_standard = document.querySelector("#btn_add_standard")
    btn_save_standards = document.querySelector("#btn_save_standards")
    btn_save = document.querySelector("#btn_save")
    btn_finish = document.querySelector("#btn_finish")
    btn_import = document.querySelector("#btn_import")
    observations = document.querySelector("#observations")
    select_standard = $('#select_standard')
    select_empaque = $('#empaque_id')
    select_destinatario = $('#destinatario_id')
    select_marca = $('#select_marca')
    select_lugar = $('#lugar_id')
    select_uso = $('#uso_id')
    select_puerto = $('#puerto_id')
    edit_numero_economico = document.querySelector('#numero_economico')
    edit_placas = document.querySelector('#placas_transporte')
    edit_origen = document.querySelector('#origen_embarque')
    n = document.querySelector("#kt_admin_table")
    table_items = $(n).DataTable({
        ajax: {
            url:"embarques_admin",
            data: {
                dates: function() {return dates.value},
                filter : function() {return filter.value}
            }
        },
        serverSide: true,
        processing: true,
        fixedColumns: {
            start: 1,
            end: 1
        },
        scrollCollapse: true,
        scrollX: true,
        columns: [
            { data: "id", name: "id" },
            { data: "status", name: "status" },
            { data: "folio_embarque", name: "folio_embarque" },
            { data: "nombre_fiscal", name: "nombre_fiscal" },
            { data: "nombre", name: "nombre" },
            { data: "puerto", name: "puerto" },
            { data: "tefs", name: "tefs" },
            { data: "fecha_embarque", name: "fecha_embarque" },
            { data: "buttons", name: "buttons" },

        ],
        order: [[7, "desc"]],
        language: {
            zeroRecords: "<div class='container-fluid '> <div class='d-flex flex-center'>" +
            "<span>No hay datos que mostrar</span></div></div>",
            info: "Mostrando página _PAGE_ de _PAGES_",
            infoEmpty: "No hay información",
            infoFiltered: "(Filtrando _MAX_ registros)",
            processing: "<span class='loader'></span>",
        },
        drawCallback: function() {
            $('[data-bs-toggle="tooltip"]').tooltip()
        },
    }).on("draw", function () {
        edit(), upload(), print(), exportButtons(),handleSearchDatatable(), delete_embarque(), copy()
    })
    validations = FormValidation.formValidation(form_rpv, {
        fields: {
            lugar_id: {
                validators: {
                    notEmpty: {
                        message: "El lugar es requerido",
                    }
                },
            },
            empaque_id: {
                validators: {
                    notEmpty: {
                        message: "El empaque es requerido",
                    }
                },
            },
            destinatario_id: {
                validators: {
                    notEmpty: {
                        message: "El destinatario es requerido",
                    }
                },
            },
            uso_id: {
                validators: {
                    notEmpty: {
                        message: "El uso es requerido",
                    }
                },
            },
            origen_embarque:{
                validators: {
                    notEmpty: {
                        message: "El origen es requerido",
                    }
                }
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
    // TABLE PRODUCTS
    table_products = $("#kt_products_table").DataTable({
        order: [[1, "asc"]],
        columnDefs: [
            { orderable: !1, targets: 0 },
            { orderable: !1, targets: 1, visible : 0 },
            { orderable: !1, targets: 3, visible : 0 },
            { orderable: !1, targets: 8, visible : 0 },
        ],
        language: {
            zeroRecords: "<div class='container-fluid '> <div class='d-flex flex-center'>" +
            "<span>No hay datos que mostrar</span></div></div>",
            info: "Mostrando página _PAGE_ de _PAGES_",
            infoEmpty: "No hay información",
            infoFiltered: "(Filtrando _MAX_ registros)",
            processing: "<span class='loader'></span>",
        },
    })
        // TABLE standards
    table_standards = $("#kt_standards_table").DataTable({
        order: [[1, "asc"]],
        columnDefs: [
            { orderable: !1, targets: 0, visible:0 },
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
    })
    btn_search.addEventListener('click', function () {
        filter.value=1;
        table_items.ajax.reload()
    })
    btn_products.addEventListener('click', function () {
        Operation.get_products_embarque($(this).data("embarque"), table_products, modal)
    })
    btn_standards.addEventListener('click', function () {
        Operation.get_standards_embarque($(this).data("embarque"), table_standards, modal_standards)
    })
    // SAVE EMBARQUE RPV
    btn_save.addEventListener("click", function (t) {
        t.preventDefault()
        save_embarque(form_rpv, embarque_id)
    })
    // IMPORT
    btn_import.addEventListener("click", function (t) {
        t.preventDefault()
        modal_import.show()
    })
    // SAVE EMBARQUE RPV
    btn_finish.addEventListener("click", function (t) {
        t.preventDefault()
        validations &&
        validations.validate().then(function (e) {
            "Valid" == e
                ?
                finish_embarque(form_rpv, embarque_id)
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
    // ADD Product
    btn_add_product.addEventListener("click", function (t) {
        t.preventDefault();
        Operation.add_products(table_products, btn_add_product, form_products, embarque_id)
    })
    // ADD standard
    btn_add_standard.addEventListener("click", function (t) {
        t.preventDefault();
        Operation.add_fields(table_standards, select_standard, observations)
    })
    // SAVE standardS
    btn_save_standards.addEventListener("click", function (t) {
        t.preventDefault();
        Operation.save_standards_embarque(embarque_id, table_standards, modal_standards)
    })
    // CHANGE EMPAQUE
    select_empaque.on('change', function() {
        let destinatario_id_change
            if (var_destinatario == 0) {
                destinatario_id_change = select_destinatario.val()
            }
            else{
                destinatario_id_change = var_destinatario
            }
            console.log("el valor es", destinatario_id_change)
            Operation.get_next_selects("destinatarios", destinatario_id_change, select_destinatario, var_destinatario)
    })
    $("#dates").daterangepicker({
        locale: {
            format: 'YYYY-MM-DD',
            applyLabel: 'Aceptar',
            cancelLabel: 'Cancelar'
        },
    })
    $('#kt_products_table tbody').on('click', '.delete_product', function() {
        const id = $(this).data("id")
        if(Operation.delete_product(id, "product")){
            var row = $(this).closest('tr')
            table_products.row(row).remove().draw()
            toastr.success("Eliminado correctamente")
        }
        else{
            toastr.error("El producto no se puede eliminar")
        }
    })
    $('#kt_standards_table tbody').on('click', '.delete_standard', function() {
        var row = $(this).closest('tr')
        table_standards.row(row).remove().draw()
        toastr.success("Eliminado correctamente")
    })
    blockUI.block()

}

document.addEventListener("DOMContentLoaded", () => {
    init()
})
