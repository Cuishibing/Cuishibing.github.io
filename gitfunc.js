

/*
提交文件到github仓库
param: {
    branch: string // 哪个分支，默认master
    repo: string, // 仓库
    file: {
        path: string, // 文件路径
        content: string, // 文件内容
    },
    commitMsg: {
        name: string, // git name
        email: string, // git email
        message: string, // commit message
    }
}
 */
function commitFile(param) {
    let ref = "refs/heads/" + param.branch
    let file = param.file
    let repo = param.repo
    // 获取head
    loadRef({
        repo: repo,
        ref: ref
    }, (err, xhr, resp) => {
        if (err) {
            return
        }

        let headCommitSha = resp.object.sha
        console.info("headCommitSha:", headCommitSha)
        loadCommit({
            repo: repo,
            sha: headCommitSha
        }, (err, xhr, resp) => {
            let headTreeSha = resp.tree.sha
            console.info("headTreeSha:", headTreeSha)

            let updateTree = {
                tree: [
                    {
                        path: file.path,
                        mode: "100644",
                        type: "blob",
                        content: file.content
                    }
                ],
                base_tree: headTreeSha
            }

            createTree({
                repo: repo,
                data: updateTree
            }, (err, xhr, resp) => {
                console.info(resp)

                reqGithub()("POST", "/repos/" + repo + "/git/commits", {
                    message: "auto commit",
                    tree: resp.sha,
                    parents: [headCommitSha],
                    author: {
                        name: "Cuishibing",
                        email: "643237029@qq.com"
                    }
                }, (err, xhr, resp) => {
                    console.info(resp)

                    reqGithub()("PATCH", "/repos/" + repo + "/git/" + ref, {
                        sha: resp.sha
                    }, (err, xhr, resp)=>{
                        console.info(resp)
                        alert("success")
                    })
                })
            })

        })




    })
}

/*
加载一个ref
param:{
    repo: string, // 仓库
    ref: string, // ref名称
}
 */
function loadRef(param, callback) {
    let repo = param.repo
    let ref = param.ref

    console.info("loadRef: repo:", repo, "ref:", ref)

    reqGithub()("GET", "/repos/" + repo + "/git/" + ref, null, (err, xhr, resp) => {
        callback(err, xhr, resp)
    })

}

/*
更新一个ref
param:{
    repo:string,
    ref:string,
    data:{
        sha:string,
        force:boolean
    }
}
 */
function updateRef(param) {
    let repo = param.repo
    let ref = param.ref
    let data = param.data

    console.info("updateRef: repo:", repo, "ref:", ref, "data:", data)
    reqGithub()("PATCH", "/repos/" + repo + "/git/refs/" + ref, data, (err, xhr, resp) => {
        console.info(resp)
    })
}

/*
加载一个commit
param:{
    repo:string,
    sha:string
}
 */
function loadCommit(param, callback) {
    let repo = param.repo
    let sha = param.sha

    console.info("loadCommit: repo:", repo, "sha:", sha)
    reqGithub()("GET", "/repos/" + repo + "/git/commits/" + sha, null, (err, xhr, resp) => {
        callback(err, xhr, resp)
    })
}

function loadTree(param, callback) {
    let repo = param.repo
    let sha = param.sha
    console.info("loadTree: repo:", repo, "sha:", sha)
    reqGithub()("GET", "/repos/" + repo + "/git/trees/" + sha, null, (err, xhr, resp) => {
        callback(err, xhr, resp)
    })
}

/*
创建一个tree对象
param:{
    repo:string,
    data:{
        base_tree:string,
        tree:[
            {
                path:string,
                mode:string, The file mode; one of 100644 for file (blob), 100755 for executable (blob), 040000 for subdirectory (tree), 160000 for submodule (commit), or 120000 for a blob that specifies the path of a symlink.
                type:string,
                sha:string,
                content:string
            }
        ]
    }
}
*/
function createTree(param, callback) {
    let repo = param.repo
    let data = param.data

    console.info("createTree: repo:", repo, "data:", data)
    reqGithub()("POST", "/repos/" + repo + "/git/trees", data, (err, xhr, resp) => {
        callback(err, xhr, resp)
    })
}