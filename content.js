// Main entry
window.addEventListener("message", event => {
  if (event.data.type === "RUN_FILTER_QUERY") {
    const filters = event.data.filters;
    applyFiltersViaURL(filters);
  }
});

// TODO: Add minPrice logic
function applyFiltersViaURL({ category, color, maxPrice, size, sort, brand }) {
  const base = "https://www.levelshoes.com/men/shoes.html";
  const params = new URLSearchParams();

  if (category) params.set("category", category);
  if (color) params.set("color", color);
  if (size) params.set("size", `sh_${size}`);
  if (maxPrice) {
    const min = 0;
    params.set("price", `${min}-${maxPrice}`);
  }
  if (brand) params.set("brand", brand); // Add brand/designer to URL if present
  // Designer/Brand or sort logic can go here if found in parsed filters

  const newUrl = `${base}?${params.toString()}`;
  console.log("[Content] Navigating to URL:", newUrl);
  window.location.href = newUrl;
}
