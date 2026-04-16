async function LoadPage(pageName, clickedElement = null) {
    var loader = document.querySelector(".loading");
    loader.style.display = "flex";

    

    try {
        const response = await fetch(`json/${pageName}.json`);

        if (!response.ok) {
            throw new Error(`Failed to load page: ${response.status}`);
        }

        const data = await response.json();
        RenderPage(data, clickedElement);
        loader.style.display = "none";
        if (clickedElement)
        {
            const allHeadings = document.querySelectorAll("nav h1, nav h2, nav h3");
            allHeadings.forEach(heading => heading.classList.remove("active"));
            clickedElement.classList.add("active");
        }
    } catch (error) {
        ShowError(error.message);
        console.error(error);
    }
}

function RenderPage(data) {
    const node = document.getElementById("main-content");
    node.innerHTML = "";

    if (data.title) {
        document.title = data.title;
    }

    if (data.content && Array.isArray(data.content)) {
        data.content.forEach((item) => {
            let contentElement;

            switch (item.type) {
                case "heading":
                    const level = item.level || 1;
                    contentElement = document.createElement(`h${level}`);
                    contentElement.textContent = item.text || "";

                    const sizes = {
                        1: "3vmin",
                        2: "2.4vmin",
                        3: "2vmin"
                    };

                    contentElement.style.fontSize = sizes[level] || "1.8vmin";
                    break;

                case "paragraph":
                    contentElement = document.createElement("p");
                    contentElement.textContent = item.text || "";
                    contentElement.style.fontSize = "1.5vmin";
                    break;

                case "hyperlink":
                    contentElement = document.createElement("a");
                    contentElement.href = item.url || "";
                    contentElement.target = "_blank";
                    contentElement.textContent = item.text || "";
                    contentElement.style.fontSize = "1.5vmin";
                    contentElement.style.display = "block";
                    contentElement.style.marginTop = "1vmin";
                    contentElement.style.width = "fit-content";
                    break;

                case "list":
                    contentElement = document.createElement("ul");

                    (item.items || []).forEach((text) => {
                        const li = document.createElement("li");
                        li.textContent = text;
                        li.style.fontSize = "1.5vmin";
                        contentElement.appendChild(li);
                    });
                    break;

                case "code":
                    const pre = document.createElement("pre");
                    const code = document.createElement("code");
                    code.style.fontSize = "1.5vmin";
                    code.style.whiteSpace = "pre";
                    code.style.fontFamily = "Consolas, 'Courier New', monospace";
                    code.style.color = "#ffafe1";

                    pre.style.padding = "1vmin";
                    pre.style.overflowX = "auto";
                    pre.style.backgroundColor = "#362747";
                    pre.style.width = "fit-content";
                    pre.style.borderRadius = "5px";

                    if (item.src) {
                        fetch(item.src)
                            .then(res => res.text())
                            .then(text => {
                                code.textContent = text;
                            });
                    } else {
                        code.textContent = item.text || "";
                    }

                    pre.appendChild(code);
                    contentElement = pre;
                    break;

                case "image":
                    contentElement = document.createElement("img");
                    contentElement.src = `${item.src}`;
                    contentElement.alt = item.alt || "";
                    contentElement.style.maxWidth = "100%";
                    contentElement.style.display = "block";
                    break;

                default:
                    console.warn("Unknown content type:", item.type);
                    break;
            }

            if (contentElement) {
                node.appendChild(contentElement);
            }
        });
    }
}

function ShowError(message) {
    const node = document.getElementById("main-content");
    node.innerHTML = `
        <h1>Page not found</h1>
        <p>${message}</p>
    `;
}

function GetPageFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("page") || "home";
}
