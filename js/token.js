const getToken = function () {
    if (window.gittoken) {
        return window.gittoken
    }

    let passwd = prompt("确定要保存嘛？输入密码：")
    if (!passwd) {
        throw Error("no passwd")
    }

    let encryptArray = [81, 93, 73, 57, 89, 17, 3, 64, 79, 125, 113, 119, 4, 13, 68, 20, 97, 88, 82, 124, 78, 22, 101, 114, 80, 64, 7, 59, 41, 84, 113, 20, 87, 95, 11, 48, 122, 32, 38, 79]

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

export { getToken }