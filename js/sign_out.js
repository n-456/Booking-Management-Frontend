document.getElementById("sign_out").addEventListener(
    "click",
    () => {
        handleSignOut();
    }
)

function handleSignOut() {
    fetch(`${urlBE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    })
        .then(response => {
            if (response.status == 200) {
                localStorage.removeItem("user");
                checkLoginState();
            }
        })
        .catch(err => console.error("Lỗi đăng xuất:", err));
}


