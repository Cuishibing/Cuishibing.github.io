import { getFile, saveFile } from "/js/filefactory.js"

const isEmpty = v => {
  return v === null || v === undefined || v === ""
}

const CATEGORY_FILE_KEY = "/meta/categoryInfo.json"

export default class CategoryService {

  constructor(f) {
    this.fileKey = f
    this.data = []
  }

  static async init() {
    let d = await getFile(CATEGORY_FILE_KEY)
    let cs = new CategoryService(CATEGORY_FILE_KEY)
    if (!isEmpty(d)) {
      cs.data = JSON.parse(d)
    }
    return cs
  }

  save() {
    saveFile(this.fileKey, JSON.stringify(this.data))
  }

  getAll() {
    return this.data
  }

  create(name, newCategory) {
    for (const c of this.data) {
      if (c.name === name) {
        alert("重复的类别")
        throw Error()
      }
    }
    if (isEmpty(newCategory)) {
      newCategory = {}
    }
    newCategory.name = name
    this.data.push(newCategory)
    this.save()

    return newCategory
  }

  delete(name) {
    let targetIndex = -1
    for (let index = 0; index < this.data.length; index++) {
      const c = this.data[index];
      if (c.name === name) {
        targetIndex = index
        break
      }
    }
    if (targetIndex > -1) {
      this.data.splice(targetIndex,1)
      this.save()
    }
  }

  update(name, newCategory) {
    for (const c of this.data) {
      if (c.name === name) {
        console.info(newCategory)
        Object.assign(c, newCategory)
        this.save()
        break
      }
    }
  }

  getCategory(name) {
    for (const c of this.data) {
      if (c.name === name) {
        return c
      }
    }
    return null
  }

  getPosts(cname) {
    let c= this.getCategory(cname)
    if (isEmpty(c)) {
      return []
    }
    return c.postList
  }

  createPost(cname, postName) {
    let c = this.getCategory(cname)
    if (isEmpty(c)) {
      alert("类别不存在")
      throw Error()
    }
    if (isEmpty(c.postList)) {
      c.postList = [{name:postName}]
      this.save()
    } else{
      for (const p of c.postList) {
        if (p.name === postName) {
          alert("重复的文章")
          throw Error()
        }
      }
      c.postList.push({
        name: postName
      })
      this.save()
    }
  }

  deletePost(cname, postName) {
    let c = this.getCategory(cname)
    if (isEmpty(c)) {
      return
    }
    if (isEmpty(c.postList)) {
      return
    }
    let targetIndex = -1
    for (let index = 0; index < c.postList.length; index++) {
      const p = c.postList[index];
      if (p.name === postName) {
        targetIndex = index
        break
      }
    }
    if (targetIndex > -1) {
      c.postList.splice(targetIndex, 1)
      this.save()
    }
  }

  updatePost(cname, pname, post) {
    let c = this.getCategory(cname)
    if(isEmpty(c)) {
      alert("类别不存在")
      throw Error()
    }
    if (isEmpty(c.postList)) {
      alert("文章列表为空")
      throw Error()
    }
    for (const p of c.postList) {
      if (p.name === pname) {
        Object.assign(p, post)
        this.save()
        break
      }
    }
  }
}