"use strict"

const token = $('meta[name="csrf-token"]').attr('content')

let btn_add,
btn_search,
btn_edit,
edit_id,
btn_imprimir,
select_pais,
select_municipio,
form,
target,
blockUI

const obtener_datos = (formulario, pais, municipio, saveoredit) => {
    const clase = "p_input"
    const url = saveoredit ? "save_plantilla" : "edit_plantilla"

    const inputs = formulario.querySelectorAll(`input.${clase}`)
    let datosFormulario = {}
    if(!saveoredit){
        datosFormulario = {
            pais_id: pais,
            municipio_id: municipio,
            id: edit_id.value
        }
    }
    else{
        datosFormulario = {
            pais_id: pais,
            municipio_id: municipio
        }
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
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token
        },
        body: JSON.stringify(datosFormulario)
    })
    .then(
        async response => {
            if (!response.ok) {
                const data = await response.json()
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Ya existe una plantilla para este país si desea modificarla, seleccione el país y presione el botón de buscar ",
                })
            }
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
        html: `<div class="loader"></div>`,
        showConfirmButton: false,
    })
}
export function init(){
    target = document.querySelector("#kt_block_ui_1_target")
    blockUI = new KTBlockUI(target, {
        overlayClass: "bg-success bg-opacity-15",
        message: '<div class="blockui-message"><span class="spinner-border text-primary"></span> Bloqueado seleccione un pais...</div>'
    })
    btn_add = document.querySelector("#btn_add")
    edit_id = document.querySelector("#plantilla_id")
    btn_edit = document.querySelector("#btn_edit")
    btn_imprimir = document.querySelector("#btn_imprimir")
    btn_search = document.querySelector("#btn_search")
    select_pais = $('#pais_id').select2()
    select_municipio = $("#municipio_id").select2()
    form = document.querySelector("#form_plantilla")

    btn_add.addEventListener("click", function (t) {
        if(select_pais.val() != '' && select_pais.val() !== null){
            obtener_datos(form, select_pais.val(), select_municipio.val(), true)
        }
        else{
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Selecciona un pais",
            })
        }
    })
    btn_edit.addEventListener("click", function (t) {
        if(select_pais.val() != '' && select_pais.val() !== null){
            obtener_datos(form, select_pais.val(), select_municipio.val(), false)
        }
        else{
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Selecciona un pais",
            })
        }
    })
    btn_search.addEventListener("click", function (t) {
        if(select_pais.val() != '' && select_pais.val() !== null && select_municipio.val() != '' && select_municipio.val() !== null){
            fetch(`get_plantilla/${select_pais.val()}/${select_municipio.val()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token
                },
            })
            .then(response => response.json())
            .then(data => {
                const datos = data.plantilla[0]
                if (datos) {
                    edit_id.value = datos.id
                    delete datos.id
                    delete datos.created_at
                    delete datos.deleted_at
                    delete datos.updated_at

                    for (const [key, value] of Object.entries(datos)) {
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
                    btn_imprimir.classList.remove("d-none")
                    btn_edit.classList.remove("d-none")
                    btn_add.classList.add("d-none")
                    $('#btn_imprimir').attr('href', `/operation/imprimir_dictamen/${edit_id.value}`)
                    Swal.close()
                }
                else{
                    Swal.fire({
                        icon: "question",
                        title: "Este país no tiene una plantilla",
                        text: "No se encontró una plantilla para este país con esa variedad, desea crear una nueva plantilla?",
                        showDenyButton: true,
                        showCancelButton: false,
                        confirmButtonColor: "#1F4529",
                        confirmButtonText: "Si, crear una nueva plantilla",
                        denyButtonText: `No, cancelar`,
                    }).then((result) => {
                        if (result.isConfirmed) {
                            blockUI.release()
                            btn_imprimir.classList.add("d-none")
                            btn_edit.classList.add("d-none")
                            btn_add.classList.remove("d-none")
                        } else if (result.isDenied) {
                            btn_imprimir.classList.add("d-none")
                            btn_edit.classList.add("d-none")
                            btn_add.classList.add("d-none")
                            blockUI.block()

                        }
                    })
                }
            })
            .catch((error) => {
                console.error('Error:', error)
            })
            Swal.fire({
                title: "<strong>Cargando</strong>",
                html: `<div class="loader"></div>`,
                showConfirmButton: false,
            })
        }
        else{
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Selecciona un pais y una variedad",
            })
        }

    })
    // CHANGE PAIS
    select_pais.on('change', function() {
        select_municipio.prop('disabled', false)
        blockUI.release()
    })
    blockUI.block()
}

document.addEventListener("DOMContentLoaded", function () {
    init()
})

