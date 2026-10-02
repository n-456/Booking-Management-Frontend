$(document).ready(function () {
    $('#spinner').load('../component/spinner.html', function (response, status, xhr) {
        if (status == "error") {
            console.log("Lỗi load file: " + xhr.status + " " + xhr.statusText);
        }
    });
});

$(window).on('pageshow', function(event) {
    $('#spinner').addClass('hide');
});

// Fade out + chuyển trang
function transPage(href) {    
    $('#spinner').removeClass('hide');
    setTimeout(() => {
        window.location.href = href;
    }, 400);
}

$(function() {
    // Fade in
    $('#spinner').addClass('hide');

    // Chặn chuyển trang mặc định
    $(document).on('click', '.page-link-custom', function(e) {
        e.preventDefault();
        transPage(this.href);
    });
});