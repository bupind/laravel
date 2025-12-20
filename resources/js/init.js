import initDatatable from './datatable'

const AutoInit = {
    init(root = document) {
        this.datatable(root)
    },

    datatable(root = document) {
        const wrappers = root.querySelectorAll('.datatable-wrapper:not([data-initialized])')
        console.log('Found datatable wrappers:', wrappers)
        wrappers.forEach(wrapper => initDatatable(wrapper))
    }

}

export default AutoInit
