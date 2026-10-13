const urlBE = "https://booking-management-backend-kdwt.onrender.com";



// Định nghĩa hàm kiểm tra trạng thái đăng nhập
function checkLoginState() {
    const user = localStorage.getItem("user");
    const dropdown1 = document.getElementById("dropdown_1");
    const dropdown2 = document.getElementById("dropdown_2");

    if (!dropdown1 || !dropdown2) {
        setTimeout(checkLoginState, 50);
        return;
    }

    if (!user || user === "") {
        // Chưa đăng nhập
        console.log("chưa đăng nhập");
        dropdown1?.classList.remove("d-none");
        dropdown2?.classList.add("d-none");
    } else {
        // Đã đăng nhập
        dropdown2?.classList.remove("d-none");
        dropdown1?.classList.add("d-none");
    }
}

document.addEventListener("DOMContentLoaded", checkLoginState);



// document.getElementById("sign_out").addEventListener(
//     "click",
//     () => {
//         handleSignOut();
//     }
// )

// function handleSignOut() {
//     fetch(`${urlBE}/api/auth/logout`, {
//         method: 'POST',
//         credentials: 'include'
//     })
//         .then(response => {
//             if (response.status == 200) {
//                 document.getElementById("dropdown_1").classList.remove("d-none");
//                 document.getElementById("dropdown_2").classList.add("d-none");
//             }
//         })
//         .catch(err => console.error("Lỗi đăng xuất:", err));
// }


