$(document).ready(function () {
    $('#load').load('../component/loadModal.html', function (response, status, xhr) {
        if (status == "error") {
            console.log("Lỗi load file: " + xhr.status + " " + xhr.statusText);
        }
    });
});

$(window).on('pageshow', function(event) {
    $('#load').addClass('hide');
});

// Fade out + chuyển trang
function transPage(href) {    
    $('#load').removeClass('hide');
    setTimeout(() => {
        window.location.href = href;
    }, 400);
}

$(function() {
    // Fade in
    $('#load').addClass('hide');

    // Chặn chuyển trang mặc định
    $(document).on('click', '.page-link-custom', function(e) {
        e.preventDefault();
        transPage(this.href);
    });
});