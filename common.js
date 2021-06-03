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

            let tempIframe = document.createElement("iframe")
            tempIframe.setAttribute("src", src)
            tempIframe.style = "display:none"
            tempIframe.onload = e => {

                let childBody = e.target.contentDocument.body;
                let firstNode = childBody.querySelector(":first-child")

                for (let index = 0; index < include.attributes.length; index++) {
                    const attr = include.attributes[index];
                    if (attr.name !== "src") {
                        firstNode.setAttribute(attr.name, attr.value)
                    }
                }

                let parent = include.parentNode

                parent.replaceChild(firstNode, include)

                parent.removeChild(tempIframe)

                // process script tag
                let allScripts = firstNode.querySelectorAll("script")

                allScripts.forEach(script => {
                    firstNode.removeChild(script)

                    let newScript = document.createElement('script');
                    newScript.type = 'text/javascript';
                    newScript.innerHTML = script.innerHTML;
                    firstNode.appendChild(newScript);
                })
            }
            include.parentNode.appendChild(tempIframe)
        } catch (error) {
            console.error(error)
        }
    });

}

window.addEventListener("load", e => {
    // from document
    parseIncludeTag(document)
})

window.addEventListener("DOMNodeInserted", e => {
    // listen the include tag
    parseIncludeTag(e.target)
})