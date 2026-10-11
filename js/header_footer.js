$(document).ready(function () {
    $('#header').load('../component/header.html', function (response, status, xhr) {
        if (status == "error") {
            console.log("Lỗi load file: " + xhr.status + " " + xhr.statusText);
        }
    });
    $('#footer').load('../component/footer.html', function (response, status, xhr) {
        if (status == "error") {
            console.log("Lỗi load file: " + xhr.status + " " + xhr.statusText);
        }
    });
});