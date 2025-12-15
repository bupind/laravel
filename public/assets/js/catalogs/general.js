class Catalogs {
    constructor() {}
    // CHECK AND CHANGUE VALUE
    checked(campo, check) {
        if (check.checked) {
            campo.value = 1
        } else {
            campo.value = 0
        }
    }
    // CHECK AND CHANGUE VALUE FOR EDIT
    checked_edit(activo, campo, check) {
        if(activo){
            check.checked = true
            campo.value = 1
        }
        else{
            check.checked = false
            campo.value = 0
        }
    }

    delete_items(selector, table_items, catalog, catalog_item, token) {
        const e = selector.querySelectorAll('[type="checkbox"]')
        const o = document.querySelector(`[data-kt-${catalog_item}-table-select="delete_selected"]`)
        const self = this

        e.forEach((t) => {
            t.addEventListener("click", () => {
                setTimeout(function () {
                    self.uncheck(selector, catalog_item)
                }, 50)
            })
        })

        o.addEventListener("click", function () {
                let arr_items_deleted = []
                e.forEach((e) => {
                    e.checked && arr_items_deleted.push($(e).data("id"))
                })
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
                        self.delete_submit(catalog, arr_items_deleted, token, table_items)
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

    uncheck(selector, catalog_item) {
        const t = document.querySelector(`[data-kt-${catalog_item}-table-toolbar="base"]`)
        const e = document.querySelector(`[data-kt-${catalog_item}-table-toolbar="selected"]`)
        const o = document.querySelector(`[data-kt-${catalog_item}-table-select="selected_count"]`)
        const c = selector.querySelectorAll('tbody [type="checkbox"]')

        let r = !1
        let l = 0

        c.forEach((t) => {
            t.checked && ((r = !0), l++)
        }),

        r   ? ((o.innerHTML = l),
                t.classList.add("d-none"),
                e.classList.remove("d-none"))
            : (t.classList.remove("d-none"), e.classList.add("d-none"))

    }

    submit_form(catalog, datos, token, modal, tableItems, btnSubmit, form, validations) {
        modal.hide()
        fetch(catalog, {
            method: "POST",
            headers: {
                "X-CSRF-TOKEN": token,
            },
            body: datos,
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Error en la base de datos")
            }
            return response.json()
        })
        .then((result) => {
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
                    btnSubmit.disabled = false
                    tableItems.ajax.reload()
                    form.reset()
                    validations.resetForm(true)
                }
            })
        })
        .catch((error) => {
            modal.show()
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message,
            })
            console.error(error)
            btnSubmit.disabled = false
        })

        Swal.fire({
            title: "<strong>Cargando</strong>",
            html: `<div class="loader"></div>`,
            showConfirmButton: false,
        })
    }

    delete_submit(catalog, datos, token, table_items){
        fetch(`destroy_${catalog}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': token
            },
            body: JSON.stringify({ ids: datos })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la base de datos')
            }
            return response.json()
        })
        .then(result => {
            Swal.fire({
                text: "Datos eliminados correctamente!",
                icon: "success",
                buttonsStyling: false,
                confirmButtonText: "Entendido!",
                customClass: {
                    confirmButton: "btn btn-primary",
                },
            }).then(({ isConfirmed }) => {
                if (isConfirmed) {
                table_items.ajax.reload()
                }
        })
        })
        .catch(error => {

            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message,
            })
            console.error(error)
        })
        Swal.fire({
            title: "<strong>Cargando</strong>",
            html: `<div class="loader"></div>`,
            showConfirmButton: false,
        })
    }

    get_next_selects(catalog, id, select_change, id_change = null){
        console.log("catalogo a consultar", catalog)
        console.log("id a consultar", id)
        console.log("select a cambiar", id_change)
        fetch(`/catalogs/get_${catalog}?id=${id}`, {
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
            const arr_data = data.catalogo
            select_change.empty()
                arr_data.forEach(item => {
                    const option = new Option(item.nombre, item.id);
                    select_change.append(option)
                })
            select_change.val(id_change).trigger('change.select2');

        })
        .catch(error => {
            console.error(error)
        })
    }
}

export default new Catalogs()
