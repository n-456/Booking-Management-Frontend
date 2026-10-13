document.addEventListener("click", (e) => {
    const signOutBtn = e.target.closest("#sign_out");
    if (!signOutBtn) return;

    e.preventDefault();
    console.log("Đã bấm đăng xuất");
    
    if (typeof handleSignOut === "function") {
        handleSignOut();
    }
});

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


