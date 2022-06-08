const fileStorageKey = "file_cache"
const getFile = async path => {
  if (path === null || path === undefined || path === "") {
    throw Error("路径为空")
  }
  let cacheData = localStorage.getItem(fileStorageKey)
  let fileCache;
  if (cacheData) {
    fileCache = JSON.parse(cacheData)
  }

  if (fileCache === null || fileCache === undefined) {
    fileCache = {}
    localStorage.setItem(fileStorageKey, JSON.stringify(fileCache))
  }

  if (fileCache[path]) {
    return fileCache[path].content
  }
  let content = await fetch(path).then(res => {
    if (res.ok) {
      return res.text()
    }
    throw Error(res)
  })

  if (content) {
    fileCache[path] = {
      content: content,
      modify: false
    }
    localStorage.setItem(fileStorageKey, JSON.stringify(fileCache))
    return content
  }
  return content
}

const saveFile = async (path, content) => {
  if (path === null || path === undefined || path === "") {
    return
  }
  let cacheData = localStorage.getItem(fileStorageKey)
  let fileCache;
  if (cacheData) {
    fileCache = JSON.parse(cacheData)
  }
  if (fileCache === null || fileCache === undefined) {
    fileCache = {}
    localStorage.setItem(fileStorageKey, JSON.stringify(fileCache))
  }

  fileCache[path] = {
    content: content,
    modify: true
  }

  localStorage.setItem(fileStorageKey, JSON.stringify(fileCache))
}

export { getFile, saveFile }