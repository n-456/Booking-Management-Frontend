// Chạy ứng dụng khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
    loadCards(0);
});

// Lắng nghe sự kiện click chuyển trang pagination
document.addEventListener("click", async (e) => {
    const link = e.target.closest(".page-link");
    if (!link) return;

    e.preventDefault();
    const page = Number(link.dataset.page);
    await loadCards(page);
});




// Tải danh sách sản phẩm từ server
async function loadCards(page) {
    try {
        const response = await fetch(`${urlBE}/products?page=${page}`);

        if (!response.ok) {
            throw new Error(`GET lỗi: ${response.status}`);
        }

        const data = await response.json();

        clearCards();
        renderCards(data.content);
        renderPagination(data.totalPages, page);

    } catch (error) {
        console.error("Lỗi load cards:", error);
    }
}

// Lấy thông tin chi tiết của một thẻ
async function getDetail(id) {
    try {
        const response = await fetch(`${urlBE}/products/${id}`);
        
        if (!response.ok) {
            console.log("Lỗi không lấy được chi tiết");
        } else {
            const cardData = await response.json();
            console.log("detail card: ", cardData);
            return cardData;
        }

    } catch (error) {
        console.error("Lỗi: ", error);
    }
}




// Hiển thị danh sách các thẻ ra màn hình
async function renderCards(cards) {
    $.get("../component/card.html", function (cardTemplate) {

        cards.forEach(function (cardItem) {
            const card = $(cardTemplate);

            card.find(".product-name").text(cardItem.name);
            card.find(".product-description").text(cardItem.description);
            card.find(".product-price").text(cardItem.cost);
            card.find(".product-image").attr("src", cardItem.img);

            card.find(".btn-detail").on("click", function () {
                getDetail(cardItem.id);
            });

            $(".row1").append(card);
        });

    });
}

// Hiển thị thanh phân trang
function renderPagination(totalPages, currentPage) {
    const pagination = document.querySelector(".pagination");
    if (!pagination) return;

    let html = "";
    for (let p = 0; p < totalPages; p++) {
        html += `
            <li class="page-item ${p === currentPage ? "active" : ""}">
                <a class="page-link" href="#" data-page="${p}">
                    ${p + 1}
                </a>
            </li>
        `;
    }
    pagination.innerHTML = html;
}




// Xóa các thẻ cũ trước khi load trang mới
function clearCards() {
    document
        .querySelectorAll(".card-container")
        .forEach(container => container.remove());
}
