document.addEventListener("DOMContentLoaded", function () {
  const currentPath = window.location.pathname.replace(/\/+$/, "");

  const navLinks = document.querySelectorAll(
    "#quarto-header .navbar .navbar-nav a.nav-link"
  );

  navLinks.forEach(function (link) {
    const linkUrl = new URL(link.href, window.location.origin);
    const linkPath = linkUrl.pathname.replace(/\/+$/, "");

    const isCurrentPage =
      linkPath === currentPath ||
      (currentPath.endsWith("/") && linkPath.endsWith("/index.html"));

    link.classList.toggle("active", isCurrentPage);

    if (isCurrentPage) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
});
