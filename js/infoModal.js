// function setupModal(modalEl, message, close, ok) {
//     modalEl.querySelector(".modal-body p").textContent = message;
    
//     const closeBtn = modalEl.querySelector(".modal-footer .btn-secondary");
//     if (closeBtn) closeBtn.textContent = close;

//     const okBtn = modalEl.querySelector(".modal-footer .btn-dark");
//     if (okBtn) {
//         okBtn.style.display = (ok === "") ? "none" : "";
//         okBtn.textContent = ok;
//     }
//     bootstrap.Modal.getOrCreateInstance(modalEl).show();
// }


// function showInfoModal(message, close, ok = "") {
//     const modalEl = document.getElementById("infoModal");

//     if (!modalEl) {
//         // Nếu chưa có modal thông báo thì tải xong chạy setupModal
//         $('#info').load('../component/infoModal.html', () => {
//             setupModal(document.getElementById("infoModal"), message, close, ok);
//         });
//     } else {
//         setupModal(modalEl, message, close, ok);
//     }
// }


// Biến toàn cục để lưu hàm callback sẽ chạy khi bấm OK
let modalOkCallback = null;

function setupModal(modalEl, message, close, ok, onOkClick) {
    modalEl.querySelector(".modal-body p").textContent = message;
    
    const closeBtn = modalEl.querySelector(".modal-footer .btn-secondary");
    if (closeBtn) closeBtn.textContent = close;

    const okBtn = modalEl.querySelector(".modal-footer .btn-dark");
    if (okBtn) {
        okBtn.style.display = (ok === "") ? "none" : "";
        okBtn.textContent = ok;
    }

    // Lưu hàm xử lý hành động OK vào biến toàn cục để dùng chung
    modalOkCallback = onOkClick;

    // Hiển thị modal bằng Bootstrap
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function showInfoModal(message, close, ok = "", onOkClick = null) {
    const modalEl = document.getElementById("infoModal");

    if (!modalEl) {
        $('#info').load('../component/infoModal.html', () => {
            setTimeout(() => {
                const newModalEl = document.getElementById("infoModal");
                // Đăng ký sự kiện click cho nút OK duy nhất 1 lần duy nhất khi load file HTML xong
                const okBtn = newModalEl.querySelector(".modal-footer .btn-dark");
                if (okBtn) {
                    okBtn.addEventListener("click", () => {
                        if (typeof modalOkCallback === "function") {
                            modalOkCallback(); // Chạy hàm xóa hoặc sửa sản phẩm
                        }
                    });
                }
                setupModal(newModalEl, message, close, ok, onOkClick);
            }, 50);
        });
    } else {
        setupModal(modalEl, message, close, ok, onOkClick);
    }
}
