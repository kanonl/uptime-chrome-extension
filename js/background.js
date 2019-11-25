chrome.runtime.onStartup.addListener(function (e) {

    chrome.alarms.clearAll(function () {
        chrome.storage.sync.get('monitorInterval', function (storage) {
            if (storage.monitorInterval) {
                chrome.alarms.create('uptimerobot', {
                    when: Date.now() + 10000,
                    periodInMinutes: storage.monitorInterval
                });
            }
        })
    });

});

chrome.alarms.onAlarm.addListener(function (alarm) {

    if (alarm.name === 'uptimerobot') {
        chrome.storage.sync.get('APIKey', function (storage) {
            if (storage.APIKey) {
                var params = 'api_key=' + storage.APIKey + '&format=json';
                var myHeaders = new Headers();
                myHeaders.append("Content-type", "application/x-www-form-urlencoded");

                fetch('https://api.uptimerobot.com/v2/getMonitors', {
                        method: 'POST',
                        body: params,
                        headers: myHeaders
                    })
                    .then(function (resp) {
                        if (resp.ok) {
                            return resp.json();
                        }
                        throw new Error(resp.statusText);
                    })
                    .then(function (json) {
                        if (json.stat === "ok") {
                            var items = new Array();

                            json.monitors.forEach(function (element, index, array) {
                                if (element.status > 2) {
                                    items.push({
                                        title: element.friendly_name,
                                        message: 'is down or seems down'
                                    });
                                }
                            });

                            chrome.browserAction.setIcon({
                                path: '/images/' + ((items.length > 0) ? 'browser-icon-19-down.png' : 'browser-icon-19-up.png')
                            });

                            if (items.length > 0) {
                                var d = new Date();

                                var notificationOptions = {
                                    type: 'list',
                                    iconUrl: 'images/notifications-icon.png',
                                    title: 'Majestic Uptime Mech Overlord',
                                    title: '',
                                    message: '',
                                    items: items,
                                    contextMessage: d.toLocaleString(),
                                    priority: 2
                                };

                                chrome.notifications.create(notificationOptions, function (notificationId) {
                                    console.log('[notificationId] %s', notificationId);
                                });
                            }
                        } else {}
                    })
                    .catch(function (error) {
                        console.log(error);
                    }); // fetch

            }
        });
    }

})