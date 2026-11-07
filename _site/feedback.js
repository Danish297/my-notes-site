"use strict";

(() => {
  function initializeFeedbackForm() {
    const form = document.getElementById("feedback-form");
    if (!form || form.dataset.initialized === "true") return;

    const controls = document.getElementById("fb-controls");
    const submit = document.getElementById("fb-submit");
    const email = document.getElementById("fb-email");
    const reply = document.getElementById("fb-reply");
    const status = document.getElementById("fb-status");
    const note = document.getElementById("fb-send-note");

    if (
      !controls ||
      !submit ||
      !email ||
      !reply ||
      !status ||
      !note
    ) {
      console.error("Feedback form: required elements are missing.");
      return;
    }

    form.dataset.initialized = "true";

    let submitting = false;

    const defaultStatus =
      "Feedback is sent through FormSubmit to the site owner. " +
      "Please do not include personal, confidential, or sensitive information.";

    const defaultNote =
      "Your entries are cleared only after submission is confirmed.";

    function setStatus(message, state = "info") {
      status.textContent = message;
      status.dataset.state = state;
    }

    function updateReplyRequirement() {
      email.required = reply.checked;
      email.setAttribute(
        "aria-required",
        reply.checked ? "true" : "false"
      );
    }

    reply.addEventListener("change", updateReplyRequirement);

    form.addEventListener(
      "invalid",
      (event) => {
        let panel = event.target.closest("details");

        while (panel) {
          panel.open = true;
          panel = panel.parentElement.closest("details");
        }
      },
      true
    );

    form.addEventListener("reset", () => {
      window.setTimeout(updateReplyRequirement, 0);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      updateReplyRequirement();

      if (submitting || !form.reportValidity()) return;

      submitting = true;

      const originalLabel = submit.textContent;
      const controller = new AbortController();

      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, 30000);

      submit.disabled = true;
      submit.textContent = "Sending…";
      form.setAttribute("aria-busy", "true");

      setStatus("Sending your feedback. Please wait.", "sending");
      note.textContent = "Please wait for confirmation before trying again.";

      let success = false;
      let errorMessage = "";

      try {
        const endpoint = new URL(form.action);

        if (
          endpoint.protocol !== "https:" ||
          endpoint.hostname !== "formsubmit.co"
        ) {
          throw new Error(
            "The feedback submission address is not configured correctly."
          );
        }

        endpoint.pathname =
          "/ajax/" + endpoint.pathname.replace(/^\/(?:ajax\/)?/, "");

        const data = new FormData(form);

        // Preserve every selected topic as one readable field.
        const selectedTopics = data.getAll("topics");

        data.delete("topics");

        if (selectedTopics.length > 0) {
          data.set("topics", selectedTopics.join(", "));
        }

        data.set(
          "reply_requested",
          reply.checked ? "Yes" : "No"
        );

        const response = await fetch(endpoint.href, {
          method: "POST",
          headers: {
            "Accept": "application/json"
          },
          body: data,
          signal: controller.signal
        });

        if (response.status >= 500) {
          throw new Error(
            "The submission service is temporarily unavailable. " +
            "Please try again later."
          );
        }

        const responseText = await response.text();
        let result;

        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            "The submission service returned an unexpected response. " +
            "Delivery could not be confirmed."
          );
        }

        if (
          !response.ok ||
          String(result.success).toLowerCase() !== "true"
        ) {
          const serviceMessage = result.message || result.error;

          throw new Error(
            typeof serviceMessage === "string"
              ? serviceMessage
              : "The submission service did not confirm your feedback."
          );
        }

        success = true;
      } catch (error) {
        console.error("Feedback submission failed:", error);

        if (error.name === "AbortError") {
          errorMessage =
            "The request timed out. Delivery could not be confirmed. " +
            "Retrying may create a duplicate.";
        } else if (
          error instanceof TypeError ||
          error.message === "Failed to fetch"
        ) {
          errorMessage =
            "The submission service could not be reached, " +
            "or its response could not be read. Please try again later.";
        } else {
          errorMessage =
            error.message || "An unexpected error occurred.";
        }
      } finally {
        window.clearTimeout(timeoutId);

        submitting = false;
        submit.disabled = false;
        submit.textContent = originalLabel;
        form.removeAttribute("aria-busy");
        note.textContent = defaultNote;
      }

      if (success) {
        form.reset();
        updateReplyRequirement();

        const message =
          "Thank you for your feedback. " +
          "I will review it and take the necessary action.";

        setStatus(message, "success");
        window.alert(message);
      } else {
        const message =
          "Your feedback could not be confirmed. " +
          errorMessage +
          " Your entries have been kept in the form.";

        setStatus(message, "error");

        window.alert(
          "Your feedback could not be confirmed.\n\n" +
          errorMessage +
          "\n\nYour entries have been kept in the form."
        );
      }
    });

    updateReplyRequirement();

    controls.disabled = false;
    submit.disabled = false;

    setStatus(defaultStatus);
    note.textContent = defaultNote;
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeFeedbackForm,
      { once: true }
    );
  } else {
    initializeFeedbackForm();
  }
})();
