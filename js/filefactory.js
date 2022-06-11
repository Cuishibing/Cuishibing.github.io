import { Github } from "/js/github.js"
import { getToken } from "/js/token.js"

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
    if (fileCache[path].needDelete) {
      return null
    }
    return fileCache[path].content
  }
  let content = await fetch(path).then(res => {
    if (res.ok) {
      return res.text()
    }
    if (res.status == 404) {
      return null
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

const deleteFile = async (path) => {
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
    content: path[path.length - 1] === '/' ? null : "",
    modify: true,
    needDelete: true
  }

  localStorage.setItem(fileStorageKey, JSON.stringify(fileCache))
}

const syncFiles = async () => {
  let fileCacheData = localStorage.getItem(fileStorageKey)
  if (fileCacheData == null) {
    return
  }

  let commitFiles = []

  let fileCache = JSON.parse(fileCacheData)
  for (let path in fileCache) {
    console.info("path:" + path)
    if (fileCache[path].modify !== true) {
      continue
    }
    commitFiles.push({
      path: path,
      content: fileCache[path].content,
      needDelete: fileCache[path].needDelete
    })
  }
  if (commitFiles.length === 0) {
    return
  }

  let token = getToken()
  if (!token) {
    alert("密码错误！")
    throw Error("密码错误！")
  }
  console.info(token)
  let github = new Github("Cuishibing/Cuishibing.github.io", token)

  github.commitFile(commitFiles).then(data => {
    for (let path in fileCache) {
      console.info("path:" + path)
      fileCache[path].modify = false
    }
    localStorage.setItem(fileStorageKey, JSON.stringify(fileCache))
    alert("同步成功")
  })
}

export { getFile, saveFile, syncFiles }