document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('dismiss').addEventListener('click', () => {
        window.close();
    })

    document.getElementById('restart').addEventListener('click', async () => {
        await chrome.runtime.sendMessage({ restart: true });
        window.close();
    });



});