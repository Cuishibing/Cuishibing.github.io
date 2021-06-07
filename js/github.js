import { req } from "/js/req.js"

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
        console.info(masterCommit)

        this.rootTree = masterCommit.tree.sha
        console.info("rootTree:", this.rootTree)


        let createTrees = []
        files.forEach(file => {
            if (!file.path) {
                return
            }
            if (file.path.length == 0) {
                return
            }
            if (file.path[file.path.length - 1] == "/") {
                return
            }
            if (file.path[0] == "/") {
                file.path = file.path.substr(1)
            }

            let ct = this._createTree(file.path, file.content)
            createTrees.push(ct)
        })

        // call api create tree
        let createTreeResult = await this.createTree(this.rootTree, createTrees)
        console.info(createTreeResult)

        // call api commit
        let createCommitResult = await this.createCommit(createTreeResult.sha, [masterCommit.sha], "auto commit", {
            name: "Cuishibing",
            email: "643237029@qq.com"
        })
        console.info(createCommitResult)

        // call api update ref
        this.updateRef("heads/master", createCommitResult.sha)
    }

    _createTree(path, content) {
        let fileContent = null;
        if (typeof content == "string") {
            fileContent = content
        }
        return {
            path: path,
            mode: fileContent ? "100644" : "040000",
            type: fileContent ? "blob" : "tree",
            content: fileContent
        }
    }

    _treeContain(trees, path) {
        let contain = false

        for (let i = 0; i < trees.length; i++) {
            const tree = trees[i];
            if (tree.path == path) {
                contain = true;
                break
            }
        }

        return contain;
    }

    async getTreesWithCache(sha) {
        if (this.treeCache[sha]) {
            return this.treeCache[sha]
        } else {
            let treeInfo = await this.loadTree(sha)
            console.info("treeInfo:", treeInfo)

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