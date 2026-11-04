"use strict";
/* Progressive enhancement only: no tracking, storage, automatic diagnostics, or fetch. */
(() => {
  const form = document.getElementById("feedback-form");
  if (!form) return;
  const controls = document.getElementById("fb-controls");
  const submit = document.getElementById("fb-submit");
  const email = document.getElementById("fb-email");
  const reply = document.getElementById("fb-reply");
  const status = document.getElementById("fb-status");
  const note = document.getElementById("fb-send-note");
  let endpoint = null;

  /* Require an explicit HTTPS receiver. No fallback to a same-page submission. */
  try {
    const configured = form.dataset.endpoint.trim();
    if (configured) {
      const url = new URL(configured);
      if (url.protocol === "https:" && !url.username && !url.password) endpoint = url.href;
    }
  } catch (_) { /* Invalid configuration stays safely in preview mode. */ }

  /* The server must independently enforce this conditional email requirement. */
  const updateReply = () => { email.required = reply.checked; };
  reply.addEventListener("change", updateReply);
  updateReply();

  /* Attach the guard before enabling preview inputs. Native validation remains active. */
  form.addEventListener("submit", (event) => {
    updateReply();
    if (!endpoint) {
      event.preventDefault();
      status.textContent = "Nothing was sent. The feedback receiver has not been configured.";
      return;
    }
    if (!form.reportValidity()) event.preventDefault();
    // No fabricated success message: the receiver must confirm acceptance.
  });
  /* Reveal optional panels containing invalid controls so errors stay reachable. */
  form.addEventListener("invalid", (event) => {
    const panel = event.target.closest("details");
    if (panel) panel.open = true;
  }, true);
  controls.disabled = false;
  if (endpoint) {
    form.action = endpoint;
    submit.disabled = false;
    status.textContent = "Your feedback will be sent to the configured receiver. Please review the site's privacy information before sending.";
    note.textContent = "The receiver will confirm whether your feedback was accepted.";
  }
})();
