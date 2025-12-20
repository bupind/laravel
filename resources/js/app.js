import '../css/app.css'
import $ from 'jquery'
import initDatatable from './components/datatable'

window.$ = window.jQuery = $
let activeModal = null
let eventsRegistered = false
const isDesktop = () => window.innerWidth >= 992

function openMetronicModal(contentHtml, title = '', size = 'md') {
    document.getElementById('globalMetronicModal')?.remove()
    const modalSizeClass = {sm: 'modal-sm', md: 'modal-md', lg: 'modal-lg', xl: 'modal-xl'}[size] || 'modal-md'
    document.body.insertAdjacentHTML('beforeend', `
        <div class="modal fade" id="globalMetronicModal" tabindex="-1">
            <div class="modal-dialog ${modalSizeClass} modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body"></div>
                </div>
            </div>
        </div>
    `)
    const modalEl = document.getElementById('globalMetronicModal')
    modalEl.querySelector('.modal-body').innerHTML = contentHtml
    activeModal = new bootstrap.Modal(modalEl)
    activeModal.show()
}

function renderModalErrors(form, errors) {
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'))
    form.querySelectorAll('.invalid-feedback').forEach(el => el.remove())
    Object.entries(errors).forEach(([field, messages]) => {
        const input = form.querySelector(`[name="${field}"]`)
        if (!input) return
        input.classList.add('is-invalid')
        const feedback = document.createElement('div')
        feedback.className = 'invalid-feedback'
        feedback.innerText = messages[0]
        input.closest('.form-check') ? input.closest('.form-check').appendChild(feedback) : input.parentNode.appendChild(feedback)
    })
}

function linkVisit(url, pushState = true) {
    fetch(url, {
        headers: {
            'X-SPA': 'true', 'X-Requested-With': 'XMLHttpRequest',
        },
    })
        .then(res => {
            if (!res.ok) throw new Error('Failed')
            return res.text()
        })
        .then(html => {
            const parser = new DOMParser()
            const doc = parser.parseFromString(html, 'text/html')
            const newContent = doc.querySelector('#spa-content')
            const current = document.querySelector('#spa-content')
            if (!newContent || !current) {
                window.location.href = url
                return
            }
            current.innerHTML = newContent.innerHTML
            const title = doc.querySelector('title')?.innerText
            if (title) document.title = title
            if (pushState) {
                history.pushState({}, '', url)
            }
            spaReInit()
        })
        .catch(() => {
            window.location.href = url
        })
}

function spaReInit() {
    if (window.KTComponents) {
        KTComponents.init()
    }
    document.querySelectorAll('.datatable-wrapper').forEach(initDatatable)
    window.scrollTo({top: 0, behavior: 'smooth'})
}

function registerGlobalEvents() {
    if (eventsRegistered) return
    eventsRegistered = true
    document.addEventListener('click', e => {
        const link = e.target.closest('a.--modal')
        if (!link || !isDesktop()) return
        e.preventDefault()
        const url = new URL(link.href)
        url.searchParams.set('useModal', '1')
        fetch(url, {headers: {'X-Requested-With': 'XMLHttpRequest'}})
            .then(res => res.text())
            .then(html => openMetronicModal(html, link.dataset.title || 'Form', link.dataset.modalsize || 'md'))
    })
    document.addEventListener('click', e => {
        const link = e.target.closest('a')
        if (!link) return
        if (link.classList.contains('--modal')) return
        if (link.target === '_blank') return
        if (link.hasAttribute('download')) return
        const url = link.href
        if (!url.startsWith(window.location.origin)) return
        e.preventDefault()
        linkVisit(url)
    })
    document.addEventListener('submit', e => {
        const form = e.target.closest('#globalMetronicModal form')
        if (!form) return
        e.preventDefault()
        fetch(form.action, {
            method: form.method.toUpperCase(), body: new FormData(form), headers: {
                'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json',
            },
        }).then(async res => {
            if (res.status === 422) {
                const data = await res.json()
                renderModalErrors(form, data.errors)
                return
            }
            if (res.ok) {
                document.activeElement?.blur()
                const modalEl = document.getElementById('globalMetronicModal')
                modalEl.addEventListener('hidden.bs.modal', () => {
                    $('#xtable').DataTable()?.ajax.reload(null, false)
                }, {once: true})
                activeModal.hide()
            }
        })
    })
    window.addEventListener('popstate', () => {
        linkVisit(window.location.href, false)
    })
}

function onReady() {
    console.log('Vite ready')
    registerGlobalEvents()
    document.querySelectorAll('.datatable-wrapper').forEach(initDatatable)
}

document.addEventListener('DOMContentLoaded', onReady)
if (import.meta.hot) {
    import.meta.hot.accept()
}
