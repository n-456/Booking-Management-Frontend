$('#spinner').load('loading.html', function (response, status, xhr) {
    if (status == "error") {
        console.log("Lỗi load file: " + xhr.status + " " + xhr.statusText);
    }
});