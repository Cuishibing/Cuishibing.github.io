function getToken() {
  if (window.gittoken) {
    return window.gittoken
  }

  let passwd = prompt("输入密码：")
  if (!passwd) {
      throw Error("no passwd")
  }

  let encryptArray = [80, 94, 17, 109, 124, 86, 126, 91, 87, 68, 82, 122, 66, 0, 98, 65, 81, 82, 116, 50, 30, 8, 68, 29, 70, 84, 34, 127, 90, 68, 72, 35, 68, 96, 82, 87, 91, 117, 75, 33]

  let key = md5(passwd)
  let keyArray = string2Bin(key)

  let tokenArray = []
  for (let i = 0; i < encryptArray.length; i++) {
      tokenArray.push(encryptArray[i] ^ keyArray[i % keyArray.length])
  }

  let token = bin2String(tokenArray)
  
  window.gittoken = token
  return token

  function bin2String(array) {
      var result = "";
      for (var i = 0; i < array.length; i++) {
          result += String.fromCharCode(parseInt(array[i]));
      }
      return result;
  }
  function string2Bin(str) {
      var result = [];
      for (var i = 0; i < str.length; i++) {

          result.push(str.charCodeAt(i));
      }
      return result;
  }
}

function reqGithub(githubHostname, accessToken) {
    if (!accessToken) {
      accessToken = getToken()
    }
    var timeout = 2000;
    githubHostname = (githubHostname || 'https://api.github.com');
    return request;

    function request(method, url, body, callback) {
      if (typeof body === "function") {
        callback = body;
        body = undefined;
      }
      else if (!callback) return request.bind(null, method, url, body);
      var done = false;
      var json;
      var xhr = new XMLHttpRequest();
      xhr.timeout = timeout;
      xhr.open(method, githubHostname + url, true);
      if (accessToken) {
        xhr.setRequestHeader("Authorization", "token " + accessToken);
      }
      xhr.setRequestHeader("Accept", "application/vnd.github.v3+json");
      if (body) {
        try { json = JSON.stringify(body); }
        catch (err) { return callback(err); }
      }
      xhr.ontimeout = onTimeout;
      xhr.onerror = function() {
        callback(new Error("Error requesting " + url));
      };
      xhr.onreadystatechange = onReadyStateChange;
      xhr.send(json);

      function onReadyStateChange() {
        if (done) return;
        if (xhr.readyState !== 4) return;
        if (!xhr.status) return setTimeout(onReadyStateChange, 0);
        done = true;
        var response = {message:xhr.responseText};
        if (xhr.responseText){
          try { response = JSON.parse(xhr.responseText); }
          catch (err) {}
        }
        xhr.body = response;
        return callback(null, xhr, response);
      }

      function onTimeout() {
        if (done) return;
        if (timeout < 8000) {
          timeout *= 2;
          return request(method, url, body, callback);
        }
        done = true;
        callback(new Error("Timeout " + url));
      }
    }
  };