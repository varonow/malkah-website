class SiteNav extends HTMLElement {
  connectedCallback() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html'
    
    this.innerHTML = `
      <header class="site-header">
        <div class="nav-inner">
          <a href="index.html" class="nav-logo">
            <img src="img/logo.png" alt="Malkah" />
          </a>
          <nav>
            <ul class="nav-links">
              <li><a href="index.html#mission">About</a></li>
              <li><a href="products.html">Products</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </nav>
          <button class="nav-hamburger" id="hamburger" aria-label="Open menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>
      <nav class="nav-mobile" id="mobile-nav">
        <a href="index.html#mission">About</a>
        <a href="products.html">Products</a>
        <a href="contact.html">Contact</a>
      </nav>
    `

    this.querySelectorAll('a').forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active')
      }
    })

    const hamburger = this.querySelector('#hamburger')
    const mobileNav = this.querySelector('#mobile-nav')
    hamburger.addEventListener('click', () => mobileNav.classList.toggle('open'))
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileNav.classList.remove('open'))
    })
  }
}

customElements.define('site-nav', SiteNav)

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <footer class="site-footer">
      <div class="footer-inner">
        <p class="footer-copy">© ${new Date().getFullYear()} Malkah. All rights reserved.</p>
        <a href="index.html" class="footer-logo">
          <img src="img/logo.png" alt="Malkah" />
        </a>
      </div>
    </footer>
    `
  }
}

customElements.define('site-footer', SiteFooter)