let spinnerModal = null

$(document).ready(function () {
    $('#spinner').load('../component/spinnerModal.html', function (response, status, xhr) {
        if (status == "error") {
            console.log("Lỗi load file: " + xhr.status + " " + xhr.statusText);
            return;
        }
        
        const spinnerModalElement = document.getElementById('spinnerModal');
        if (spinnerModalElement) {
            spinnerModal = new bootstrap.Modal(spinnerModalElement, {
                backdrop: false,
                keyboard: false
            });
        }
    });
});

async function openModal() {
    while (!spinnerModal) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    $('#spinnerModal').removeClass('d-none');
}

async function closeModal() {
    while (!spinnerModal) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    $('#spinnerModal').addClass('d-none');
}