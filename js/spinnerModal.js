$(document).ready(function () {
    $('#spinnerOfTable').load('../component/spinnerModal.html', function (response, status, xhr) {
        if (status == "error") {
            console.log("Lỗi load file: " + xhr.status + " " + xhr.statusText);
        }
    });
});

function closeModal(){
    // const myModal = new bootstrap.Modal(document.getElementById('spinnerOfTable'));
    // myModal.hide();

    // document.querySelectorAll(".modal-backdrop.show").style.display = 'none';
}

function openModal(){
    // const myModal = new bootstrap.Modal(document.getElementById('spinnerOfTable'));
    // myModal.show();
}