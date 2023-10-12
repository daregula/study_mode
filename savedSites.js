document.addEventListener('DOMContentLoaded', () => {
    // open saved sites

    document.getElementById('test').addEventListener('click', (event) => {
        event.preventDefault();
        const fetchUrls = async () => {
            const user_urls = await chrome.storage.local.get(['urls'])
            document.getElementById('user_saved_urls').innerHTML = user_urls.urls.map((url) => "<li>" + url + "</li>")
        }
        fetchUrls();
    })
});