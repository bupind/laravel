import $ from 'jquery'
import 'datatables.net-bs5'

export default function initDatatable(wrapper) {
    if (!wrapper) return
    const $wrapper = $(wrapper)
    const route = $wrapper.data('route')
    const batch = Boolean($wrapper.data('batch'))
    const baseOpts = $wrapper.data('options') || {}
    const tableEl = wrapper.querySelector('table')
    if (!tableEl) return
    const $table = $(tableEl)
    if ($.fn.DataTable.isDataTable($table)) {
        $table.DataTable().clear().destroy()
        $table.off('.dt')
        $wrapper.off('.dt')
    }
    const columns = []
    wrapper.querySelectorAll('thead tr:first-child th').forEach(th => {
        const field = th.dataset.field
        if (field === '_checkbox') {
            columns.push({
                data: 'id', orderable: false, searchable: false, className: 'text-center', render: id => `<input type="checkbox" class="form-check-input row-check" value="${id}">`
            })
            return
        }
        if (field === '_rownum') {
            columns.push({
                data: null, orderable: false, searchable: false, className: 'text-center', render: (d, t, r, m) => m.row + m.settings._iDisplayStart + 1
            })
            return
        }
        columns.push({
            data: field, name: field, orderable: field !== 'action', searchable: true, className: field === 'action' ? 'text-center' : ''
        })
    })
    const dt = $table.DataTable({
        ...baseOpts, columns, processing: true, serverSide: true, ajax: {
            url: route, data: function (d) {
                const filters = {}
                $wrapper.find('.column-filter').each(function () {
                    const field = $(this).data('field')
                    if (field && $(this).val()) filters[field] = $(this).val()
                })
                return Object.assign(d, {filters})
            }
        }, paging: true, searching: true, info: true, lengthChange: false, dom: 't',
    })

    function renderFooter() {
        const info = dt.page.info()
        $wrapper.find('#dtInfo').text(`Showing ${info.start + 1} to ${info.end} of ${info.recordsTotal}`)
        const $pagination = $('<ul class="pagination pagination-sm mb-0"></ul>')
        const totalPages = info.pages
        $pagination.append(`<li class="page-item ${info.page === 0 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${info.page - 1}">&laquo;</a></li>`)
        for (let i = 0; i < totalPages; i++) {
            $pagination.append(`<li class="page-item ${info.page === i ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i + 1}</a></li>`)
        }
        $pagination.append(`<li class="page-item ${info.page === totalPages - 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${info.page + 1}">&raquo;</a></li>`)
        $wrapper.find('#dtPagination').empty().append($pagination)
        $wrapper.find('#dtPagination .page-link').off('click').on('click', function (e) {
            e.preventDefault()
            const page = parseInt($(this).data('page'))
            if (!isNaN(page)) dt.page(page).draw('page')
        })
    }

    dt.on('draw.dt', renderFooter)
    renderFooter()
    $wrapper.find('.toggleSearchBtn').off('click.dt').on('click.dt', () => {$table.find('thead tr.filters').toggleClass('d-none')})
    $wrapper.find('.column-filter').off('change keyup').on('change keyup', function () {dt.ajax.reload()})
    $wrapper.find('.tableSearch').off('keyup.dt').on('keyup.dt', function () {dt.search(this.value).draw()})
    $wrapper.find('.entriesSelect').off('change.dt').on('change.dt', function () {dt.page.len(this.value).draw()})
    $wrapper.find('.reloadTableBtn').off('click.dt').on('click.dt', () => dt.ajax.reload(null, false))
    $wrapper.off('click.dt', '.exportBtn').on('click.dt', '.exportBtn', function (e) {
        e.preventDefault()
        const format = $(this).data('format')
        const exportUrl = $wrapper.data('export')
        if (!exportUrl) return
        const dt = $table.DataTable()
        const visibleColumns = dt.columns().visible().toArray().map((visible, index) => {
            const col = dt.column(index)
            const field = col.dataSrc()
            return visible && !['_checkbox', '_rownum', 'action'].includes(field) ? field : null
        }).filter(Boolean)
        if (!visibleColumns.length) return
        const filters = {}
        $wrapper.find('.column-filter').each(function () {
            const field = $(this).data('field')
            if (field && $(this).val()) filters[field] = $(this).val()
        })
        const info = dt.page.info()
        const params = $.param({
            filters,
            columns: visibleColumns,
            format,
            scope: 'page',
            start: info.start,
            length: info.length
        })
        window.location.href = `${exportUrl}?${params}`
    })
    const $colMenu = $wrapper.find('.columnVisibilityMenu').empty()
    dt.columns().every(function () {
        const col = this
        const header = $(col.header()).closest('table').find('thead tr:first-child th').eq(col.index())
        const title = header.text().trim()
        if (!title || title === '#' || col.dataSrc() === '_checkbox' || col.dataSrc() === '_rownum' || col.dataSrc() === 'action') return
        const $item = $(`
        <li>
            <label class="dropdown-item d-flex gap-2">
                <input type="checkbox" class="form-check-input" checked>
                <span>${title}</span>
            </label>
        </li>
    `)
        $item.find('input').on('change', function () {
            col.visible(this.checked)
        })
        $colMenu.append($item)
    })
    if (batch) {
        $wrapper.off('change.dt', '.checkAll').on('change.dt', '.checkAll', function () {
            $wrapper.find('.row-check').prop('checked', this.checked)
        })
    }
    return dt
}
