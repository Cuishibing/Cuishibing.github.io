// parse custom include tag


let allIncludeTag = document.querySelectorAll("include")

if (allIncludeTag) {
    allIncludeTag.forEach(include => {
        try {
            let src = include.attributes.src.textContent

            let tempIframe = document.createElement("iframe")
            tempIframe.setAttribute("src", src)
            tempIframe.style = "display:none"

            tempIframe.onload = e=>{
                alert(e.target.contentDocument.body.innerHTML)
            }

            document.body.appendChild(tempIframe)
        } catch (error) {
            console.error(error)
        }
    });
}