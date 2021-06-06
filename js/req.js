const req = function (url, method, headers, data) {
    return new Promise((resolve, reject) => {
        let done = false
        let xhr = new XMLHttpRequest()
        xhr.timeout = 10000
        xhr.open(method, url, true)

        if (headers) {
            headers.forEach(header => {
                xhr.setRequestHeader(header.name, header.value);
            })
        }

        xhr.ontimeout = () => {
            throw Error("time out")
        }

        xhr.onerror = () => {
            throw Error("error")
        }

        xhr.onreadystatechange = () => {
            if (done) return
            if (xhr.readyState !== 4) return;
            if (!xhr.status) return

            done = true;

            var response = { message: xhr.responseText };

            // try parse response to json format
            if (xhr.responseText) {
                try { response = JSON.parse(xhr.responseText); }
                catch (err) { }
            }
            resolve(response)
        }

        if (data) {
            xhr.send(JSON.stringify(data))
        } else {
            xhr.send()
        }
    })
}


export {
    req
}