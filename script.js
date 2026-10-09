(() => {
  "use strict";
  const STORAGE_KEY = "myMangaCollection.v1";
  const categories = {
    jp: { zh: "日漫實體書", en: "Japanese print manga" },
    kr: { zh: "韓漫實體書", en: "Korean print manhwa" },
    digital: { zh: "電子漫畫", en: "Digital comics" }
  };
  const messages = {
    zh: {
      home:"首頁",collection:"我的收藏",addItem:"新增作品",purchaseRecords:"購買記錄",statistics:"統計總覽",export:"匯出 JSON",import:"匯入 JSON",sidebarNote:"一點一滴，收藏喜歡的故事。",
      yourLibrary:"YOUR LITTLE LIBRARY",hello:"歡迎回來！",youHave:"你有",items:"件收藏",welcomeLine:"把喜歡的作品好好收藏，讓每一份心動都有跡可循 ♡",
      physicalManga:"日漫實體書",koreanManga:"韓漫實體書",digital:"電子漫畫",all:"全部",
      searchPlaceholder:"搜尋作品名稱、作者…",allStatuses:"全部到貨狀態",received:"已到貨",pending:"未到貨",sortNewest:"排序：最新加入",sortOldest:"排序：最早加入",sortTitle:"排序：作品名稱",sortPriceHigh:"排序：價格由高到低",sortPriceLow:"排序：價格由低到高",
      emptyTitle:"這裡還空空的",emptyText:"新增第一件收藏，開始打造你的漫畫小宇宙吧！",addFirst:"＋ 新增第一件收藏",littleDetails:"LITTLE DETAILS",addCollection:"新增收藏",editCollection:"編輯收藏",
      titleLabel:"作品名稱 *",categoryLabel:"收藏分類 *",authorLabel:"作者",priceLabel:"購買價格",quantityLabel:"冊數／數量",platformLabel:"購買平台／店鋪",arrivalLabel:"到貨狀態",coverLabel:"封面圖片網址（可選）",coverHint:"可貼上圖片網址；也可以留空使用可愛預設封面。",notesLabel:"備註（可選）",cancel:"取消",saveItem:"儲存收藏 ♡",
      deleteTitle:"刪除這件收藏？",deleteText:"刪除後無法直接復原，建議先匯出 JSON 備份。",delete:"刪除",noResults:"沒有找到符合條件的收藏",noResultsText:"試試其他搜尋字詞或篩選條件。",saved:"收藏已儲存 ♡",deleted:"收藏已刪除",importSuccess:"JSON 匯入成功",importError:"匯入失敗：請確認這是有效的收藏 JSON 檔案。",exportSuccess:"JSON 備份已下載",exportEmpty:"目前沒有收藏資料可匯出。",required:"請填寫作品名稱。",invalidCover:"封面網址必須以 http:// 或 https:// 開頭。",confirmImport:"匯入資料會與現有收藏合併；同 ID 的作品會被更新。要繼續嗎？",itemsFooter:"件收藏",edit:"編輯",deleteAction:"刪除",quantity:"數量",unknownAuthor:"作者未填",noPlatform:"平台未填",notes:"備註",currency:"幣種"
    },
    en: {
      home:"Home",collection:"My Collection",addItem:"Add Item",purchaseRecords:"Purchase Records",statistics:"Statistics",export:"Export JSON",import:"Import JSON",sidebarNote:"Collect the stories you love, one by one.",
      yourLibrary:"YOUR LITTLE LIBRARY",hello:"Welcome back!",youHave:"You have",items:"items",welcomeLine:"Keep the stories you love close, one little treasure at a time ♡",
      physicalManga:"Japanese Print",koreanManga:"Korean Print",digital:"Digital Comics",all:"All",
      searchPlaceholder:"Search title, author…",allStatuses:"All arrival statuses",received:"Received",pending:"Pending",sortNewest:"Sort: Newest first",sortOldest:"Sort: Oldest first",sortTitle:"Sort: Title",sortPriceHigh:"Sort: Price: high to low",sortPriceLow:"Sort: Price: low to high",
      emptyTitle:"It's a little empty here",emptyText:"Add your first item and start building your manga universe!",addFirst:"＋ Add your first item",littleDetails:"LITTLE DETAILS",addCollection:"Add to collection",editCollection:"Edit collection item",
      titleLabel:"Title *",categoryLabel:"Category *",authorLabel:"Author",priceLabel:"Purchase price",quantityLabel:"Volumes / quantity",platformLabel:"Store / platform",arrivalLabel:"Arrival status",coverLabel:"Cover image URL (optional)",coverHint:"Paste an image URL, or leave blank for a cute default cover.",notesLabel:"Notes (optional)",cancel:"Cancel",saveItem:"Save item ♡",
      deleteTitle:"Delete this item?",deleteText:"This can't be undone. Consider exporting a JSON backup first.",delete:"Delete",noResults:"No matching items found",noResultsText:"Try another search term or filter.",saved:"Item saved ♡",deleted:"Item deleted",importSuccess:"JSON imported successfully",importError:"Import failed: please check that this is a valid collection JSON file.",exportSuccess:"JSON backup downloaded",exportEmpty:"There are no items to export yet.",required:"Please enter a title.",invalidCover:"Cover URL must start with http:// or https://.",confirmImport:"Imported items will merge with your collection; matching IDs will be updated. Continue?",itemsFooter:"items",edit:"Edit",deleteAction:"Delete",quantity:"Qty",unknownAuthor:"No author added",noPlatform:"No platform added",notes:"Notes",currency:"Currency"
    }
  };

  const $ = id => document.getElementById(id);
  const els = {
    grid:$("collectionGrid"), empty:$("emptyState"), total:$("totalCount"), footer:$("footerCount"),
    globalSearch:$("globalSearch"), localSearch:$("localSearch"), status:$("statusFilter"), sort:$("sortFilter"),
    tabs:$("categoryTabs"), dialog:$("itemDialog"), form:$("itemForm"), confirm:$("confirmDialog"), toast:$("toast"),
    importFile:$("importFile")
  };
  let items = loadItems();
  let currentCategory = "all";
  let language = "zh";
  let deleteTarget = null;
  let toastTimer = null;

  function loadItems() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter(isValidItem).map(normalizeItem) : [];
    } catch (_) { return []; }
  }
  function isValidItem(x) { return x && typeof x === "object" && typeof x.title === "string" && typeof x.id === "string"; }
  function normalizeItem(x) {
    return {
      id: String(x.id || makeId()), title: String(x.title || ""), category: categories[x.category] ? x.category : "jp",
      author: String(x.author || ""), price: x.price === "" || x.price == null ? "" : Number(x.price),
      currency: ["USD","TWD","KRW","JPY","CNY","HKD"].includes(x.currency) ? x.currency : "USD",
      quantity: Math.max(1, parseInt(x.quantity,10) || 1), platform: String(x.platform || ""),
      status: x.status === "pending" ? "pending" : "received", cover: safeCover(x.cover || ""),
      notes: String(x.notes || ""), createdAt: Number(x.createdAt) || Date.now(), updatedAt: Number(x.updatedAt) || Date.now()
    };
  }
  function makeId() { return (crypto && crypto.randomUUID) ? crypto.randomUUID() : "item-" + Date.now() + "-" + Math.random().toString(36).slice(2,9); }
  function saveItems() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); return true; }
    catch (_) { showToast(language === "zh" ? "儲存失敗：瀏覽器空間可能已滿，請移除大型封面圖片。" : "Save failed: browser storage may be full. Try removing large cover images."); return false; }
  }
  function t(key) { return messages[language][key] || key; }
  function catName(key) { return categories[key] ? categories[key][language] : key; }
  function safeCover(value) {
    if (!value) return "";
    try { const u = new URL(value); return ["http:","https:"].includes(u.protocol) ? u.href : ""; } catch (_) { return ""; }
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
  }
  function money(item) {
    if (item.price === "" || !Number.isFinite(Number(item.price))) return language === "zh" ? "價格未填" : "No price";
    try { return new Intl.NumberFormat(language === "zh" ? "zh-TW" : "en-US", {style:"currency",currency:item.currency,maximumFractionDigits:2}).format(Number(item.price)); }
    catch (_) { return item.currency + " " + Number(item.price).toFixed(2); }
  }
  function showToast(message) {
    els.toast.textContent = message; els.toast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2600);
  }
  function coverMarkup(item) {
    const placeholder = `<div class="cover-placeholder"><span>♡</span><small>MY LITTLE TREASURE</small></div>`;
    if (!item.cover) return placeholder;
    return `<img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)} cover" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML='${placeholder.replace(/'/g,"&#39;")}'">`;
  }
  function render() {
    const query = (els.localSearch.value || els.globalSearch.value || "").trim().toLocaleLowerCase();
    const status = els.status.value;
    let shown = items.filter(item => {
      const matchesCat = currentCategory === "all" || item.category === currentCategory;
      const matchesStatus = status === "all" || item.status === status;
      const haystack = [item.title,item.author,item.platform,item.notes,catName(item.category)].join(" ").toLocaleLowerCase();
      return matchesCat && matchesStatus && (!query || haystack.includes(query));
    });
    const sort = els.sort.value;
    shown.sort((a,b) => {
      if (sort === "oldest") return a.createdAt - b.createdAt;
      if (sort === "title") return a.title.localeCompare(b.title, language === "zh" ? "zh-Hant" : "en");
      if (sort === "priceHigh") return (Number(b.price)||0) - (Number(a.price)||0);
      if (sort === "priceLow") return (Number(a.price)||0) - (Number(b.price)||0);
      return b.createdAt - a.createdAt;
    });
    els.grid.innerHTML = shown.map(item => `
      <article class="item-card">
        <div class="cover-wrap">${coverMarkup(item)}<span class="category-badge">${escapeHtml(catName(item.category))}</span>
          <div class="card-actions"><button class="icon-btn" type="button" data-action="edit" data-id="${escapeHtml(item.id)}" title="${escapeHtml(t("edit"))}" aria-label="${escapeHtml(t("edit"))}">✎</button><button class="icon-btn" type="button" data-action="delete" data-id="${escapeHtml(item.id)}" title="${escapeHtml(t("deleteAction"))}" aria-label="${escapeHtml(t("deleteAction"))}">×</button></div>
        </div>
        <div class="item-info"><h3 class="item-title">${escapeHtml(item.title)}</h3><p class="item-author">${escapeHtml(item.author || t("unknownAuthor"))}</p>
          <p class="item-price">${escapeHtml(money(item))}</p><p class="item-platform">${escapeHtml(item.platform || t("noPlatform"))}</p>
          <div class="item-meta"><span>${escapeHtml(t("quantity"))} ${item.quantity}</span><span class="status-pill ${item.status}">${escapeHtml(t(item.status))}</span></div>
        </div>
      </article>`).join("");
    els.empty.hidden = shown.length !== 0;
    els.grid.hidden = shown.length === 0;
    if (shown.length === 0) {
      const hasAny = items.length > 0;
      $("emptyState").querySelector("h2").textContent = hasAny ? t("noResults") : t("emptyTitle");
      $("emptyState").querySelector("p").textContent = hasAny ? t("noResultsText") : t("emptyText");
      $("emptyAdd").hidden = hasAny;
    }
    els.total.textContent = items.length;
    els.footer.textContent = `${items.length} ${t("itemsFooter")}`;
    const statMap = {jp:"stat-jp",kr:"stat-kr",digital:"stat-digital"};
    Object.entries(statMap).forEach(([cat,id]) => $(id).textContent = items.filter(x => x.category === cat).length);
    document.querySelectorAll(".category-tab").forEach(btn => btn.classList.toggle("selected",btn.dataset.category === currentCategory));
    document.querySelectorAll(".nav-item[data-view]").forEach(btn => btn.classList.toggle("active", btn.dataset.view === (currentCategory === "all" ? "all" : currentCategory)));
  }
  function setLanguage(next) {
    language = next;
    document.documentElement.lang = language === "zh" ? "zh-Hant" : "en";
    document.querySelectorAll("[data-i18n]").forEach(el => { const key = el.dataset.i18n; if (messages[language][key]) el.textContent = messages[language][key]; });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => { const key = el.dataset.i18nPlaceholder; if (messages[language][key]) el.placeholder = messages[language][key]; });
    $("itemCategory").innerHTML = Object.entries(categories).map(([key]) => `<option value="${key}">${escapeHtml(catName(key))}</option>`).join("");
    $("itemStatus").innerHTML = `<option value="received">${escapeHtml(t("received"))}</option><option value="pending">${escapeHtml(t("pending"))}</option>`;
    els.status.options[0].textContent = t("allStatuses"); els.status.options[1].textContent = t("received"); els.status.options[2].textContent = t("pending");
    [...els.sort.options].forEach((opt,i) => opt.textContent = [t("sortNewest"),t("sortOldest"),t("sortTitle"),t("sortPriceHigh"),t("sortPriceLow")][i]);
    render();
  }
  function openEditor(item) {
    els.form.reset(); $("formError").textContent = "";
    $("itemId").value = item ? item.id : "";
    $("dialogTitle").textContent = item ? t("editCollection") : t("addCollection");
    $("itemTitle").value = item?.title || "";
    $("itemCategory").value = item?.category || "jp";
    $("itemAuthor").value = item?.author || "";
    $("itemPrice").value = item?.price ?? "";
    $("itemCurrency").value = item?.currency || "USD";
    $("itemQuantity").value = item?.quantity || 1;
    $("itemPlatform").value = item?.platform || "";
    $("itemStatus").value = item?.status || "received";
    $("itemCover").value = item?.cover || "";
    $("itemNotes").value = item?.notes || "";
    els.dialog.showModal();
    $("itemTitle").focus();
  }
  function handleSave(event) {
    event.preventDefault();
    const title = $("itemTitle").value.trim();
    if (!title) { $("formError").textContent = t("required"); return; }
    const rawCover = $("itemCover").value.trim();
    if (rawCover && !safeCover(rawCover)) { $("formError").textContent = t("invalidCover"); return; }
    const id = $("itemId").value;
    const existing = items.find(x => x.id === id);
    const rawPrice = $("itemPrice").value.trim();
    const item = normalizeItem({
      id: id || makeId(), title, category: $("itemCategory").value, author: $("itemAuthor").value.trim(),
      price: rawPrice === "" ? "" : Number(rawPrice), currency: $("itemCurrency").value,
      quantity: $("itemQuantity").value, platform: $("itemPlatform").value.trim(), status: $("itemStatus").value,
      cover: rawCover, notes: $("itemNotes").value.trim(), createdAt: existing ? existing.createdAt : Date.now(), updatedAt: Date.now()
    });
    if (existing) items = items.map(x => x.id === id ? item : x); else items.unshift(item);
    if (saveItems()) { els.dialog.close(); render(); showToast(t("saved")); }
  }
  function startDelete(id) { deleteTarget = id; els.confirm.showModal(); }
  function exportJson() {
    if (!items.length) { showToast(t("exportEmpty")); return; }
    const blob = new Blob([JSON.stringify({format:"my-manga-collection",version:1,exportedAt:new Date().toISOString(),items},null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `manga-collection-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); showToast(t("exportSuccess"));
  }
  async function importJson(file) {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const incoming = Array.isArray(parsed) ? parsed : parsed.items;
      if (!Array.isArray(incoming) || !incoming.every(isValidItem)) throw new Error("Invalid format");
      if (!confirm(t("confirmImport"))) return;
      const merged = new Map(items.map(item => [item.id,item]));
      incoming.forEach(raw => merged.set(String(raw.id),normalizeItem(raw)));
      items = [...merged.values()];
      if (saveItems()) { render(); showToast(t("importSuccess")); }
    } catch (_) { showToast(t("importError")); }
    finally { els.importFile.value = ""; }
  }

  $("addButton").addEventListener("click",() => openEditor(null));
  $("addNav").addEventListener("click",() => openEditor(null));
  $("emptyAdd").addEventListener("click",() => openEditor(null));
  $("closeDialog").addEventListener("click",() => els.dialog.close());
  $("cancelDialog").addEventListener("click",() => els.dialog.close());
  els.form.addEventListener("submit",handleSave);
  $("closeConfirm").addEventListener("click",() => els.confirm.close());
  $("keepItem").addEventListener("click",() => els.confirm.close());
  $("confirmDelete").addEventListener("click",() => {
    if (deleteTarget) { items = items.filter(x => x.id !== deleteTarget); saveItems(); render(); showToast(t("deleted")); }
    deleteTarget = null; els.confirm.close();
  });
  els.grid.addEventListener("click",event => {
    const button = event.target.closest("button[data-action]"); if (!button) return;
    const item = items.find(x => x.id === button.dataset.id); if (!item) return;
    if (button.dataset.action === "edit") openEditor(item); else startDelete(item.id);
  });
  els.tabs.addEventListener("click",event => {
    const button = event.target.closest("button[data-category]"); if (!button) return;
    currentCategory = button.dataset.category; render();
  });
  document.querySelectorAll(".nav-item[data-view]").forEach(btn => btn.addEventListener("click",() => {
    currentCategory = "all"; els.localSearch.value = ""; els.globalSearch.value = "";
    if (btn.dataset.view === "purchases") els.sort.value = "newest";
    render();
  }));
  [els.localSearch,els.globalSearch].forEach(input => input.addEventListener("input",() => {
    if (input === els.localSearch) els.globalSearch.value = input.value; else els.localSearch.value = input.value;
    render();
  }));
  els.status.addEventListener("change",render); els.sort.addEventListener("change",render);
  $("langToggle").addEventListener("click",() => setLanguage(language === "zh" ? "en" : "zh"));
  $("themeToggle").addEventListener("click",() => document.body.classList.toggle("dark"));
  $("exportNav").addEventListener("click",exportJson);
  $("importNav").addEventListener("click",() => els.importFile.click());
  els.importFile.addEventListener("change",event => importJson(event.target.files[0]));
  setLanguage(language);
})();
