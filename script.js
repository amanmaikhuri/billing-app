// DOM Helper
const $ = (selector, err = true) => {
    const el = document.querySelector(selector);
    if (!el && err) console.error(`${selector} not found`);
    return el;
};

// DOM References
const dom = {
    body: $("body"),
    customerName: $("#name"),
    particulars: $("#particulars"),
    sizeText: $("#size-text"),
    quantity: $("#quantity"),
    addItemBtn: $("#add-item-btn"),
    cartPreview: $("#cart-preview"),
    billSection: $("#bill-section"),
    billsContainer: $(".bills-container"),
    // submitBtn: $("#submit-bill-btn")
};

let cartItems = [];
let editIndex = -1;
let itemEditIndex = -1;

// Pricing Logic
function fetchPricing(item, quantity, size) {
    const prices = {
        shirt: { 22: 380, 24: 400, 26: 420, 28: 440, 30: 460, 32: 480, 34: 500, 36: 520, 38: 540, 40: 560 },
        pant: {
            22: 360, 24: 370, 26: 380, 28: 390, 30: 400,
            32: 420, 34: 440, 36: 460, 38: 480, 40: 500,
            2838: 600, 2840: 650, 3040: 680, 3240: 720, 3440: 750
        },
        tracksuit: { 22: 450, 24: 500, 26: 550, 28: 600, 30: 650, 32: 700, 34: 750, 36: 800, 38: 850, 40: 900 },

        tiebeltdupatta: { 1: 50, 2: 80, 3: 100, 4: 100, 5: 120, 6: 60 },

        capspahaditopi: { 1: 100, 2: 250, 3: 300 },

        shoesboys: {
            1: 462, 2: 462, 3: 462, 4: 489, 5: 489, 6: 489,
            7: 568, 8: 568, 70: 258, 80: 258, 9: 280, 10: 280, 11: 280, 12: 280, 13: 280
        },

        shoesgirls: {
            1: 285, 2: 285, 3: 285, 4: 310, 5: 310, 6: 310,
            7: 330, 8: 330, 70: 250, 80: 250, 9: 259, 10: 259, 11: 259, 12: 259, 13: 259
        },

        socks: { 1: 40, 2: 40, 3: 50, 4: 50, 5: 60, 6: 70, 7: 80 },

        kurta: { 30: 400, 32: 400, 34: 450, 36: 480, 38: 490, 40: 500 },

        pazama: { 30: 350, 32: 350, 34: 380, 36: 380, 38: 400, 40: 410 },

        tshirt: { 22: 260, 24: 280, 26: 300, 28: 320, 30: 340, 32: 360, 34: 380, 36: 400, 38: 420, 40: 450 },

        fabric: { 1: 90, 2: 175, 3: 250, 4: 280 },
        
        fallThreads: { 1: 20, 2: 5 }
    };

    // const itemPrices = prices[item];
    // if (!itemPrices) return "Invalid item";

    // const key = isNaN(size) ? size : Number(size);
    // const unitPrice = itemPrices[key];

    // if (!unitPrice) return "Invalid size for item";
    // return unitPrice * quantity;

    const price = prices[item]?.[size];
    if (!price) return "Invalid item or size";

    return price * quantity;
}

// Add / Update Cart Item
function handleCartItem(isEdit = false) {
    const particular = dom.particulars.value.trim().toLowerCase();
    const size = dom.sizeText.value.trim();
    const quantity = Number(dom.quantity.value.trim());

    if (!particular || !size || !quantity) return alert("Fill all item fields");

    const total = fetchPricing(particular, quantity, size);
    if (typeof total === "string") return alert(total);

    const itemData = {
        particular,
        size,
        quantity,
        pricePerItem: total / quantity,
        total
    };

    if (isEdit) {
        cartItems[itemEditIndex] = itemData;
        itemEditIndex = -1;
        dom.addItemBtn.textContent = "Add Item";
    } else {
        cartItems.push(itemData);
    }

    renderCartPreview();
    clearInputs(true);
}

// Render Cart Preview
function renderCartPreview() {
    dom.cartPreview.innerHTML = "";

    if (cartItems.length === 0) {
        dom.cartPreview.innerHTML = "<p>No items in cart.</p>";
        return;
    }

    cartItems.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "box";
        div.innerHTML = `
            <p>${item.particular} (Size: ${item.size}) × ${item.quantity} = ₹${item.total}</p>
            <div class="btn-container">
                <button data-edit="${index}" class="edit-btn">✏️</button>
                <button data-delete="${index}" class="delete-btn">❌</button>
            </div>
        `;
        dom.cartPreview.appendChild(div);
    });

    const total = cartItems.reduce((sum, item) => sum + item.total, 0);
    const totalDiv = document.createElement("div");
    totalDiv.innerHTML = `<p><strong>Total: ₹${total}</strong></p>`;

    const generateBtn = document.createElement("button");
    generateBtn.textContent = editIndex !== -1 ? "Update Final Bill" : "Generate Final Bill";
    generateBtn.className = "generate-bill-btn";
    generateBtn.addEventListener("click", submitBill);

    totalDiv.appendChild(generateBtn);
    dom.cartPreview.appendChild(totalDiv);
}

// Clear Inputs
function clearInputs(skipName = false) {
    dom.particulars.value = "";
    dom.sizeText.value = "";
    dom.quantity.value = "";
    if (!skipName) dom.customerName.value = "";
    dom.addItemBtn.textContent = "Add Item";
}

// Cart Click Handler
function handleCartClick(e) {
    const editIndexAttr = e.target.getAttribute("data-edit");
    const deleteIndexAttr = e.target.getAttribute("data-delete");

    if (editIndexAttr !== null) {
        const item = cartItems[editIndexAttr];
        dom.particulars.value = item.particular;
        dom.sizeText.value = item.size;
        dom.quantity.value = item.quantity;
        dom.addItemBtn.textContent = "Update Item";
        itemEditIndex = +editIndexAttr;
    } else if (deleteIndexAttr !== null) {
        cartItems.splice(deleteIndexAttr, 1);
        renderCartPreview();
    }
}

// Submit Bill
function submitBill() {
    const name = dom.customerName.value.trim();
    if (!name || cartItems.length === 0) return alert("Add customer name and items");

    const totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0);
    const newBill = {
        name,
        items: [...cartItems],
        total: totalAmount,
        timestamp: new Date().toISOString()
    };

    const bills = JSON.parse(localStorage.getItem("bills")) || [];

    if (editIndex !== -1) {
        bills[editIndex] = newBill;
        editIndex = -1;
        dom.submitBtn.textContent = "Submit Bill";
    } else {
        bills.unshift(newBill);
    }

    localStorage.setItem("bills", JSON.stringify(bills));
    cartItems = [];
    clearInputs();
    renderCartPreview();
    renderBillList();
}

// Render Bills
function renderBillList() {
    const bills = JSON.parse(localStorage.getItem("bills")) || [];
    dom.billsContainer.innerHTML = "";

    bills.forEach((bill, index) => {
        const container = document.createElement("div");
        container.className = "container";

        const itemsHTML = bill.items.map(item =>
            `<li>${item.particular} (Size: ${item.size}) × ${item.quantity} = ₹${item.total}</li>`
        ).join("");

        container.innerHTML = `
            <div class="box">
                <p><strong>Name:</strong> ${bill.name}</p>
                <p><strong>Date:</strong> ${new Date(bill.timestamp).toLocaleString()}</p>
                <ul>${itemsHTML}</ul>
                <p><strong>Total:</strong> ₹${bill.total}</p>
                <button data-edit-bill="${index}" class="edit-btn">✏️ Edit</button>
                <button data-delete-bill="${index}" class="delete-btn">🗑 Delete</button>
            </div>
        `;
        dom.billsContainer.appendChild(container);
    });
}

// Handle Bill Click
function handleBillClick(e) {
    const edit = e.target.getAttribute("data-edit-bill");
    const del = e.target.getAttribute("data-delete-bill");
    const bills = JSON.parse(localStorage.getItem("bills")) || [];

    if (edit !== null) {
        const bill = bills[edit];
        dom.customerName.value = bill.name;
        cartItems = [...bill.items];
        renderCartPreview();
        editIndex = +edit;
        dom.submitBtn.textContent = "Update Bill";
    } else if (del !== null) {
        bills.splice(del, 1);
        localStorage.setItem("bills", JSON.stringify(bills));
        renderBillList();
    }
}

// Event Listeners
function addEvents() {
    dom.addItemBtn.addEventListener("click", () => {
        handleCartItem(itemEditIndex >= 0);
    });
    dom.cartPreview.addEventListener("click", handleCartClick);
    dom.billSection.addEventListener("click", handleBillClick);
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    addEvents();
    renderBillList();
    renderCartPreview();
    console.log(fetchPricing("socks", 1, 2))
    console.log("Billing system ready.");
});
