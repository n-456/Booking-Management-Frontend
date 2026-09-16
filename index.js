loadProfile();

document.getElementById("sign_out").addEventListener(
    "click",
    () => {
        handleSignOut();
    }
)

function handleSignOut() {
    fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        if (response.status == 200) {
            document.getElementById("dropdown_1").classList.remove("d-none");
            document.getElementById("dropdown_2").classList.add("d-none");
        }
    })
    .catch(err => console.error("Lỗi đăng xuất:", err));
}

async function loadProfile() {
    const response = await fetch('http://localhost:8080/api/auth/profile', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (response.status === 401) {
            // Nếu chưa đăng nhập / session hết hạn
            console.log("chưa đăng nhập");
            document.getElementById("dropdown_1").classList.remove("d-none");
            document.getElementById("dropdown_2").classList.add("d-none");
            return;
        }
        console.log("json...");
        return response.json();
    })
    .then(data => {
        if (data) {
            console.log("Thông tin user:", data);
            document.getElementById("account_info").innerText = data.name;
        }
    });
}