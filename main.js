document.addEventListener('DOMContentLoaded',function() {
    document.getElementById('startTimer').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, () => {
            chrome.runtime.sendMessage({ startTimer: true });
            window.close()
        });
    });
    
    document.getElementById('stopTimer').addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, () => {
            chrome.runtime.sendMessage({ startTimer: false });
            window.close();
        })
    });

    // grabbing changes from the timer form and sending a message over to through our runtime interface
    document.getElementById('timerform').addEventListener('submit', (event) => {
        event.preventDefault();
        const timevalue = document.getElementById('time').value;
        chrome.runtime.sendMessage({ 'timerform': timevalue });
        window.close();
    })

    // our countdown timer that shows up in the front end of the extension

    function(res) {
        var timer = parseInt(res) * 60;

        var intervalId = setInterval(() => {
            timer--;
            var minutes = Math.floor(timer/60);
            var seconds = timer % 60;
            var text = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
            if (timer === 0) {
                clearInterval(intervalId);
            }       
        }, 1000 );
    }

});

