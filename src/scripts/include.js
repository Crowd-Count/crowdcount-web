async function include(selector, file) {
try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(res.status);
    document.querySelector(selector).innerHTML = await res.text();
} catch (err) {
    console.error(`Include error (${file}):`, err);
}
}
// call it
include("#header-placeholder", "/partials/__header.html");
include("#footer-placeholder", "/partials/__footer.html");