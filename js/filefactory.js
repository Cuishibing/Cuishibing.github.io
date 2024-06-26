import { Github } from "/js/github.js"
import { getToken } from "/js/token.js"


const FILE_STORE_KEY = "file_cache_key"
const FILE_CACHE_TIME = 24 * 60 * 60 * 1000
// const FILE_CACHE_TIME = 10000
const FILE_STATUS = {
  EXIST: "exist",
  NEW: "new",
  WAIT_DELETE: "wait_delete",
  MODIFIED: "modified"
}

class FileCache {
  constructor(cacheKey) {
    this.cacheKey = cacheKey

    if (cacheKey == null) {
      throw new Error("cache key is null")
    }

    this.cacheData = localStorage.getItem(this.cacheKey)
    if (this.cacheData == null) {
      this.cacheData = {
        fileList: {}
      }
    } else {
      this.cacheData = JSON.parse(this.cacheData)
    }

    this.fileList = this.cacheData.fileList
  }

  async getFile(path) {
    try {
      let cachedFile = this.fileList[path]
      if (cachedFile == null) {
        // 未命中缓存，尝试获取文件内容
        let content = await this.fetchFile(path)
        console.info("load file from net:", path)
        if (content != null) {
          this.fileList[path] = this.createCacheFile(FILE_STATUS.EXIST, path, content)
        }
        return content
      } else {
        // 命中缓存，要判断下是否是删除状态
        if (cachedFile.status == FILE_STATUS.WAIT_DELETE) {
          return null
        }
        // 存在的文件，要判断一下过期时间
        if (cachedFile.status == FILE_STATUS.EXIST && cachedFile.lastUtime && cachedFile.lastUtime + FILE_CACHE_TIME < Date.now()) {
          let content = await this.fetchFile(path)
          console.info("load file from net:", path)
          if (content != null) {
            this.fileList[path] = this.createCacheFile(FILE_STATUS.EXIST, path, content)
          }
          return content
        }
        console.info("load file from cache:", path)
        return localStorage.getItem(path)
      }
    } catch (error) {
      throw error
    } finally {
      this.syncData()
    }
  }

  async deleteAllFileCache() {
    for (let path in this.fileList) {
      localStorage.removeItem(path)
    }
    localStorage.removeItem(FILE_STORE_KEY)
  }

  async deleteFile(path) {
    try {
      let fileContent = null
      try {
        fileContent = await this.getFile(path)
      } catch (error) {

      }

      if (fileContent == null) {
        return
      }
      let cacheFile = this.fileList[path]
      if (!cacheFile) {
        return
      }
      switch (cacheFile.status) {
        case FILE_STATUS.NEW:
          Reflect.deleteProperty(this.fileList, path)
          break;
        case FILE_STATUS.MODIFIED:
        case FILE_STATUS.EXIST:
          cacheFile.status = FILE_STATUS.WAIT_DELETE
          cacheFile.lastUtime = Date.now()
          break;
        default:
          break;
      }
      localStorage.removeItem(path)
    } catch (error) {
      throw error
    } finally {
      this.syncData()
    }
  }

  async saveFile(path, content) {
    try {
      await this.getFile(path)
      let cacheFile = this.fileList[path]

      if (cacheFile == null) {
        this.fileList[path] = this.createCacheFile(FILE_STATUS.NEW, path, content)
        return
      }
      localStorage.setItem(path, content)

      switch (cacheFile.status) {
        case FILE_STATUS.NEW:
        case FILE_STATUS.MODIFIED:
          // localStorage.setItem(path, content)
          break;
        case FILE_STATUS.EXIST:
        case FILE_STATUS.WAIT_DELETE:
          cacheFile.status = FILE_STATUS.MODIFIED
          cacheFile.lastUtime = Date.now()
          // localStorage.setItem(path, content)
          break
      }

    } catch (error) {
      throw error
    } finally {
      this.syncData()
    }
  }

  async newFile(path, content) {
    try {
      if (path == null || content == null) {
        throw Error("file is empth")
      }
      if (path == '' || content == '') {
        throw Error("file is empth")
      }
      this.fileList[path] = this.createCacheFile(FILE_STATUS.NEW, path, content)
      localStorage.setItem(path, content)
    } catch (error) {
      throw error
    } finally {
      this.syncData()
    }
  }

  createCacheFile(fileStatus, path, content) {
    if (content != null) {
      localStorage.setItem(path, content)
    }
    return {
      path: path,
      status: fileStatus,
      lastUtime: Date.now()
    }
  }

  syncData() {
    localStorage.setItem(FILE_STORE_KEY, JSON.stringify(this.cacheData))
  }

  async fetchFile(path) {
    let content = await fetch(path + "?" + Math.random()).then(res => {
      if (res.ok) {
        return res.text()
      }
      if (res.status == 404) {
        return null
      }
      throw Error(res)
    })
    return content
  }

  async commitAllFiles() {
    let needCommitGitFiles = []
    let committedFile = []
    for (let path in this.fileList) {
      let fileObj = this.fileList[path]
      switch (fileObj.status) {
        case FILE_STATUS.NEW:
        case FILE_STATUS.MODIFIED:
        case FILE_STATUS.WAIT_DELETE:
          needCommitGitFiles.push({
            path: path,
            content: await this.getFile(path),
            needDelete: fileObj.status === FILE_STATUS.WAIT_DELETE
          })
          committedFile.push(path)
          break;
      }
    }

    if (needCommitGitFiles.length == 0) {
      return
    }


    let token = await getToken()
    if (!token) {
      alert("密码错误！")
      throw Error("密码错误！")
    }
    let github = new Github("Cuishibing/Cuishibing.github.io", token)

    await github.commitFile(needCommitGitFiles).then(data => {
      alert("同步成功")

      committedFile.forEach(f => {
        let fileObj = this.fileList[f]
        switch (fileObj.status) {
          case FILE_STATUS.NEW:
          case FILE_STATUS.MODIFIED:
            fileObj.status = FILE_STATUS.EXIST
            fileObj.lastUtime = Date.now()
            break;
          case FILE_STATUS.WAIT_DELETE:
            Reflect.deleteProperty(this.fileList, f)
            break;

          default:
            break;
        }
      })
      this.syncData()
    })
  }

}

const getFile = async (path) => {
  return new FileCache(FILE_STORE_KEY).getFile(path)  
  
}

const saveFile = async (path, content) => {
  return new FileCache(FILE_STORE_KEY).saveFile(path, content)
}

const deleteFile = async (path) => {
  return new FileCache(FILE_STORE_KEY).deleteFile(path)
}

const deleteAllFileCache = async ()=>{
  return new FileCache(FILE_STORE_KEY).deleteAllFileCache()
}

const syncFiles = async () => {
  return new FileCache(FILE_STORE_KEY).commitAllFiles()
}

export { getFile, saveFile, deleteFile, deleteAllFileCache, syncFiles }