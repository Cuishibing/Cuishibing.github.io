import { getFile, saveFile } from "/js/filefactory.js"

const CATEGORY_FILE_KEY = "/meta/categoryInfo.json"

const categoryApi = {}

categoryApi.getAllCategory = async () => {
  let categories = await getFile(CATEGORY_FILE_KEY)
  if (categories == null) {
    categories = []
    await saveFile(CATEGORY_FILE_KEY, JSON.stringify(categories, null, '\t'))
    return categories
  }
  categories = JSON.parse(categories)
  return categories
}

categoryApi.addCategory = async (cname) => {
  if (cname.indexOf(" ") >= 0) {
    throw Error("category contains space")
  }
  let categories = await categoryApi.getAllCategory()

  let index = categories.findIndex(c => {
    return c.name == cname
  })
  if (index > -1) {
    throw Error("duplicate category")
  }

  categories.push({
    name: cname
  })

  await saveFile(CATEGORY_FILE_KEY, JSON.stringify(categories, null, '\t'))
}

categoryApi.getPostList = async (cname) => {
  let categories = await categoryApi.getAllCategory()

  let index = categories.findIndex(c => {
    return c.name == cname
  })
  if (index < 0) {
    throw Error("category is not exist")
  }
  let postList = categories[index].postList
  return postList == null ? [] : postList
}

categoryApi.addPost = async (cname, pname) => {
  if (pname.indexOf(" ") >= 0) {
    throw Error("post name contains space")
  }

  let categories = await categoryApi.getAllCategory()

  let index = categories.findIndex(c => {
    return c.name == cname
  })
  if (index < 0) {
    throw Error("category is not exist")
  }
  let postList = categories[index].postList
  if (postList == null) {
    postList = []
    categories[index].postList = postList
  }

  index = postList.findIndex(p => {
    return p.name == pname
  })
  if (index > -1) {
    throw Error("duplicate post")
  }
  postList.push({
    name: pname
  })
  await saveFile(CATEGORY_FILE_KEY, JSON.stringify(categories, null, '\t'))
}

categoryApi.deletePost = async (cname, pname) => {
  let categories = await categoryApi.getAllCategory()

  let index = categories.findIndex(c => {
    return c.name == cname
  })
  if (index < 0) {
    throw Error("category is not exist")
  }
  let postList = categories[index].postList
  if (postList == null) {
    return
  }

  index = postList.findIndex(p => {
    return p.name == pname
  })
  if (index < 0) {
    return
  }

  postList.splice(index, 1)

  await saveFile(CATEGORY_FILE_KEY, JSON.stringify(categories, null, '\t'))
}

categoryApi.deleteCategory = async (cname) => {
  let categories = await categoryApi.getAllCategory()

  let index = categories.findIndex(c => {
    return c.name == cname
  })
  if (index < 0) {
    throw Error("category is not exist")
  }
  
  let postList = categories[index].postList
  if (postList != null && postList.length > 0) {
    throw Error("post list is not empty")
  }

  categories.splice(index, 1)
  await saveFile(CATEGORY_FILE_KEY, JSON.stringify(categories, null, '\t'))
}

export { categoryApi }