import { Github } from "/js/github.js"
import { getToken } from "/js/token.js"

const fileStorageKey = "file_cache"

class FileStateMachine {
  constructor(fileObj, fileCache) {
    this.fileObj = fileObj
    this.fileCache = fileCache
  }

  isEmpty(o) {
    return o === null || o === undefined || o === ""
  }

  getContent() {
    if (this.isEmpty(this.fileObj)) {
      return this.fileObj
    }

    switch (this.fileObj.status) {
      case 'waitDelete': { return null } break
      default: { return this.fileObj.content }
    }
  }

  save() {
    switch (this.fileObj.status) {
      case 'new':
      case 'exist_nosync': {
        // nothing
      } break
      case 'exist': {
        this.fileObj.status = 'exist_nosync'
      } break
    }
    this.fileCache[this.fileObj.path] = this.fileObj
  }

  deleteFile() {

    switch (this.fileObj.status) {
      case 'new': {
        Reflect.deleteProperty(this.fileCache, this.fileObj.path)
      } break
      case 'exist_nosync':
      case 'exist': {
        this.fileObj.status = 'wait_delete'
        this.fileCache[this.fileObj.path] = this.fileObj
      } break
    }
  }

  syncFile() {
    switch (this.fileObj.status) {
      

      case 'new':
      case 'exist_nosync': {
        this.fileObj.status = 'exist'
        this.fileCache[this.fileObj.path] = this.fileObj
      } break
      case 'wait_delete': {
        Reflect.deleteProperty(this.fileCache, this.fileObj.path)
      } break
    }
  }

  canSync() {
    switch (this.fileObj.status) {
      case 'new':
      case 'wait_delete':
      case 'exist_nosync': { return true } break
    }

    return false
  }
}


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
    return new FileStateMachine(fileCache[path], fileCache).getContent()
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
      path: path,
      content: content,
      status: "exist"
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

  if (fileCache[path]) {
    fileCache[path].content = content
    new FileStateMachine(fileCache[path], fileCache).save()
  } else {
    fileCache[path] = {
      path: path,
      content: content,
      status: 'new'
    }
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

  if (fileCache[path]) {
    let fileObj = fileCache[path]
    fileObj.content = path[path.length - 1] === '/' ? null : ""

    new FileStateMachine(fileObj, fileCache).deleteFile()
    localStorage.setItem(fileStorageKey, JSON.stringify(fileCache))
  }
}

const syncFiles = async () => {
  let fileCacheData = localStorage.getItem(fileStorageKey)
  if (fileCacheData == null) {
    return
  }

  let commitFiles = []
  let modifyFiles = []

  let fileCache = JSON.parse(fileCacheData)
  for (let path in fileCache) {
    console.info("path:" + path)
    let fileObj = fileCache[path]
    
    if (!new FileStateMachine(fileObj, fileCache).canSync()) {
      continue
    }

    modifyFiles.push(fileObj)

    commitFiles.push({
      path: path,
      content: fileObj.content,
      needDelete: fileObj.status === 'wait_delete'
    })
  }
  if (commitFiles.length === 0) {
    return
  }

  modifyFiles.forEach(f=>{
    new FileStateMachine(f, fileCache).syncFile()
  })

  let token = getToken()
  if (!token) {
    alert("密码错误！")
    throw Error("密码错误！")
  }
  console.info(token)
  let github = new Github("Cuishibing/Cuishibing.github.io", token)

  github.commitFile(commitFiles).then(data => {
    modifyFiles.forEach(f=>{
      new FileStateMachine(f, fileCache).syncFile()
    })
    localStorage.setItem(fileStorageKey, JSON.stringify(fileCache))
    alert("同步成功")
  })
}

export { getFile, saveFile, deleteFile, syncFiles }