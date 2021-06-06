import { req } from "/js/req.js"
// parse custom include tag
function parseIncludeTag(target) {
    let allIncludeTag = []

    if (target === document) {
        allIncludeTag = document.querySelectorAll("include")
    } else if (target.tagName === "INCLUDE") {
        allIncludeTag = [target]
    }

    if (!allIncludeTag) {
        return
    }

    allIncludeTag.forEach(include => {
        try {
            let src = include.attributes.src.textContent

            if (!src || src == "") {
                // 还没有src，设置监听器
                var options = { attributes: true };
                let callback = (mutations, observer) => {
                    console.info("ms", mutations)
                }
                var mutationObserver = new MutationObserver(callback);
                mutationObserver.observe(include, options);
            }

            req(src, "GET").then(data => {
                // console.info(data.message)

                let tempDiv = document.createElement("div")
                tempDiv.innerHTML = data.message

                let firstNode = tempDiv.querySelector(":first-child")

                for (let index = 0; index < include.attributes.length; index++) {
                    const attr = include.attributes[index];
                    if (attr.name !== "src") {
                        firstNode.setAttribute(attr.name, attr.value)
                    }
                }

                let parent = include.parentNode

                parent.replaceChild(firstNode, include)

                // process script tag
                let allScripts = firstNode.querySelectorAll("script")

                allScripts.forEach(script => {
                    firstNode.removeChild(script)

                    let newScript = document.createElement('script');
                    newScript.type = script.type
                    newScript.innerHTML = script.innerHTML;
                    firstNode.appendChild(newScript);
                })
            })
        } catch (error) {
            console.error(error)
        }
    });

}

const init = function () {

    window.addEventListener("load", e => {
        // from document
        parseIncludeTag(document)
    })

    window.addEventListener("DOMNodeInserted", e => {
        // listen the include tag
        parseIncludeTag(e.target)
    })

}

export {
    init
}