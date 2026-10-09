function setupModal(modalEl, message, close, ok) {
    modalEl.querySelector(".modal-body p").textContent = message;
    
    const closeBtn = modalEl.querySelector(".modal-footer .btn-secondary");
    if (closeBtn) closeBtn.textContent = close;

    const okBtn = modalEl.querySelector(".modal-footer .btn-dark");
    if (okBtn) {
        okBtn.style.display = (ok === "") ? "none" : "";
        okBtn.textContent = ok;
    }
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}


function showInfoModal(message, close, ok = "") {
    const modalEl = document.getElementById("infoModal");

    if (!modalEl) {
        // Nếu chưa có modal thông báo thì tải xong chạy setupModal
        $('#info').load('../component/infoModal.html', () => {
            setupModal(document.getElementById("infoModal"), message, close, ok);
        });
    } else {
        setupModal(modalEl, message, close, ok);
    }
}
