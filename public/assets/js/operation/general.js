class Operation {
    constructor(token) {
        this.token = $('meta[name="csrf-token"]').attr('content')
    }

    checked(campo, check) {
        if (check.checked) {
            campo.value = 1
        } else {
            campo.value = 0
        }
    }

    get_next_selects(catalog, id, select_change, id_change = null) {
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

    async add_products(table_products, btn_add_product, form_products, embarque_id, edit_text_products = null) {
        let edit_lote = document.getElementById('lote'),
        edit_sader = document.getElementById('sader'),
        edit_cantidad = document.getElementById('cantidad'),
        edit_peso = document.getElementById('peso'),
        edit_cartilla = document.getElementById('cartilla'),
        select_presentacion = $('#presentacion_id'),
        select_variedad = $('#variedad_product_id'),
        select_marca = $('#select_marca'),
        count_products = 0

        const validations_products = FormValidation.formValidation(form_products, {
            fields: {
                cantidad: {
                    validators: {
                        notEmpty: {
                            message: 'Cantidad requerida'
                        }
                    },
                },
                peso: {
                    validators: {
                        notEmpty: {
                            message: 'Peso requerido'
                        }
                    },
                },
                presentacion_id: {
                    validators: {
                        notEmpty: {
                            message: 'Presentación requerida'
                        }
                    }
                },
                variedad_product_id: {
                    validators: {
                        notEmpty: {
                            message: 'Variedad requerida'
                        }
                    }
                },
            },
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                bootstrap: new FormValidation.plugins.Bootstrap5({
                    rowSelector: ".fv-row",
                    eleInvalidClass: "fv-invalid",
                    eleValidClass: "fv-valid",
                }),
            },
        })
        const result = await validations_products.validate();
        // validations_products && validations_products.validate().then((e) => {
            if (result === "Valid") {
                let ban
                btn_add_product.setAttribute("data-kt-indicator", "on")
                if (edit_text_products != null) {
                    count_products += 1;
                    if(edit_text_products != 1){
                        edit_text_products.value = count_products;
                    }
                    ban = true
                } else {
                    ban = await this.save_products(embarque_id, btn_add_product)
                }
                if(ban > 0){
                    table_products.row.add([
                        `<button data-id="${ban}" type="button" class="btn btn-active-light-danger btn-sm me-0 ms-0 delete_product" data-kt-customer-table-filter="delete_row">
                    <i class="ki-outline ki-trash text-danger fs-2"></i>
                    </button>`,
                        select_variedad.val(),
                        select_variedad.find('option:selected').text(),
                        select_presentacion.val(),
                        select_presentacion.find('option:selected').text(),
                        edit_cantidad.value,
                        edit_peso.value,
                        edit_cantidad.value * edit_peso.value,
                        select_marca.val(),
                        select_marca.find('option:selected').text(),
                        edit_lote.value,
                        edit_sader.value,
                        edit_cartilla.value,
                    ]).draw()

                    btn_add_product.setAttribute("data-kt-indicator", "off")
                    form_products.reset()
                    toastr.success("Agregado correctamente")
                }

            } else {
                Swal.fire({
                    text: "Error, faltan algunos datos, intente de nuevo por favor.",
                    icon: "error",
                    buttonsStyling: false,
                    confirmButtonText: "Entendido!",
                    customClass: {
                        confirmButton: "btn btn-primary",
                    },
                });
            }
        // })

    }

    async save_products(embarque_id, btn_add_product) {
        let form = new FormData(document.getElementById("kt_modal_add_product_form"))
        form.append('embarque_id', embarque_id)
        try {
            const respuesta = await fetch('save_products_embarque', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                "X-CSRF-TOKEN": this.token,
                },
                body: JSON.stringify(Object.fromEntries(form.entries()))
            })

            if (!respuesta.ok) {
                throw new Error(`Error en la solicitud: ${respuesta.status}`)
            }
            const data = await respuesta.json();
            console.log(data)
            return data.id;
        }
        catch (error) {
            Swal.fire({
                text: "Error, ocurrio un error en la base de datos.",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Entendido!",
                customClass: {
                    confirmButton: "btn btn-primary",
                },
            })
            btn_add_product.setAttribute("data-kt-indicator", "off")
            console.error('Error al obtener los datos:', error)
            return (false)
        }
    }

    async delete_product(product_id, catalog) {
        try {
            const respuesta = await fetch(`delete_${catalog}_embarque/${product_id}`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                }
            })

            if (!respuesta.ok) {
                return (false)
            }
            return (true)
        }
        catch (error) {
            Swal.fire({
                text: "Error, ocurrio un error en la base de datos.",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Entendido!",
                customClass: {
                    confirmButton: "btn btn-primary",
                },
            })
            btn_add_product.setAttribute("data-kt-indicator", "off")
            console.error('Error al obtener los datos:', error)
            return (false)
        }
    }

    validate_plantilla(url, type_route, pais_id, variedad_id) {
        fetch(url, {
            method: type_route,
            headers:{
                'Content-Type': 'application/json',
                "X-CSRF-TOKEN": this.token,
            }
        })
        .then(response =>{
            if(!response.ok){
                Swal.fire({
                    title: "Advertencia!",
                    text: "Actualmente no existe ninguna plantilla con el país ni variedad seleccionada!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#1F4529",
                    confirmButtonText: "Crear plantilla",
                    cancelButtonText: "Cancelar"
                  }).then((result) => {
                    if (result.isConfirmed) {
                        let messageType = 'Alerta'
                        let message = 'Actualmente no existe ninguna plantilla con el país ni origen seleccionado!'
                        window.location.href = `plantillas_rpv?message_type=${messageType}&message=${message}&variedad_id=${variedad_id}&pais_id=${pais_id}`;

                    }
                    else{
                        $("#municipio_id").val(null).trigger("change.select2")
                    }
                  })
                throw new Error('Error en la base de datos')
            }
            return response.json()
        })
        .then(data => {
            console.log(data)

        })
        .catch(error => {
            console.error(error)
        })
    }

    get_products_embarque(embarque_id, table_products, modal) {
        fetch(`get_products_embarque/${embarque_id}`, {
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
            table_products.clear().draw();
            data.forEach(item => {
                table_products.row.add([`<button data-id="${item.id}" type="button" class="btn btn-active-light-danger btn-sm me-0 ms-0 delete_product" data-kt-customer-table-filter="delete_row">
                    <i class="ki-outline ki-trash text-danger fs-2"></i>
                    </button>`,
                    item.variedad_id,
                    item.variedad,
                    item.presentacion_id,
                    item.presentacion,
                    item.cantidad,
                    item.peso,
                    item.total_kilos,
                    item.marca_id,
                    item.marca,
                    item.lote,
                    item.sader,
                    item.cartilla
                    ]).draw()
            });
            modal.show()
        })
        .catch(error => {
            console.error(error)
        })
    }

    add_fields = (table, select, observations, ban,  count_standards = null, edit_text_standard = null) => {
        if(select.val() != ""){
            var data = table.rows().data();
            let repeat=false;
            for (var i = 0; i < data.length; i++) {
                if (data[i][0] == select.val()) {
                    repeat=true;
                }
            }
            if(repeat){
                Swal.fire({
                    title: "Advertencia!",
                    text: select.select2('data')[0].text +" ya esta agragado!",
                    icon: "warning"
                  });
            }else{

                table.row.add([select.val(), select.select2('data')[0].text, observations.value, `<button type="button" class="btn btn-active-light-danger btn-sm me-0 ms-0" data-kt-customer-table-filter="delete_row">
                <i class="ki-outline ki-trash text-danger fs-2"></i>
                </button>`]).draw()
                if(ban){
                    count_standards = count_standards + 1
                    edit_text_standard.value=count_standards
                }

            }
        }
        else{
            Swal.fire({
                title: "Advertencia!",
                text: "Seleccione un registro!",
                icon: "warning"
              });
        }
    }

    get_standards_embarque(embarque_id, table_standards, modal_standards) {
        fetch(`get_standards_embarque/${embarque_id}`, {
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
            table_standards.clear().draw();
            data.forEach(item => {
                table_standards.row.add([item.id, item.name, item.observations, `<button type="button" class="btn btn-active-light-danger btn-sm me-0 ms-0 delete_standard" data-kt-customer-table-filter="delete_row">
        <i class="ki-outline ki-trash text-danger fs-2"></i>
        </button>`]).draw()
            })
            modal_standards.show()
        })
        .catch(error => {
            console.error(error)
        })
    }

    save_standards_embarque(embarque_id, table_standards, modal_standards) {
        let standards = [];
        table_standards.rows().data().each(function (value) {
            standards.push({
                standard_id: value[0],
                standard: value[1],
                observations: value[2]
            });
        })
        console.log(standards)
        fetch(`save_standards_embarques`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                "X-CSRF-TOKEN": this.token,
            },
            body: JSON.stringify({
                embarque_id: embarque_id,
                standards: standards
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la base de datos');
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
                title: "Éxito!",
                text: "Las normas han sido guardadas correctamente!",
                icon: "success"
            });
            modal_standards.hide();
        })
        .catch(error => {
            console.error(error);
            Swal.fire({
                title: "Error!",
                text: "Hubo un problema al guardar las normas!",
                icon: "error"
            });
        });
    }
}

export default new Operation()
