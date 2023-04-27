// 加密函数
const encrypt = async (text, key) => {
  let iv = crypto.getRandomValues(new Uint8Array(16));
  let keyMaterial = await getKeyMaterial(key);
  let alg = { name: 'AES-GCM', iv: iv };

  let cipherText = await crypto.subtle.encrypt(alg, keyMaterial, new TextEncoder().encode(text));
  let cipherArray = new Uint8Array(cipherText);
  let buffer = new Uint8Array(iv.length + cipherArray.length);
  buffer.set(iv);
  buffer.set(cipherArray, iv.length);
  return unit8ArrayToReadableString(buffer)
}

// 可压缩
function unit8ArrayToReadableString(unit8Array) {
  if (unit8Array == null) {
    return null
  }

  return unit8Array.join(",")
}

function readableStringToUnit8Array(text) {
  if (text == null) {
    return null
  }
  let stringArray = text.split(",").map(v => Number.parseInt(v))

  return new Uint8Array(stringArray)
}

// 解密函数
const decrypt = async (text, key) => {
  let cipherUnit8Array = readableStringToUnit8Array(text)
  let iv = cipherUnit8Array.slice(0, 16);
  let cipherArray = cipherUnit8Array.slice(16);
  let keyMaterial = await getKeyMaterial(key);
  let alg = { name: 'AES-GCM', iv: iv };
  return new TextDecoder("utf-8").decode(await crypto.subtle.decrypt(alg, keyMaterial, cipherArray))
}

// 获取密钥
async function getKeyMaterial(key) {
  key = md5(key)
  let enc = new TextEncoder();
  return await crypto.subtle.importKey('raw', enc.encode(key), 'AES-GCM', false, ['encrypt', 'decrypt']);
}

export { encrypt, decrypt }