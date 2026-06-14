/* ============================================================
   MALKAH — admin-layout.js
   Reusable admin sidebar + breadcrumb component
   ============================================================ */

class AdminLayout extends HTMLElement {
  async connectedCallback() {
    if (!isLoggedIn()) { window.location.href = '/admin/login.html'; return }

    // Parse current location from URL
    const schoolId = getQueryParam('id') && this.dataset.page === 'school' ? getQueryParam('id') : null
    const kitId = getQueryParam('id') && this.dataset.page === 'kit' ? getQueryParam('id') : null

    // Build skeleton
    this.innerHTML = `
      <div class="admin-shell">
        <aside class="admin-sidebar">
          <div class="admin-sidebar-head">
            <div class="admin-sidebar-title">Admin</div>
            <div class="admin-sidebar-user" id="admin-user-email"></div>
          </div>
          <nav class="admin-sidebar-nav" id="admin-tree">
            <p style="color: var(--muted); font-size: 0.85rem; padding: 0.5rem 0;">Loading...</p>
          </nav>
          <div class="admin-sidebar-foot">
            <a href="/admin/qr.html" class="admin-sidebar-link admin-sidebar-tool">QR Generator</a>
            <button class="admin-sidebar-link admin-sidebar-tool" id="admin-logout">Sign out</button>
          </div>
        </aside>

        <div class="admin-main">
          <nav class="admin-breadcrumb" id="admin-breadcrumb"></nav>
          <div class="admin-content" id="admin-content"></div>
        </div>
      </div>
    `

    // Set user
    const user = currentUser()
    if (user) this.querySelector('#admin-user-email').textContent = user.email

    // Wire logout
    this.querySelector('#admin-logout').addEventListener('click', () => {
      logout()
      window.location.href = '/admin/login.html'
    })

    // Build sidebar tree
    await this.buildTree(schoolId, kitId)

    // Build breadcrumb based on page
    await this.buildBreadcrumb()
  }

  async buildTree(activeSchoolId, activeKitId) {
    const tree = this.querySelector('#admin-tree')
    try {
      const schools = await getAllSchools()
      if (schools.length === 0) {
        tree.innerHTML = `
          <a href="/admin/dashboard.html" class="admin-sidebar-link">Dashboard</a>
          <p style="color: var(--muted); font-size: 0.8rem; padding: 0.5rem;">No schools yet</p>
        `
        return
      }

      let html = `<a href="/admin/dashboard.html" class="admin-sidebar-link${this.dataset.page === 'dashboard' ? ' active' : ''}">All Schools</a>`

      for (const school of schools) {
        const isActiveSchool = String(school.id) === String(activeSchoolId)
        const kits = isActiveSchool ? await getKitsBySchool(school.id) : []

        html += `<div class="admin-tree-school">
          <a href="/admin/school.html?id=${school.id}" class="admin-sidebar-link${isActiveSchool ? ' active' : ''}">
            ${school.name}
          </a>`

        if (isActiveSchool && kits.length > 0) {
          html += '<div class="admin-tree-kits">'
          for (const kit of kits) {
            const isActiveKit = String(kit.id) === String(activeKitId)
            html += `<a href="/admin/kit.html?id=${kit.id}" class="admin-sidebar-link admin-sidebar-sublink${isActiveKit ? ' active' : ''}">
              ${kit.name}
            </a>`
          }
          html += '</div>'
        }

        html += '</div>'
      }

      tree.innerHTML = html
    } catch (err) {
      tree.innerHTML = `<p style="color: #c0392b; font-size: 0.85rem;">${err.message}</p>`
    }
  }

  async buildBreadcrumb() {
    const crumb = this.querySelector('#admin-breadcrumb')
    const page = this.dataset.page
    const parts = [{ name: 'Dashboard', href: '/admin/dashboard.html' }]

    try {
      if (page === 'school') {
        const schoolId = getQueryParam('id')
        const data = await dbSelect('schools', `select=*&id=eq.${schoolId}&limit=1`)
        if (data[0]) parts.push({ name: data[0].name })
      } else if (page === 'kit') {
        const kitId = getQueryParam('id')
        const kData = await dbSelect('kits', `select=*&id=eq.${kitId}&limit=1`)
        if (kData[0]) {
          const sData = await dbSelect('schools', `select=*&id=eq.${kData[0].school_id}&limit=1`)
          if (sData[0]) parts.push({ name: sData[0].name, href: `/admin/school.html?id=${sData[0].id}` })
          parts.push({ name: kData[0].name })
        }
      } else if (page === 'qr') {
        parts.push({ name: 'QR Generator' })
      }
    } catch (e) { /* ignore */ }

    crumb.innerHTML = parts.map((p, i) => {
      if (i === parts.length - 1) return `<span class="crumb-current">${p.name}</span>`
      return `<a href="${p.href}" class="crumb-link">${p.name}</a><span class="crumb-sep">›</span>`
    }).join('')
  }
}

customElements.define('admin-layout', AdminLayout)
