// acdi-nav.js — Thanh menu DÙNG CHUNG cho hệ thống ACDI Check (độc lập với AI SMART).
// Không có đăng nhập/tài khoản — chỉ có 2 mục: Khảo sát và Dữ liệu.

const ACDI_NAV_LINKS = [
  { key: "survey", href: "acdi-intro.html", icon: "fa-pen-to-square", label: "Khảo sát" },
  { key: "data", href: "acdi-data.html", icon: "fa-chart-column", label: "Dữ liệu" },
];

function renderAcdiNav(activeKey) {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <nav id="siteNav" class="site-nav">
      <a href="acdi-intro.html" class="logo">
        <div class="logo-mark"><i class="fa-solid fa-gauge-high"></i></div>
        <div class="logo-type"><span class="logo-ai">ACDI</span><span class="logo-rest"> Check</span></div>
      </a>

      <div class="nav-menu">
        ${ACDI_NAV_LINKS.map(
          (l) =>
            `<a href="${l.href}" class="nav-link${l.key === activeKey ? " active" : ""}"><i class="fa-solid ${l.icon}"></i> ${l.label}</a>`
        ).join("")}
      </div>

      <div class="nav-right">
        <button class="menu-toggle" id="menuToggleBtn"><i class="fa-solid fa-bars"></i></button>
      </div>
    </nav>

    <div class="mobile-menu-panel" id="mobileMenuPanel">
      <div class="nav-links-mobile">
        ${ACDI_NAV_LINKS.map(
          (l) =>
            `<a href="${l.href}" class="nav-link-mobile${l.key === activeKey ? " active" : ""}"><i class="fa-solid ${l.icon}"></i> ${l.label}</a>`
        ).join("")}
      </div>
    </div>
  `;
  document.body.prepend(wrap.firstElementChild);
  document.body.appendChild(wrap.firstElementChild); // di chuyển mobile panel ra sau nav (thứ tự DOM)

  const menuToggle = document.getElementById("menuToggleBtn");
  const mobilePanel = document.getElementById("mobileMenuPanel");
  menuToggle.addEventListener("click", () => {
    mobilePanel.classList.toggle("open");
    menuToggle.classList.toggle("open");
  });
  mobilePanel.querySelectorAll(".nav-link-mobile").forEach((a) => {
    a.addEventListener("click", () => {
      mobilePanel.classList.remove("open");
      menuToggle.classList.remove("open");
    });
  });
}
