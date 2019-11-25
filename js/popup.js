chrome.storage.sync.get(function (storage) {

    if (storage.APIKey) {

        var d = document;
        var myHeaders = new Headers();
        myHeaders.append("Content-type", "application/x-www-form-urlencoded");
        var params = {
            api_key: storage.APIKey,
            format: 'json',
            all_time_uptime_ratio: 1,
            response_times: 1
        }

        fetch('https://api.uptimerobot.com/v2/getMonitors', {
                method: 'POST',
                body: toPostBody(params),
                headers: myHeaders
            })
            .then(function (resp) {
                d.querySelector('#table tbody').innerHTML = '';
                if (resp.ok) {
                    return resp.json();
                }
                throw new Error(resp.statusText);
            })
            .then(function (json) {
                if (json.stat === "ok") {
                    var is_down = false;

                    json.monitors.forEach(function (element, index, array) {
                        var tr = d.createElement('tr');

                        var a = d.createElement('a');
                        a.className += 'friendlyname';
                        a.setAttribute('href', element.url);
                        a.innerHTML = "<span class='label label-info'>" + monitorType(element.type) + "</span>" + element.friendly_name.toUpperCase() + "<br><span class='url'>" + element.url + "</span>";
                        var friendlynameElement = d.createElement('td');
                        friendlynameElement.appendChild(a);
                        tr.appendChild(friendlynameElement);

                        if (storage.alltimeuptimeratio) {
                            d.querySelector('.alltimeuptimeratio').classList.remove('hidden');
                            var alltimeuptimeratioElement = d.createElement('td');
                            alltimeuptimeratioElement.className = 'text-center text-middle alltimeuptimeratio';
                            alltimeuptimeratioElement.innerHTML = element.all_time_uptime_ratio + "%";
                            tr.appendChild(alltimeuptimeratioElement);
                        }

                        if (storage.responsetime) {
                            var responsetimesElement = d.createElement('td');
                            if (element.response_times && element.response_times[0]) {
                                d.querySelector('.responsetime').classList.remove('hidden');
                                responsetimesElement.className = 'text-center text-middle text-nowrap responsetime';
                                responsetimesElement.innerHTML = element.response_times[0].value + " ms";
                            }
                            tr.appendChild(responsetimesElement);
                        }

                        var statusElement = d.createElement('td');
                        statusElement.className += 'text-center text-middle status';
                        statusElement.innerHTML = monitorStatus(element.status);
                        tr.appendChild(statusElement);

                        if (element.status > 2) is_down = true;

                        d.querySelector('#table tbody').appendChild(tr);
                    });

                    // setIcon
                    chrome.browserAction.setIcon({
                        path: '/images/' + (is_down ? 'browser-icon-19-down.png' : 'browser-icon-19-up.png')
                    });

                    // clickable logo
                    d.querySelector('.logo').addEventListener('click', function (e) {
                        chrome.tabs.create({
                            url: "https://uptimerobot.com/"
                        });
                    });
                    // clickable URLs
                    var friendlynameLink = d.querySelectorAll('.friendlyname');
                    friendlynameLink.forEach(function (element, index, array) {
                        element.addEventListener('click', function (e) {
                            chrome.tabs.create({
                                url: e.target.href
                            });
                        });
                    });
                    // show logo
                    if (storage.logo) {
                        d.querySelector('#table tfoot').classList.remove('hidden');
                    }
                } else {
                    d.querySelector('#table tbody').innerHTML = "<tr><td colspan='4' class='text-center'><strong>" + json.error.type + '</strong> ' + json.error.message + "</td></tr>";
                }
            })
            .catch(function (error) {
                d.querySelector('#table tbody').innerHTML = "<tr><td colspan='4' class='text-center'>" + error + "</td></tr>";
            });

    } else {
        chrome.runtime.openOptionsPage(function () {
            console.log('api_key is wrong');
        });
    }

});

function monitorStatus(status) {
    var statusText = "";
    switch (status) {
    case 0:
        statusText = '<span class="label label-info">PAUSED</span>';
        break;
    case 1:
        statusText = '<span class="label label-warning">NOT CHECKED YET</span>';
        break;
    case 2:
        statusText = '<span class="label label-success">UP</span>';
        break;
    case 8:
        statusText = '<span class="label label-warning">SEEMS DOWN</span>';
        break;
    case 9:
        statusText = '<span class="label label-danger">DOWN</span>';
        break;
    default:
        statusText = '<span class="label label-warning">NA</span>';
        break;
    }
    return statusText;
}

function monitorType(typ) {
    var typeText = '';
    switch (typ) {
    case 1:
        typeText = 'HTTP';
        break;
    case 2:
        typeText = 'Keyword';
        break;
    case 3:
        typeText = 'Ping';
        break;
    case 4:
        typeText = 'Port';
        break;
    default:
        typeText = 'NA';
        break;
    }
    return typeText;
}

function toPostBody(p) {
    var array = [];
    for (var prop in p)
        array.push(prop + '=' + p[prop]);
    return array.join('&');
}