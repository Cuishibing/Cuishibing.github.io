// import { req } from "/js/req.js"

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


class Github {
    constructor(repo, token) {
        this.apihost = 'https://api.github.com';
        this.repo = repo
        this.token = token
    }

    /**
     * 
     * @param {Array} files 
     * [
     * {
     *  path, content
     * }
     * ]
     * @returns 
     */
    async commitFile(files) {
        let masterRef = await this.loadRef("heads/master")
        let masterCommit = await this.loadCommit(masterRef.object.sha)

        this.rootTree = masterCommit.tree.sha

        let createTrees = []
        files.forEach(file => {
            if (!file.path) {
                return
            }
            if (file.path.length == 0) {
                return
            }
            if (file.path[0] == "/") {
                file.path = file.path.substr(1)
            }

            let ct = this._createTree(file.path, file.content, file.needDelete)
            createTrees.push(ct)
        })

        // call api create tree
        let createTreeResult = await this.createTree(this.rootTree, createTrees)

        // call api commit
        let createCommitResult = await this.createCommit(createTreeResult.sha, [masterCommit.sha], "auto commit", {
            name: "Cuishibing",
            email: "643237029@qq.com"
        })

        // call api update ref
        return await this.updateRef("heads/master", createCommitResult.sha)
    }

    _createTree(path, content, needDelete) {
        let fileContent = null;
        if (typeof content == "string") {
            fileContent = content
        }
        if (needDelete) {
            return {
                path: path,
                mode: fileContent ? "100644" : "040000",
                type: fileContent ? "blob" : "tree",
                sha: null
            }
        }
        return {
            path: path,
            mode: fileContent ? "100644" : "040000",
            type: fileContent ? "blob" : "tree",
            content: fileContent
        }
    }

    async getTreesWithCache(sha) {
        if (this.treeCache[sha]) {
            return this.treeCache[sha]
        } else {
            let treeInfo = await this.loadTree(sha)

            this.treeCache[sha] = treeInfo.tree
            return treeInfo.tree
        }
    }

    async gitReq(method, url, data) {
        return await req(this.apihost + url, method, this.assemblyHeader(), data);
    }

    assemblyHeader() {
        if (this.token) {
            return [
                {
                    name: "Authorization",
                    value: "token " + this.token
                }
            ]
        }
        return []
    }

    async loadRef(ref) {
        return await this.gitReq("GET", "/repos/" + this.repo + "/git/refs/" + ref)
    }

    async updateRef(ref, sha) {
        return await this.gitReq("PATCH", "/repos/" + this.repo + "/git/refs/" + ref, {
            sha: sha,
            force: true
        })
    }

    async loadCommit(sha) {
        return await this.gitReq("GET", "/repos/" + this.repo + "/git/commits/" + sha)
    }

    async loadTree(sha) {
        return await this.gitReq("GET", "/repos/" + this.repo + "/git/trees/" + sha)
    }

    async createTree(base_tree, tree) {
        return await this.gitReq("POST", "/repos/" + this.repo + "/git/trees", {
            base_tree: base_tree,
            tree: tree
        })
    }

    async createCommit(treeSha, parents, msg, author) {
        return await this.gitReq("POST", "/repos/" + this.repo + "/git/commits", {
            message: msg,
            tree: treeSha,
            parents: parents,
            author: author
        })
    }
}

export { Github }