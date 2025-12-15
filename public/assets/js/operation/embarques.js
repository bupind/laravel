"use strict"
import Operation from "./general.js"

var KTCreateAccount = (function () {
    let check_import
    const token = $('meta[name="csrf-token"]').attr('content')
    var e,
        btn_modal,
        btn_modal_c,
        btn_add_standard,
        btn_add_products,
        btn_add_product,
        count_standards = 0,
        edit_text_standard,
        edit_text_products,
        table_standards,
        table_products,
        stepper_embarques,
        form_embarques,
        form_products,
        modal,
        btn_submit,
        s,
        r,
        select_empaque,
        select_destinatario,
        select_marca,
        select_standard,
        select_pais,
        select_puerto,
        select_tefs,
        select_municipio,
        observations,
        arr_validations = [],
        delete_permission = (table, standard) => {
            document.querySelectorAll('[data-kt-customer-table-filter="delete_row"]').forEach((e) => {
                e.addEventListener("click", function (e) {
                    e.preventDefault();
                    const o = e.target.closest("tr")
                    table.row($(o)).remove().draw()
                    if(standard){
                        edit_text_standard.value = table.column(0).data().length > 0 ? 1 : ''
                    }
                });
            });
        },
        save_embarque = async (datos, token, btnSubmit, form) => {
            try {
                Swal.fire({
                    title: "<strong>Cargando</strong>",
                    html: `<div class="loader"></div>`,
                    showConfirmButton: false,
                });
                const response = await fetch('embarques', {
                    method: "POST",
                    headers: {
                        "X-CSRF-TOKEN": token,
                    },
                    body: datos,
                });
                if (!response.ok) {
                    throw new Error("Error en la base de datos");
                }

                const result = await response.json();
                $('#link_dictamen').attr('href', `/operation/imprimir_dictamen_embarque_rpv/${result.embarque_id}`)
                $('#link_consulta').attr('href', `/operation/embarques_admin`)
                // Mostrar alerta de éxito
                await Swal.fire({
                    text: "Datos guardados exitosamente!",
                    icon: "success",
                    buttonsStyling: false,
                    confirmButtonText: "Entendido!",
                    customClass: {
                        confirmButton: "btn btn-primary",
                    },
                });

                btnSubmit.disabled = false;
                form.reset();

            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.message,
                });
                console.error(error);
                btnSubmit.disabled = false;
            }
        }
    return {
        init: function () {
                (modal = new bootstrap.Modal(document.querySelector("#kt_modal_add_product"))),
                (select_pais = $('#pais_id').select2()),
                (select_empaque = $('#empaque_id').select2()),
                (select_tefs = $('#tefs_id').select2()),
                (select_marca = $('#select_marca').select2()),
                (select_destinatario = $('#destinatario_id').select2()),
                (select_municipio = $('#municipio_id').select2()),
                (select_standard = $('#select_standard').select2()),
                (select_puerto = $('#puerto_id').select2()),
                (edit_text_standard = document.querySelector("#edit_standards")),
                (edit_text_products = document.querySelector("#edit_products")),
                (observations = document.querySelector("#observations")),
                (check_import = document.querySelector("#check_import")),
                (btn_add_standard = document.querySelector("#btn_add_standard")),
                (btn_add_products = document.querySelector("#btn_add_products")),
                (btn_add_product = document.querySelector("#btn_add_product")),
                (stepper_embarques = document.querySelector("#stepper_embarques")),
                (form_embarques = stepper_embarques.querySelector("#form_embarques")),
                (form_products = document.querySelector("#kt_modal_add_product_form")),
                (btn_modal = document.querySelector("#kt_modal_add_product_close")),
                (btn_modal_c = document.querySelector("#cancel_modal")),
                (btn_submit = stepper_embarques.querySelector('[data-kt-stepper-action="submit"]')),
                (s = stepper_embarques.querySelector('[data-kt-stepper-action="next"]')),
                (r = new KTStepper(stepper_embarques)).on("kt.stepper.changed", function (e) {
                    3 === r.getCurrentStepIndex()
                        ? (btn_submit.classList.remove("d-none"),
                            btn_submit.classList.add("d-inline-block"),
                            s.classList.add("d-none"))
                        : 4 === r.getCurrentStepIndex()
                            ? (btn_submit.classList.add("d-none"), s.classList.add("d-none"))
                            : (btn_submit.classList.remove("d-inline-block"),
                                btn_submit.classList.remove("d-none"),
                                s.classList.remove("d-none"))
                }),
                r.on("kt.stepper.next", function (e) {
                    var t = arr_validations[e.getCurrentStepIndex() - 1]
                    t ? t.validate().then(function (t) {
                        if ("Valid" == t) {
                            e.goNext();
                            KTUtil.scrollTop();
                        } else {
                            let errorMessage = "Error, verifique los datos por favor";
                            if (e.getCurrentStepIndex() === 2) {
                                errorMessage = "Error, ingrese al menos una norma";
                            } else if (e.getCurrentStepIndex() === 3) {
                                errorMessage = "Error, ingrese al menos un producto";
                            }
                            Swal.fire({
                                text: errorMessage,
                                icon: "error",
                                buttonsStyling: !1,
                                confirmButtonText: "Entendido!",
                                customClass: { confirmButton: "btn btn-primary" },
                            }).then(function () {
                                KTUtil.scrollTop();
                            });
                        }
                        })
                        : (e.goNext(), KTUtil.scrollTop())
                }),
                r.on("kt.stepper.previous", function (e) {
                    console.log("stepper.previous"), e.goPrevious(), KTUtil.scrollTop()
                }),
                // CHECK IMPORT
                check_import.addEventListener("click", function (t) {
                    if (check_import.checked) {
                        Swal.fire({
                            title: "Advertencia!",
                            text: "Para poder importar un archivo primero necesitas generar el embarque!",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#1F4529",
                            confirmButtonText: "Entendido!",
                            cancelButtonText: "Cancelar"
                          }).then((result) => {
                            if (result.isConfirmed) {
                                edit_text_products.value = 1
                            }
                            else{
                                check_import.checked = false
                                edit_text_products.value = ''
                            }
                          })
                    } else {
                        edit_text_products.value = ''
                    }
                }),
                 // TABLE PERMISSIONS
                (table_standards = $("#kt_standards_table").DataTable({
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
                }).on("draw", function(){
                    delete_permission(table_standards, 1);
                })),
                 // TABLE PRODUCTS
                (table_products = $("#kt_products_table").DataTable({
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
                        infoEmpty: "<div class='container-fluid'>No hay Información</div>",
                        infoFiltered: "(Filtrando _MAX_ registros)",
                        processing:
                            "<span class='fa-stack fa-lg'>\n\
                            <i class='fa fa-spinner fa-spin fa-stack-2x fa-fw'></i>\n\
                        </span>&emsp;Processing Message here...",
                    },
                }).on("draw", function(){
                    delete_permission(table_products, 0);
                })),
                arr_validations.push(
                    FormValidation.formValidation(form_embarques, {
                        fields: {
                            pais_id: {
                                validators: {
                                    notEmpty: { message: "Seleccione un país" },
                                },
                            },
                            empaque_id: {
                                validators: {
                                    notEmpty: { message: "Seleccione un cliente" },
                                },
                            },
                            destinatario_id: {
                                validators: {
                                    notEmpty: { message: "Seleccione un destinatario" },
                                },
                            },
                            tefs_id: {
                                validators: {
                                    notEmpty: { message: "Seleccione un usuario tef" },
                                },
                            },
                            municipio_id: {
                                validators: {
                                    notEmpty: { message: "Seleccione una procedencia" },
                                },
                            },
                            uso_id: {
                                validators: {
                                    notEmpty: { message: "Seleccione un uso" },
                                },
                            },
                            origen: {
                                validators: {
                                    notEmpty: { message: "Ingrese un origen" },
                                },
                            },
                        },
                        plugins: {
                            trigger: new FormValidation.plugins.Trigger(),
                            bootstrap: new FormValidation.plugins.Bootstrap5({
                                rowSelector: ".fv-row",
                                eleValidClass: "is-valid",
                                eleInvalidClass: "is-invalid",
                            }),
                        },
                    })
                ),
                arr_validations.push(
                    FormValidation.formValidation(form_embarques, {
                        fields: {
                            edit_standards: {
                                validators: {
                                    notEmpty: { message: "La norma es obligatorìa" },
                                },
                            },
                        },
                        plugins: {
                            trigger: new FormValidation.plugins.Trigger(),
                            bootstrap: new FormValidation.plugins.Bootstrap5({
                                rowSelector: ".fv-row",
                                eleInvalidClass: "",
                                eleValidClass: "",
                            }),
                        },
                    })
                ),
                arr_validations.push(
                    FormValidation.formValidation(form_embarques, {
                        fields: {
                            edit_products: {
                                validators: {
                                    notEmpty: { message: "La standard es obligatorìa" },
                                },
                            },
                        },
                        plugins: {
                            trigger: new FormValidation.plugins.Trigger(),
                            bootstrap: new FormValidation.plugins.Bootstrap5({
                                rowSelector: ".fv-row",
                                eleInvalidClass: "",
                                eleValidClass: "",
                            }),
                        },
                    })
                ),
                btn_submit.addEventListener("click", function (e) {
                    e.preventDefault
                    arr_validations[0].validate().then(function (t) {
                        const formData = new FormData(document.querySelector(`#form_embarques`));
                        const standardsArray = table_standards.rows().data().toArray().map(row => ({ id: row[0], observation: row[2] }))
                        const productosArray = table_products.data().toArray();
                        formData.append('standards', JSON.stringify(standardsArray))
                        formData.append('productos', JSON.stringify(productosArray))
                        arr_validations[0].enableValidator('puerto_id')
                        arr_validations[0].enableValidator('destinatario_id')
                        "Valid" == t
                            ? (
                                e.preventDefault(),
                                (btn_submit.disabled = !0),
                                btn_submit.setAttribute("data-kt-indicator", "on"),
                                setTimeout(function () {
                                    btn_submit.removeAttribute("data-kt-indicator"),
                                        (btn_submit.disabled = !1),
                                        // save data
                                        save_embarque(formData, token, btn_submit, form_embarques )
                                        r.goNext()
                                }, 2e3))
                            : Swal.fire({
                                text: "Ya se enviaron los datos recarga la página por favor.",
                                icon: "error",
                                buttonsStyling: !1,
                                confirmButtonText: "Entendido!",
                                customClass: { confirmButton: "btn btn-light" },
                            }).then(function () {
                                KTUtil.scrollTop()
                            })
                    })
                }),
                select_tefs.on('change', function() {
                    arr_validations[0].revalidateField('tefs_id')
                })
                 // CHANGE PAIS
                select_pais.on('change', function() {
                    // const select_estado2 = $('#estado_id').select2()
                    arr_validations[0].revalidateField('pais_id')
                    arr_validations[0].disableValidator('puerto_id')
                    Operation.get_next_selects("puertos", select_pais.val(), select_puerto)
                })
                 // CHANGE EMPAQUE
                select_empaque.on('change', function() {
                    arr_validations[0].revalidateField('empaque_id')
                    arr_validations[0].disableValidator('destinatario_id')
                    Operation.get_next_selects("marcas", select_empaque.val(), select_marca)
                    Operation.get_next_selects("destinatarios", select_empaque.val(), select_destinatario)
                })
                // SELECT VARIEDADES
                select_municipio.on('change', function() {
                    arr_validations[0].revalidateField('municipio_id')
                    if(select_pais.val() == "" || select_pais.val() == null){
                        Swal.fire({
                            title: "Advertencia!",
                            text: "Seleccione un país!",
                            icon: "warning"
                          });
                    }
                    else{
                        Operation.validate_plantilla(`validate_plantilla/${select_pais.val()}/${select_municipio.val()}`, 'GET',
                            select_pais.find('option:selected').text(), select_municipio.find('option:selected').text())
                    }
                })
                // CLOSE MODAL
                btn_modal_c.addEventListener("click", function (t) {
                    t.preventDefault(), modal.hide()
                })
                 // CLOSE MODAL
                btn_modal.addEventListener("click", function (t) {
                    t.preventDefault(), modal.hide()
                })
                 // ADD PERMISSION TO DATATABLE
                btn_add_standard.addEventListener("click", function (t) {
                    t.preventDefault();
                    Operation.add_fields(table_standards, select_standard, observations, 1, count_standards, edit_text_standard)
                })
                // ADD Products
                btn_add_products.addEventListener("click", function (t) {
                    t.preventDefault();
                    modal.show()
                })
                 // ADD Product
                btn_add_product.addEventListener("click", function (t) {
                    t.preventDefault();
                    Operation.add_products(table_products, btn_add_product,form_products, 0, edit_text_products)
                })
                $("#fecha_embarque").daterangepicker({
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
                    // drops: 'up'
                })
                $('#kt_products_table tbody').on('click', '.delete_product', function() {
                    var row = $(this).closest('tr')
                    table_products.row(row).remove().draw()
                });
                const popover_procedencia = document.getElementById("pp_procedencia")
                const popover_no_economico = document.getElementById("pp_no_economico")
                const popover_lugar = document.getElementById("pp_lugar")
                const popover_origen = document.getElementById("pp_origen")

                const popover1 = new bootstrap.Popover(popover_procedencia, {
                    html: true,
                    trigger: "focus",
                    sanitize: false,
                    placement: "auto", // Ajusta la posición del popover automáticamente
                    title: "Procedencia", // Título del popover
                    content: `<div style="max-width: 300px;">
                                 <img src="/img/poppovers/procedencia.png" alt="Imagen de procedencia" style="width:100%; display:block;">
                                 <p style="margin-top: 10px;">Es el punto número 3 del DV.</p>
                              </div>`
                });
                const popover2 = new bootstrap.Popover(popover_no_economico, {
                    html: true,
                    trigger: "focus",
                    sanitize: false,
                    placement: "auto", // Ajusta la posición del popover automáticamente
                    title: "Procedencia", // Título del popover
                    content: `<div style="max-width: 300px;">
                                 <img src="/img/poppovers/no_economico.png" alt="Imagen de procedencia" style="width:100%; display:block;">
                                 <p style="margin-top: 10px;">Es el punto número 3 del DV. Es el medio de transporte y placas</p>
                              </div>`
                });
                const popover3 = new bootstrap.Popover(popover_lugar, {
                    html: true,
                    trigger: "focus",
                    sanitize: false,
                    placement: "auto", // Ajusta la posición del popover automáticamente
                    title: "Procedencia", // Título del popover
                    content: `<div style="max-width: 300px;">
                                 <img src="/img/poppovers/lugar.png" alt="Imagen de procedencia" style="width:100%; display:block;">
                                 <p style="margin-top: 10px;">Es el punto número 1 INICIO.</p>
                              </div>`
                });
                const popover4 = new bootstrap.Popover(popover_origen, {
                    html: true,
                    trigger: "focus",
                    sanitize: false,
                    placement: "auto", // Ajusta la posición del popover automáticamente
                    title: "Procedencia", // Título del popover
                    content: `<div style="max-width: 300px;">
                                 <img src="/img/poppovers/origen.png" alt="Imagen de procedencia" style="width:100%; display:block;">
                                 <p style="margin-top: 10px;">Es el punto número 3 del DV. El origen</p>
                              </div>`
                });
        },
    }
})()
KTUtil.onDOMContentLoaded(function () {
    KTCreateAccount.init()
})
