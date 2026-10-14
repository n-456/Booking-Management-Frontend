const urlBE = "https://booking-management-backend-kdwt.onrender.com";
// const urlBE = "http://localhost:8080";

const form = document.querySelector("#order-form");
const search = document.querySelector("#search");
const tbody = document.querySelector("tbody");
const modalEl = document.getElementById("orderModal");
const paginationEl = document.getElementById("pagination");

const orderArray = [];

let editMode = false;

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDate(date) {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}

function reverseFormatDate(dateStr) {
    const [day, month, year] = dateStr.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
}


document.addEventListener("DOMContentLoaded", async () => {
    paginationEl.classList.add("d-none");

    try {
        document.getElementById("tbody").classList.add("d-none");
        await openModal();
        await loadOrders(0);

    } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
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
    await loadOrders(page, customerName);
});

// Chọn hoặc lắng nghe sự kiện click chung trên tbody
tbody.addEventListener("click", (e) => {
    const row = e.target.closest("tr");
    if (!row || row.id === "row-order-template") return;

    const deleteBtn = e.target.closest(".order-btn-delete");
    if (deleteBtn) {
        e.stopPropagation();
        const id = row.querySelector(".order-id").innerText;
        deleteButton(id, row);
        return;
    }

    removeActiveRow();
    row.classList.add("active-tr");
});

// Bấm nút Tất cả đơn hàng
document.getElementById("allOrder").addEventListener("click", () => {
    document.querySelector("#search input").value = "";
    loadOrders(0);
});

// Bấm nút mở modal Thêm đơn hàng
document.getElementById("addOrder").addEventListener("click", () => {
    editMode = false;
    form.reset();
    form.classList.remove("was-validated");
    bootstrap.Modal.getOrCreateInstance(modalEl).show();
});

// Bấm nút mở modal Sửa đơn hàng
document.getElementById("updateOrder").addEventListener("click", (e) => {
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
        await updateOrder(data);
    } else {
        await addOrder(data);
    }
});



// Bấm nút search
search.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const searchInput = document.querySelector("#search input");
    const customerName = searchInput ? searchInput.value.trim() : "";
    removeActiveRow();
    if (customerName) {
        await loadOrders(0, customerName);
    } else {
        await loadOrdersWithoutCustomer(0);
    }
});


// Thêm đơn hàng
async function addOrder(orderData) {
    paginationEl.classList.add("d-none");
    document.getElementById("tbody").classList.add("d-none");
    await openModal();

    try {
        const response = await fetch(`${urlBE}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error(`Thêm thất bại: ${response.status}`);

        const pageCount = document.querySelectorAll(".pagination .page-link").length;
        const targetPage = Math.max(pageCount - 2, 0);

        const response2 = await fetch(`${urlBE}/orders?page=${targetPage}`);
        const data = await response2.json();
        if (data.numberOfElements != 0) {
            await loadOrders(targetPage);
        } else {
            await loadOrders(Math.max(pageCount - 3, 0));
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

// Sửa đơn hàng
async function updateOrder(orderData) {
    const row = tbody.querySelector(".active-tr");
    if (!row) {
        showInfoModal("Không tìm thấy đơn hàng", "OK");
        return;
    }

    const id = row.querySelector(".order-id").innerText;
    paginationEl.classList.add("d-none");
    document.getElementById("tbody").classList.add("d-none");
    await openModal();

    try {
        const response = await fetch(`${urlBE}/orders/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error(`Sửa thất bại: ${response.status}`);
        const activePageLink = document.querySelector(".pagination .page-item.active .page-link");
        const currentPage = activePageLink ? Number(activePageLink.dataset.page) : 0;

        await loadOrders(currentPage);

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

// Xóa đơn hàng
async function deleteOrder(id, row) {
    if (isDeleting) return;
    isDeleting = true;

    paginationEl.classList.add("d-none");
    document.getElementById("tbody").classList.add("d-none");
    await openModal();

    try {
        const response = await fetch(`${urlBE}/orders/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error(`Xóa thất bại: ${response.status}`);

        const activePageLink = document.querySelector(".pagination .page-item.active .page-link");
        const currentPage = activePageLink ? Number(activePageLink.dataset.page) : 0;
        await loadOrders(currentPage);
    } catch (error) {
        console.error("Lỗi xóa:", error);
    } finally {
        await closeModal();
        paginationEl.classList.remove("d-none");
        document.getElementById("tbody").classList.remove("d-none");
        isDeleting = false;
    }
}


// Bấm nút Xóa đơn hàng
document.getElementById("deleteOrder").addEventListener("click", () => {
    const row = tbody.querySelector(".active-tr");
    if (!row) {
        showInfoModal("Vui lòng chọn đơn hàng cần xóa", "OK");
        return;
    }

    showInfoModal(
        "Bạn có chắc chắn muốn xóa đơn hàng này không?",
        "Huỷ",
        "OK",
        async () => {
            const id = row.querySelector(".order-id").innerText;
            await deleteOrder(id, row);
        }
    );
});


function deleteButton(id, row) {
    showInfoModal(
        "Bạn có chắc chắn muốn xóa đơn hàng này không?",
        "Huỷ",
        "OK",
        async () => {
            await deleteOrder(id, row);
        }
    );
}

// Hiển thị đơn hàng vào Table
async function loadOrders(page, customerName = "") {
    document.getElementById("info-search").innerText = "";

    try {
        paginationEl.classList.add("d-none");
        document.getElementById("tbody").classList.add("d-none");
        await openModal();

        document.getElementById("info").innerText = "";

        const response = await fetch(`${urlBE}/orders?page=${page}&customerName=${encodeURIComponent(customerName)}`);

        await closeModal();
        paginationEl.classList.remove("d-none");
        document.getElementById("tbody").classList.remove("d-none");

        if (!response.ok) throw new Error(`GET lỗi: ${response.status}`);

        const data = await response.json();

        clearOrders();

        const ordersList = data.content !== undefined ? data.content : data;

        if (!ordersList || ordersList.length == 0) {
            document.getElementById("info-search").innerText = `Không tìm thấy đơn hàng "${customerName}"`;
            paginationEl.classList.add("d-none");
            return;
        }

        orderArray.length = 0;
        orderArray.push(...ordersList);
        renderOrders(ordersList);

        if (data.totalPages !== undefined) {
            renderPagination(data.totalPages, page);
        } else {
            const pagination = document.querySelector(".pagination");
            if (pagination) pagination.innerHTML = "";
        }
    } catch (error) {
        console.error("Lỗi load orders:", error);
    }
}

// Hiển thị đơn hàng không có khách hàng vào Table
async function loadOrdersWithoutCustomer(page) {
    try {
        paginationEl.classList.add("d-none");
        document.getElementById("tbody").classList.add("d-none");
        await openModal();

        document.getElementById("info").innerText = "";

        const response = await fetch(`${urlBE}/orders/nocustomer?page=${page}`);

        await closeModal();
        paginationEl.classList.remove("d-none");
        document.getElementById("tbody").classList.remove("d-none");

        if (!response.ok) throw new Error(`GET lỗi: ${response.status}`);

        const data = await response.json();

        clearOrders();

        const ordersList = data.content !== undefined ? data.content : data;

        if (!ordersList || ordersList.length == 0) {
            document.getElementById("info-search").innerText = `Không tìm thấy đơn hàng "${customerName}"`;
            paginationEl.classList.add("d-none");
            return;
        }

        orderArray.length = 0;
        orderArray.push(...ordersList);
        renderOrders(ordersList);

        if (data.totalPages !== undefined) {
            renderPagination(data.totalPages, page);
        } else {
            const pagination = document.querySelector(".pagination");
            if (pagination) pagination.innerHTML = "";
        }
    } catch (error) {
        console.error("Lỗi load orders:", error);
    }
}

async function renderOrders(orders) {
    const template = document.getElementById("row-order-template");

    orders.forEach(item => {
        const order = item.order;
        const customerName = item.customerName;

        const row = template.cloneNode(true);
        row.removeAttribute("id");
        row.style.display = "";

        row.querySelector(".order-id").textContent = order.id;
        row.querySelector(".order-id").style.display = "none";
        row.querySelector(".order-customerId").textContent = order.customerId;

        const nameCell = row.querySelector(".order-customerName");
        if (nameCell) {
            nameCell.textContent = customerName ? customerName : "N/A";
        }

        row.querySelector(".order-orderDate").textContent = formatDate(order.orderDate);
        row.querySelector(".order-status").textContent = order.status;
        row.querySelector(".order-shippedDate").textContent = formatDate(order.shippedDate);
        row.querySelector(".order-shippingFee").textContent = formatNumber(order.shippingFee);
        row.querySelector(".order-paymentMethod").textContent = order.paymentMethod;

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
function updateRowUI(row, orderData) {
    // row.querySelector(".order-customerId").textContent = orderData.customerId;
    row.querySelector(".order-orderDate").textContent = formatDate(orderData.orderDate);
    row.querySelector(".order-status").textContent = orderData.status;
    row.querySelector(".order-shippedDate").textContent = formatDate(orderData.shippedDate);
    row.querySelector(".order-shippingFee").textContent = formatNumber(orderData.shippingFee);
    row.querySelector(".order-paymentMethod").textContent = orderData.paymentMethod;
}



// Xóa bảng
function clearOrders() {
    document
        .querySelectorAll("tbody tr:not(#row-order-template)")
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
        customerId: document.getElementById("customerId").value,
        status: document.getElementById("status").value,
        orderDate: document.getElementById("orderDate").value,
        shippedDate: document.getElementById("shippedDate").value,
        shippingFee: document.getElementById("shippingFee").value,
        paymentMethod: document.getElementById("paymentMethod").value
    };
}

// Đổ dữ liệu từ Row vào Form
function fillFormFromRow(row) {
    document.getElementById("customerId").value = row.querySelector(".order-customerId").innerText;
    document.getElementById("status").value = row.querySelector(".order-status").innerText;
    document.getElementById("orderDate").value = reverseFormatDate(row.querySelector(".order-orderDate").innerText);
    document.getElementById("shippedDate").value = reverseFormatDate(row.querySelector(".order-shippedDate").innerText);
    document.getElementById("shippingFee").value = row.querySelector(".order-shippingFee").innerText;
    document.getElementById("paymentMethod").value = row.querySelector(".order-paymentMethod").innerText;
}

// Sắp xếp tăng
function sortOrders(criteria) {
    const listCopy = [...orderArray];

    switch (criteria) {
        case 'customerId':
            listCopy.sort((a, b) => Number(a.order.customerId) - Number(b.order.customerId));
            break;
        case 'customerName':
            listCopy.sort((a, b) => {
                const nameA = a.customerName || "";
                const nameB = b.customerName || "";
                return nameA.localeCompare(nameB);
            });
            break;
        case 'orderDate':
            listCopy.sort((a, b) => new Date(a.order.orderDate) - new Date(b.order.orderDate));
            break;
        case 'shippedDate':
            listCopy.sort((a, b) => new Date(a.order.shippedDate) - new Date(b.order.shippedDate));
            break;
        case 'shippingFee':
            listCopy.sort((a, b) => Number(a.order.shippingFee) - Number(b.order.shippingFee));
            break;
        default:
            listCopy.sort((a, b) => Number(a.order.id) - Number(b.order.id));
            break;
    }

    clearOrders();
    renderOrders(listCopy);
}

// Sắp xếp giảm
function sortDescendingOrders(criteria) {
    const listCopy = [...orderArray];

    switch (criteria) {
        case 'customerId':
            listCopy.sort((a, b) => Number(b.order.customerId) - Number(a.order.customerId));
            break;
        case 'customerName':
            listCopy.sort((a, b) => {
                const nameA = a.customerName || "";
                const nameB = b.customerName || "";
                return nameB.localeCompare(nameA);
            });
            break;
        case 'orderDate':
            listCopy.sort((a, b) => new Date(b.order.orderDate) - new Date(a.order.orderDate));
            break;
        case 'shippedDate':
            listCopy.sort((a, b) => new Date(b.order.shippedDate) - new Date(a.order.shippedDate));
            break;
        case 'shippingFee':
            listCopy.sort((a, b) => Number(b.order.shippingFee) - Number(a.order.shippingFee));
            break;
        default:
            listCopy.sort((a, b) => Number(b.order.id) - Number(a.order.id));
            break;
    }

    clearOrders();
    renderOrders(listCopy);
}