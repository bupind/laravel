"use strict"
import Operation from "./general.js"

const catalog = "estados"
const catalog_item = "estado"
const token = $('meta[name="csrf-token"]').attr('content')

var btn_submit,
    form,
    select_empaque,
    select_destinatario,
    select_municipio,
    select_pais,
    validations

export default function init(){
    // inicialize elements html
    btn_submit = document.querySelector("#btn_submit")
    form = document.querySelector("#form_embarques")
    select_empaque = $('#empaque_id').select2()
    select_pais = $('#pais_id').select2()
    select_municipio = $('#municipio_id').select2()
    select_destinatario = $('#destinatario_id').select2()

    validations = FormValidation.formValidation(form, {
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
    // CHANGE EMPAQUE
    select_empaque.on('change', function() {
        validations.revalidateField('empaque_id')
        validations.disableValidator('destinatario_id')
        Operation.get_next_selects("destinatarios", select_empaque.val(), select_destinatario)
    })
    select_municipio.on('change', function() {
        validations.revalidateField('municipio_id')
        if(select_pais.val() == "" || select_pais.val() == null){
            Swal.fire({
                title: "Advertencia!",
                text: "Seleccione un país!",
                icon: "warning"
                });
                $("#municipio_id").val(null).trigger("change.select2")
        }
        else{
            Operation.validate_plantilla(`validate_plantilla/${select_pais.val()}/${select_municipio.val()}`, 'GET',
                select_pais.find('option:selected').text(), select_municipio.find('option:selected').text())
        }
    })
    // SUBMIT
    btn_submit.addEventListener("click", function (e) {
        e.preventDefault(),
        validations &&
        validations.validate().then(function (e) {
            "Valid" == e ? (btn_submit.setAttribute("data-kt-indicator", "on"),
            (btn_submit.disabled = !0),
            setTimeout(function () {
                btn_submit.removeAttribute(
                    "data-kt-indicator"
                )
                const formData = new FormData(document.querySelector(`#form_embarques`))
                fetch(`save_embarques_small`, {
                    method: "POST",
                    headers:{
                        "X-CSRF-TOKEN": token,
                    },
                    body: formData
                })
                .then(response =>{
                    if(!response.ok){
                        throw new Error('Error en la base de datos')
                    }
                    return response.json()
                })
                .then(data => {
                    Swal.fire({
                        text: "Datos guardados y embarque aperturado exitosamente!",
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
                    console.error(error)
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
    init()
})
