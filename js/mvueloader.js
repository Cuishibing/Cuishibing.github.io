// import { loadModule } from '/js/vue3-sfc-loader.esm.js'
// import {getFile as getFileFromCache} from '/js/filefactory.js'
const { loadModule } = window['vue3-sfc-loader'];

const options = {
    moduleCache: { vue: Vue },
    async getFile(url) {
        const res = await fetch(url)
        if (!res.ok)
            throw Object.assign(new Error(res.statusText + ' ' + url), { res })

        if (/.*?\.html$/.test(url)) {
            return {
                type: ".vue",
                getContentData: (asBinary) => {
                    if (asBinary) {
                        return res.arrayBuffer()
                    } else {
                        return res.text()
                    }
                }
            }
        }

        if (/.*?\.js$/.test(url)) {
            return {
                type: ".mjs",
                getContentData: (asBinary) => {
                    if (asBinary) {
                        return res.arrayBuffer()
                    } else {
                        return res.text()
                    }
                }
            }
        }

        return {
            getContentData: (asBinary) => {
                if (asBinary) {
                    return res.arrayBuffer()
                } else {
                    return res.text()
                }
            }
        }


    },
    addStyle(textContent) {
        const style = Object.assign(document.createElement('style'), { textContent });
        const ref = document.head.getElementsByTagName('style')[0] || null;
        document.head.insertBefore(style, ref);
    }
}

// const options2 = {
//     moduleCache: { vue: Vue },
//     async getFile(url) {
//         const res = await getFileFromCache(url)
        

//         if (/.*?\.html$/.test(url)) {
//             return {
//                 type: ".vue",
//                 getContentData: (asBinary) => {
//                     if (asBinary) {
//                         return res
//                     } else {
//                         return res
//                     }
//                 }
//             }
//         }

//         if (/.*?\.js$/.test(url)) {
//             return {
//                 type: ".mjs",
//                 getContentData: (asBinary) => {
//                     if (asBinary) {
//                         return res
//                     } else {
//                         return res
//                     }
//                 }
//             }
//         }

//         return {
//             getContentData: (asBinary) => {
//                 if (asBinary) {
//                     return res
//                 } else {
//                     return res
//                 }
//             }
//         }


//     },
//     addStyle(textContent) {
//         const style = Object.assign(document.createElement('style'), { textContent });
//         const ref = document.head.getElementsByTagName('style')[0] || null;
//         document.head.insertBefore(style, ref);
//     }
// }

const mvueloader = (url) => {
    return Vue.defineAsyncComponent(() => loadModule(url, options))
}

export { mvueloader }