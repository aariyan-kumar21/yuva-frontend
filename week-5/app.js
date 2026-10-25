/**
 * PulseMetrics Dashboard - Week 5 Final Project
 * Features: Async JSON Fetch, Debounced Filtering, Multi-column Sorting,
 * Dynamic Charts, Accessibility Live Announcements, and CSV Export.
 */

const FALLBACK_DATA = [
  { id: "TRX-9081", customer: "Aarav Sharma", email: "aarav.s@technova.in", category: "Enterprise SaaS", region: "Asia-Pacific", date: "2026-09-12", amount: 4250.00, status: "Completed" },
  { id: "TRX-9082", customer: "Elena Rostova", email: "elena@cloudscale.io", category: "Cloud Hosting", region: "Europe", date: "2026-09-15", amount: 1890.50, status: "Completed" },
  { id: "TRX-9083", customer: "Marcus Vance", email: "mvance@fintechcorp.com", category: "Security Suite", region: "North America", date: "2026-09-18", amount: 3100.00, status: "Pending" },
  { id: "TRX-9084", customer: "Priya Nair", email: "priya@designcraft.co", category: "UI/UX Tools", region: "Asia-Pacific", date: "2026-09-20", amount: 650.00, status: "Completed" },
  { id: "TRX-9085", customer: "Lucas Meyer", email: "l.meyer@berlinware.de", category: "Enterprise SaaS", region: "Europe", date: "2026-09-22", amount: 5400.00, status: "Completed" },
  { id: "TRX-9086", customer: "Sophia Chen", email: "schen@datapulse.ai", category: "API Services", region: "North America", date: "2026-09-25", amount: 1200.75, status: "Refunded" }
];

const state = {
  rawTransactions: [],
  filteredTransactions: [],
  searchQuery: "",
  category: "ALL",
  status: "ALL",
  sortField: "date",
  sortDirection: "desc"
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

// Performance Utility: Debounce rapid user input to avoid layout thrashing
function debounce(fn, delay = 200) {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}

// Fetch Data from data.json (with fallback if opened directly via file:// protocol)
async function loadDashboardData() {
  try {
    const response = await fetch("./data.json");
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    state.rawTransactions = await response.json();
  } catch (error) {
    console.warn("Using fallback dataset (run via local server for fetch):", error.message);
    state.rawTransactions = FALLBACK_DATA;
  }

  populateCategoryDropdown();
  applyFiltersAndSort();
}

function populateCategoryDropdown() {
  const select = document.getElementById("category-filter");
  const categories = [...new Set(state.rawTransactions.map(item => item.category))].sort();
  const fragment = document.createDocumentFragment();

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    fragment.appendChild(option);
  });

  select.appendChild(fragment);
}

function applyFiltersAndSort() {
  const query = state.searchQuery.trim().toLowerCase();

  state.filteredTransactions = state.rawTransactions.filter(item => {
    const matchesQuery =
      !query ||
      item.customer.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query);

    const matchesCategory = state.category === "ALL" || item.category === state.category;
    const matchesStatus = state.status === "ALL" || item.status === state.status;

    return matchesQuery && matchesCategory && matchesStatus;
  });

  state.filteredTransactions.sort((a, b) => {
    let valA = a[state.sortField];
    let valB = b[state.sortField];

    if (state.sortField === "amount") {
      return state.sortDirection === "asc" ? valA - valB : valB - valA;
    }

    valA = String(valA).toLowerCase();
    valB = String(valB).toLowerCase();
    if (valA < valB) return state.sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return state.sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  renderKPIs();
  renderCharts();
  renderTable();
  announceUpdate();
}

function renderKPIs() {
  const data = state.filteredTransactions;
  const totalRevenue = data.reduce((sum, item) => sum + item.amount, 0);
  const count = data.length;
  const avgOrder = count > 0 ? totalRevenue / count : 0;
  const completedCount = data.filter(item => item.status === "Completed").length;
  const completionRate = count > 0 ? Math.round((completedCount / count) * 100) : 0;

  document.getElementById("kpi-revenue").textContent = currencyFormatter.format(totalRevenue);
  document.getElementById("kpi-count").textContent = String(count);
  document.getElementById("kpi-average").textContent = currencyFormatter.format(avgOrder);
  document.getElementById("kpi-completion").textContent = `${completionRate}%`;
}

function renderCharts() {
  const categoryContainer = document.getElementById("category-chart");
  const regionContainer = document.getElementById("region-list");
  categoryContainer.innerHTML = "";
  regionContainer.innerHTML = "";

  if (state.filteredTransactions.length === 0) {
    categoryContainer.innerHTML = `<p class="page-subtitle">No data available for current filter.</p>`;
    regionContainer.innerHTML = `<p class="page-subtitle">No regional metrics available.</p>`;
    return;
  }

  // Group by Category
  const categoryTotals = {};
  const regionTotals = {};
  let maxCategoryTotal = 0;
  let grandTotal = 0;

  state.filteredTransactions.forEach(item => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    regionTotals[item.region] = (regionTotals[item.region] || 0) + item.amount;
    if (categoryTotals[item.category] > maxCategoryTotal) {
      maxCategoryTotal = categoryTotals[item.category];
    }
    grandTotal += item.amount;
  });

  const catFragment = document.createDocumentFragment();
  Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, amount]) => {
      const percentage = maxCategoryTotal > 0 ? Math.round((amount / maxCategoryTotal) * 100) : 0;
      const row = document.createElement("div");
      row.className = "chart-row";
      row.innerHTML = `
        <div class="chart-label-row">
          <span>${category}</span>
          <strong>${currencyFormatter.format(amount)}</strong>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${percentage}%"></div>
        </div>
      `;
      catFragment.appendChild(row);
    });
  categoryContainer.appendChild(catFragment);

  // Render Regional Distribution
  const regFragment = document.createDocumentFragment();
  Object.entries(regionTotals)
    .sort((a, b) => b[1] - a[1])
    .forEach(([region, amount]) => {
      const share = grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0;
      const row = document.createElement("div");
      row.className = "chart-row";
      row.innerHTML = `
        <div class="chart-label-row">
          <span>${region}</span>
          <strong>${share}% (${currencyFormatter.format(amount)})</strong>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${share}%"></div>
        </div>
      `;
      regFragment.appendChild(row);
    });
  regionContainer.appendChild(regFragment);
}

function renderTable() {
  const tbody = document.getElementById("table-body");
  const countBadge = document.getElementById("results-count");
  tbody.innerHTML = "";

  countBadge.textContent = `Showing ${state.filteredTransactions.length} records`;

  if (state.filteredTransactions.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="8" style="text-align:center; padding: 2rem;">No matching transactions found. Try resetting your filters.</td>`;
    tbody.appendChild(emptyRow);
    return;
  }

  const fragment = document.createDocumentFragment();

  state.filteredTransactions.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.id}</strong></td>
      <td>${item.customer}</td>
      <td>${item.category}</td>
      <td>${item.region}</td>
      <td>${item.date}</td>
      <td><strong>${currencyFormatter.format(item.amount)}</strong></td>
      <td><span class="status-pill status-${item.status}">${item.status}</span></td>
      <td>
        <button type="button" class="btn btn-secondary view-details-btn" data-id="${item.id}" aria-label="Inspect transaction ${item.id}">
          Inspect
        </button>
      </td>
    `;
    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
}

function announceUpdate() {
  const announcer = document.getElementById("sr-announcer");
  announcer.textContent = `Dashboard updated. Showing ${state.filteredTransactions.length} transactions.`;
}

function openTransactionModal(transactionId) {
  const record = state.rawTransactions.find(item => item.id === transactionId);
  if (!record) return;

  const modal = document.getElementById("details-modal");
  const modalBody = document.getElementById("modal-body");

  modalBody.innerHTML = `
    <dl class="detail-list">
      <dt>Transaction ID</dt><dd>${record.id}</dd>
      <dt>Customer</dt><dd>${record.customer}</dd>
      <dt>Email</dt><dd>${record.email}</dd>
      <dt>Category</dt><dd>${record.category}</dd>
      <dt>Region</dt><dd>${record.region}</dd>
      <dt>Date</dt><dd>${record.date}</dd>
      <dt>Amount</dt><dd><strong>${currencyFormatter.format(record.amount)}</strong></dd>
      <dt>Status</dt><dd><span class="status-pill status-${record.status}">${record.status}</span></dd>
    </dl>
  `;

  modal.showModal();
}

function exportToCSV() {
  if (state.filteredTransactions.length === 0) return;
  const headers = ["ID", "Customer", "Email", "Category", "Region", "Date", "Amount", "Status"];
  const rows = state.filteredTransactions.map(item => [
    item.id,
    `"${item.customer}"`,
    item.email,
    `"${item.category}"`,
    `"${item.region}"`,
    item.date,
    item.amount,
    item.status
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "pulsemetrics_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Event Listeners Initialization
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();

  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", debounce(e => {
    state.searchQuery = e.target.value;
    applyFiltersAndSort();
  }, 180));

  document.getElementById("category-filter").addEventListener("change", e => {
    state.category = e.target.value;
    applyFiltersAndSort();
  });

  document.getElementById("status-filter").addEventListener("change", e => {
    state.status = e.target.value;
    applyFiltersAndSort();
  });

  document.getElementById("filter-form").addEventListener("reset", () => {
    setTimeout(() => {
      state.searchQuery = "";
      state.category = "ALL";
      state.status = "ALL";
      applyFiltersAndSort();
    }, 0);
  });

  // Table Column Sorting with ARIA synchronization
  document.querySelectorAll(".sort-btn").forEach(button => {
    button.addEventListener("click", () => {
      const field = button.dataset.sort;
      if (state.sortField === field) {
        state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
      } else {
        state.sortField = field;
        state.sortDirection = "asc";
      }

      document.querySelectorAll(".data-table th[aria-sort]").forEach(th => {
        th.setAttribute("aria-sort", "none");
        const indicator = th.querySelector(".sort-indicator");
        if (indicator) indicator.textContent = "↕";
      });

      const parentTh = button.closest("th");
      parentTh.setAttribute("aria-sort", state.sortDirection === "asc" ? "ascending" : "descending");
      button.querySelector(".sort-indicator").textContent = state.sortDirection === "asc" ? "↑" : "↓";

      applyFiltersAndSort();
    });
  });

  // Event Delegation for Inspect Buttons
  document.getElementById("table-body").addEventListener("click", e => {
    const btn = e.target.closest(".view-details-btn");
    if (btn) openTransactionModal(btn.dataset.id);
  });

  // Modal Close
  document.getElementById("close-modal").addEventListener("click", () => {
    document.getElementById("details-modal").close();
  });

  // Dark / Light Theme Toggle
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", () => {
    const html = document.documentElement;
    const isDark = html.getAttribute("data-theme") === "dark";
    const nextTheme = isDark ? "light" : "dark";
    html.setAttribute("data-theme", nextTheme);
    themeToggle.setAttribute("aria-pressed", String(!isDark));
    document.getElementById("theme-icon").textContent = isDark ? "🌙" : "☀️";
    document.getElementById("theme-text").textContent = isDark ? "Dark Mode" : "Light Mode";
  });

  // CSV Export
  document.getElementById("export-btn").addEventListener("click", exportToCSV);
});