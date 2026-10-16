const urlBE = "https://booking-management-backend-kdwt.onrender.com";
// let urlBE = "http://localhost:8080";

const form = document.querySelector("#orderDetail-form");
const search = document.querySelector("#search");
const tbody = document.querySelector("tbody");
const modalEl = document.getElementById("orderDetailModal");
const paginationEl = document.getElementById("pagination");

const orderDetailArray = [];

let editMode = false;

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDiscount(d) {
    return `${d} %`;
}

function reverseFormatDiscount(dStr) {
    return dStr.substring(0, dStr.length-2);
}


document.addEventListener("DOMContentLoaded", async () => {
    paginationEl.classList.add("d-none");

    try {
        document.getElementById("tbody").classList.add("d-none");
        await openModal();
        await loadOrderDetails(0);

    } catch (error) {
        console.error("Lỗi khi tải chi tiết đơn hàng:", error);
    }
});



// Chuyển trang khi bấm nút phân trang
document.addEventListener("click", async (e) => {
    const link = e.target.closest(".page-link");
    if (!link) return;

    e.preventDefault();
    const page = Number(link.dataset.page);

    removeActiveRow();
    const customerName = document.querySelector("#search input").value;
    await loadOrderDetails(page, customerName);
});

// Chọn hoặc lắng nghe sự kiện click chung trên tbody
tbody.addEventListener("click", (e) => {
    const row = e.target.closest("tr");
    if (!row || row.id === "row-orderDetail-template") return;

    const deleteBtn = e.target.closest(".orderDetail-btn-delete");
    if (deleteBtn) {
        e.stopPropagation();
        const id = row.querySelector(".orderDetail-id").innerText;
        deleteButton(id, row);
        return;
    }

    removeActiveRow();
    row.classList.add("active-tr");
});

// Bấm nút Tất cả chi tiết đơn hàng
document.getElementById("allOrderDetail").addEventListener("click", () => {
    document.querySelector("#search input").value = "";
    loadOrderDetails(0);
});

// Bấm nút mở modal Thêm chi tiết đơn hàng
document.getElementById("addOrderDetail").addEventListener("click", () => {
    editMode = false;
    form.reset();
    form.classList.remove("was-validated");
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
});

// Bấm nút mở modal Sửa chi tiết đơn hàng
document.getElementById("updateOrderDetail").addEventListener("click", (e) => {
    e.stopPropagation();
    const row = tbody.querySelector(".active-tr");

    if (!row) {
        showInfoModal("Vui lòng chọn đơn hàng cần sửa", "OK");
        return;
    }

    editMode = true;
    fillFormFromRow(row);
    form.classList.remove("was-validated");
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
});


// Submit Form
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
    }

    form.classList.remove("was-validated");
    const data = getFormData();

    if (editMode) {
        await updateOrderDetail(data);
    } else {
        await addOrderDetail(data);
    }
});



// Bấm nút search
// search.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     const searchInput = document.querySelector("#search input");
//     const customerName = searchInput ? searchInput.value.trim() : "";
//     removeActiveRow();
//     if (customerName) {
//         await loadOrderDetails(0, customerName);
//     } else {
//         await loadOrderDetailsWithoutCustomer(0);
//     }
// });


// Thêm chi tiét đơn hàng
async function addOrderDetail(orderDetailData) {
    paginationEl.classList.add("d-none");
    document.getElementById("tbody").classList.add("d-none");
    await openModal();

    try {
        const response = await fetch(`${urlBE}/orderDetails`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderDetailData)
        });

        if (!response.ok) throw new Error(`Thêm thất bại: ${response.status}`);

        const pageCount = document.querySelectorAll(".pagination .page-link").length;
        const targetPage = Math.max(pageCount - 2, 0);

        const response2 = await fetch(`${urlBE}/orderDetails?page=${targetPage}`);
        const data = await response2.json();
        if (data.numberOfElements != 0) {
            await loadOrderDetails(targetPage);
        } else {
            await loadOrderDetails(Math.max(pageCount - 3, 0));
        }

        // Đóng modal chứa form sau khi thêm thành công
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        }
    } catch (error) {
        console.error("Lỗi thêm:", error);
    } finally {
        await closeModal();
        paginationEl.classList.remove("d-none");
        document.getElementById("tbody").classList.remove("d-none");
    }
}

// Sửa chi tiết đơn hàng
async function updateOrderDetail(orderDetailData) {
    const row = tbody.querySelector(".active-tr");
    if (!row) {
        showInfoModal("Không tìm thấy chi tiết đơn hàng", "OK");
        return;
    }

    const id = row.querySelector(".orderDetail-id").innerText;
    paginationEl.classList.add("d-none");
    document.getElementById("tbody").classList.add("d-none");
    await openModal();

    try {
        const response = await fetch(`${urlBE}/orderDetails/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderDetailData)
        });

        if (!response.ok) throw new Error(`Sửa thất bại: ${response.status}`);
        const activePageLink = document.querySelector(".pagination .page-item.active .page-link");
        const currentPage = activePageLink ? Number(activePageLink.dataset.page) : 0;

        await loadOrderDetails(currentPage);

        // Đóng modal chứa form sau khi sửa thành công
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        }
    } catch (error) {
        console.error("Lỗi sửa:", error);
    } finally {
        await closeModal();
        paginationEl.classList.remove("d-none");
        document.getElementById("tbody").classList.remove("d-none");
    }
}

let isDeleting = false;

// Xóa chi tiết đơn hàng
async function deleteOrderDetail(id, row) {
    if (isDeleting) return;
    isDeleting = true;

    paginationEl.classList.add("d-none");
    document.getElementById("tbody").classList.add("d-none");
    await openModal();

    try {
        const response = await fetch(`${urlBE}/orderDetails/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error(`Xóa thất bại: ${response.status}`);

        const activePageLink = document.querySelector(".pagination .page-item.active .page-link");
        const currentPage = activePageLink ? Number(activePageLink.dataset.page) : 0;
        await loadOrderDetails(currentPage);
    } catch (error) {
        console.error("Lỗi xóa:", error);
    } finally {
        await closeModal();
        paginationEl.classList.remove("d-none");
        document.getElementById("tbody").classList.remove("d-none");
        isDeleting = false;
    }
}


// Bấm nút Xóa chi tiết đơn hàng
document.getElementById("deleteOrderDetail").addEventListener("click", () => {
    const row = tbody.querySelector(".active-tr");
    if (!row) {
        showInfoModal("Vui lòng chọn chi tiết đơn hàng cần xóa", "OK");
        return;
    }

    showInfoModal(
        "Bạn có chắc chắn muốn xóa chi tiết đơn hàng này không?",
        "Huỷ",
        "OK",
        async () => {
            const id = row.querySelector(".orderDetail-id").innerText;
            await deleteOrderDetail(id, row);
        }
    );
});


function deleteButton(id, row) {
    showInfoModal(
        "Bạn có chắc chắn muốn xóa chi tiết đơn hàng này không?",
        "Huỷ",
        "OK",
        async () => {
            await deleteOrderDetail(id, row);
        }
    );
}

// Hiển thị đơn hàng vào Table
async function loadOrderDetails(page, customerName = "") {
    document.getElementById("info-search").innerText = "";

    try {
        paginationEl.classList.add("d-none");
        document.getElementById("tbody").classList.add("d-none");
        await openModal();

        document.getElementById("info").innerText = "";

        const response = await fetch(`${urlBE}/orderDetails?page=${page}`);

        await closeModal();
        paginationEl.classList.remove("d-none");
        document.getElementById("tbody").classList.remove("d-none");

        if (!response.ok) throw new Error(`GET lỗi: ${response.status}`);

        const data = await response.json();

        clearOrderDetails();

        const orderDetailsList = data.content !== undefined ? data.content : data;

        if (!orderDetailsList || orderDetailsList.length == 0) {
            document.getElementById("info-search").innerText = `Không tìm thấy đơn hàng`;
            paginationEl.classList.add("d-none");
            return;
        }

        orderDetailArray.length = 0;
        orderDetailArray.push(...orderDetailsList);
        renderOrderDetails(orderDetailsList);

        if (data.totalPages !== undefined) {
            renderPagination(data.totalPages, page);
        } else {
            const pagination = document.querySelector(".pagination");
            if (pagination) pagination.innerHTML = "";
        }
    } catch (error) {
        console.error("Lỗi load orderDetails:", error);
    }
}

// // Hiển thị đơn hàng không có khách hàng vào Table
// async function loadOrderDetailsWithoutCustomer(page) {
//     try {
//         paginationEl.classList.add("d-none");
//         document.getElementById("tbody").classList.add("d-none");
//         await openModal();

//         document.getElementById("info").innerText = "";

//         const response = await fetch(`${urlBE}/orderDetails/nocustomer?page=${page}`);

//         await closeModal();
//         paginationEl.classList.remove("d-none");
//         document.getElementById("tbody").classList.remove("d-none");

//         if (!response.ok) throw new Error(`GET lỗi: ${response.status}`);

//         const data = await response.json();

//         clearOrderDetails();

//         const orderDetailsList = data.content !== undefined ? data.content : data;

//         if (!orderDetailsList || orderDetailsList.length == 0) {
//             document.getElementById("info-search").innerText = `Không tìm thấy đơn hàng "${customerName}"`;
//             paginationEl.classList.add("d-none");
//             return;
//         }

//         orderDetailArray.length = 0;
//         orderDetailArray.push(...orderDetailsList);
//         renderOrderDetails(orderDetailsList);

//         if (data.totalPages !== undefined) {
//             renderPagination(data.totalPages, page);
//         } else {
//             const pagination = document.querySelector(".pagination");
//             if (pagination) pagination.innerHTML = "";
//         }
//     } catch (error) {
//         console.error("Lỗi load orderDetails:", error);
//     }
// }

async function renderOrderDetails(orderDetails) {
    const template = document.getElementById("row-orderDetail-template");

    orderDetails.forEach(orderDetail => {
        // const orderDetail = item.orderDetail;
        // const customerName = item.customerName;

        const row = template.cloneNode(true);
        row.removeAttribute("id");
        row.style.display = "";

        row.querySelector(".orderDetail-id").textContent = orderDetail.id;
        row.querySelector(".orderDetail-id").style.display = "none";
        row.querySelector(".orderDetail-orderId").textContent = orderDetail.orderId;
        row.querySelector(".orderDetail-productId").textContent = orderDetail.productId;
        row.querySelector(".orderDetail-quantity").textContent = formatNumber(orderDetail.quantity);
        row.querySelector(".orderDetail-unitPrice").textContent = formatNumber(orderDetail.unitPrice);
        row.querySelector(".orderDetail-discount").textContent = formatDiscount(orderDetail.discount);

        tbody.appendChild(row);
    });
}


// Hiển thị các nút bấm phân trang
async function renderPagination(totalPages, currentPage) {
    const pagination = document.querySelector(".pagination");
    if (!pagination) return;

    let html = "";

    html = `
        <li class="page-item">
            <a class="page-link" href="#" aria-label="First" data-page="0">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;

    for (let p = 0; p < totalPages; p++) {
        html += `
            <li class="page-item ${p === currentPage ? "active" : ""}">
                <a class="page-link" href="#" data-page="${p}">${p + 1}</a>
            </li>
        `;
    }

    html += `
        <li class="page-item">
            <a class="page-link" href="#" aria-label="Last" data-page="${totalPages - 1}">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;

    pagination.innerHTML = html;

}


// Cập nhật lại các cell trên một Row
function updateRowUI(row, orderDetailData) {
    row.querySelector(".orderDetail-orderId").textContent = orderDetailData.orderId;
    row.querySelector(".orderDetail-productId").textContent = orderDetailData.productId;
    row.querySelector(".orderDetail-quantity").textContent = formatNumber(orderDetailData.quantity);
    row.querySelector(".orderDetail-unitPrice").textContent = formatNumber(orderDetailData.unitPrice);
    row.querySelector(".orderDetail-discount").textContent = formatDiscount(orderDetailData.discount);
}



// Xóa bảng
function clearOrderDetails() {
    document
        .querySelectorAll("tbody tr:not(#row-orderDetail-template)")
        .forEach(row => row.remove());
}

// Loại bỏ class active trên dòng
function removeActiveRow() {
    const row = tbody.querySelector(".active-tr");
    if (row) row.classList.remove("active-tr");
}

// Lấy dữ liệu từ Form
function getFormData() {
    return {
        orderId: document.getElementById("orderId").value,
        productId: document.getElementById("productId").value,
        quantity: document.getElementById("quantity").value,
        unitPrice: document.getElementById("unitPrice").value,
        discount: document.getElementById("discount").value
    };
}

// Đổ dữ liệu từ Row vào Form
function fillFormFromRow(row) {
    document.getElementById("orderId").value = row.querySelector(".orderDetail-orderId").innerText;
    document.getElementById("productId").value = row.querySelector(".orderDetail-productId").innerText;
    document.getElementById("quantity").value = row.querySelector(".orderDetail-quantity").innerText;
    document.getElementById("unitPrice").value = row.querySelector(".orderDetail-unitPrice").innerText;
    document.getElementById("discount").value = reverseFormatDiscount(row.querySelector(".orderDetail-discount").innerText);
}

// Sắp xếp tăng
function sortOrderDetails(criteria) {
    const listCopy = [...orderDetailArray];

    switch (criteria) {
        case 'orderId':
            listCopy.sort((a, b) => a.orderDetail.orderId - b.orderDetail.orderId);
            break;
        case 'productId':
            listCopy.sort((a, b) => a.orderDetail.productId - b.orderDetail.productId);
            break;
        case 'quantity':
            listCopy.sort((a, b) => Number(a.orderDetail.quantity) - Number(b.orderDetail.quantity));
            break;
        case 'unitPrice':
            listCopy.sort((a, b) => Number(a.orderDetail.unitPrice) - Number(b.orderDetail.unitPrice));
            break;
        case 'discount':
            listCopy.sort((a, b) => Number(a.orderDetail.discount) - Number(b.orderDetail.discount));
            break;
        default:
            listCopy.sort((a, b) => Number(a.orderDetail.id) - Number(b.orderDetail.id));
            break;
    }

    clearOrderDetails();
    renderOrderDetails(listCopy);
}

// Sắp xếp giảm
function sortDescendingOrderDetails(criteria) {
    const listCopy = [...orderDetailArray];

    switch (criteria) {
        case 'orderId':
            listCopy.sort((a, b) => b.orderDetail.orderId - a.orderDetail.orderId);
            break;
        case 'productId':
            listCopy.sort((a, b) => b.orderDetail.productId - a.orderDetail.productId);
            break;
        case 'quantity':
            listCopy.sort((a, b) => Number(b.orderDetail.quantity) - Number(a.orderDetail.quantity));
            break;
        case 'unitPrice':
            listCopy.sort((a, b) => Number(b.orderDetail.unitPrice) - Number(a.orderDetail.unitPrice));
            break;
        case 'discount':
            listCopy.sort((a, b) => Number(b.orderDetail.discount) - Number(a.orderDetail.discount));
            break;
        default:
            listCopy.sort((a, b) => Number(b.orderDetail.id) - Number(a.orderDetail.id));
            break;
    }

    clearOrderDetails();
    renderOrderDetails(listCopy);
}