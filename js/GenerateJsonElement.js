const pageData = {
  title: "Untitled Page",
  content: []
};

const pageTitleInput = document.getElementById("pageTitle");
const nodeTypeSelect = document.getElementById("nodeType");
const dynamicFields = document.getElementById("dynamicFields");
const nodeList = document.getElementById("nodeList");
const mainContent = document.getElementById("main-content");
const jsonPreview = document.getElementById("jsonPreview");

document.getElementById("addNodeBtn").addEventListener("click", addNodeFromForm);
document.getElementById("showJsonBtn").addEventListener("click", updateJsonPreview);
document.getElementById("downloadJsonBtn").addEventListener("click", downloadJson);
document.getElementById("saveJsonBtn").addEventListener("click", saveJsonToFile);
pageTitleInput.addEventListener("input", () => {
  pageData.title = pageTitleInput.value.trim() || "Untitled Page";
  renderAll();
});
nodeTypeSelect.addEventListener("change", renderDynamicFields);

renderDynamicFields();
renderAll();

function createElement(tag, text = "") {
  const el = document.createElement(tag);
  if (text) el.textContent = text;
  return el;
}

function renderDynamicFields() {
  const type = nodeTypeSelect.value;
  dynamicFields.innerHTML = "";

  switch (type) {
    case "heading":
      dynamicFields.innerHTML = `
        <label for="fieldLevel">Heading Level</label>
        <select id="fieldLevel">
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
        </select>

        <label for="fieldText">Text</label>
        <input id="fieldText" type="text" placeholder="Heading text" />
      `;
      break;

    case "paragraph":
      dynamicFields.innerHTML = `
        <label for="fieldText">Text</label>
        <textarea id="fieldText" placeholder="Paragraph text"></textarea>
      `;
      break;

    case "hyperlink":
      dynamicFields.innerHTML = `
        <label for="fieldText">Link Text</label>
        <input id="fieldText" type="text" placeholder="Open website" />

        <label for="fieldUrl">URL</label>
        <input id="fieldUrl" type="text" placeholder="https://example.com" />
      `;
      break;

    case "list":
      dynamicFields.innerHTML = `
        <label for="fieldItems">List Items</label>
        <textarea id="fieldItems" placeholder="One item per line"></textarea>
      `;
      break;

    case "code":
      dynamicFields.innerHTML = `
        <label for="fieldText">Code</label>
        <textarea id="fieldText" placeholder="console.log('hello');"></textarea>

        <label for="fieldSrc">Optional external src</label>
        <input id="fieldSrc" type="text" placeholder="scripts/example.js" />
      `;
      break;

    case "image":
      dynamicFields.innerHTML = `
        <label for="fieldSrc">Image src</label>
        <input id="fieldSrc" type="text" placeholder="img/example.png" />

        <label for="fieldAlt">Alt text</label>
        <input id="fieldAlt" type="text" placeholder="Description of image" />
      `;
      break;
  }
}

function addNodeFromForm() {
  const type = nodeTypeSelect.value;
  let node = null;

  switch (type) {
    case "heading":
      node = {
        type: "heading",
        level: Number(document.getElementById("fieldLevel").value || 1),
        text: document.getElementById("fieldText").value.trim()
      };
      break;

    case "paragraph":
      node = {
        type: "paragraph",
        text: document.getElementById("fieldText").value
      };
      break;

    case "hyperlink":
      node = {
        type: "hyperlink",
        text: document.getElementById("fieldText").value.trim(),
        url: document.getElementById("fieldUrl").value.trim()
      };
      break;

    case "list":
      node = {
        type: "list",
        items: document.getElementById("fieldItems").value
          .split("\n")
          .map(item => item.trim())
          .filter(Boolean)
      };
      break;

    case "code":
      node = {
        type: "code",
        text: document.getElementById("fieldText").value,
        src: document.getElementById("fieldSrc").value.trim()
      };
      if (!node.src) delete node.src;
      break;

    case "image":
      node = {
        type: "image",
        src: document.getElementById("fieldSrc").value.trim(),
        alt: document.getElementById("fieldAlt").value.trim()
      };
      break;
  }

  if (!node) return;

  pageData.content.push(node);
  renderAll();
  clearFormInputs();
}

function clearFormInputs() {
  const inputs = dynamicFields.querySelectorAll("input, textarea");
  inputs.forEach(input => input.value = "");
}

function renderAll() {
  document.title = pageData.title || "Untitled Page";
  pageTitleInput.value = pageData.title || "";
  renderNodeList();
  renderPreview();
  updateJsonPreview();
}

function renderNodeList() {
  nodeList.innerHTML = "";

  if (pageData.content.length === 0) {
    nodeList.innerHTML = `<p class="small">No nodes yet.</p>`;
    return;
  }

  pageData.content.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "node-card";

    const title = document.createElement("h4");
    title.textContent = `${index + 1}. ${item.type}`;
    card.appendChild(title);

    const editor = createNodeEditor(item, index);
    card.appendChild(editor);

    const buttonRow = document.createElement("div");
    buttonRow.className = "actions";

    const upBtn = document.createElement("button");
    upBtn.textContent = "Up";
    upBtn.onclick = () => moveNode(index, -1);

    const downBtn = document.createElement("button");
    downBtn.textContent = "Down";
    downBtn.onclick = () => moveNode(index, 1);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteNode(index);

    buttonRow.appendChild(upBtn);
    buttonRow.appendChild(downBtn);
    buttonRow.appendChild(deleteBtn);
    card.appendChild(buttonRow);

    nodeList.appendChild(card);
  });
}

function createNodeEditor(item, index) {
  const wrapper = document.createElement("div");

  switch (item.type) {
    case "heading":
      wrapper.innerHTML = `
        <label>Level</label>
        <select data-index="${index}" data-field="level">
          <option value="1" ${item.level === 1 ? "selected" : ""}>H1</option>
          <option value="2" ${item.level === 2 ? "selected" : ""}>H2</option>
          <option value="3" ${item.level === 3 ? "selected" : ""}>H3</option>
        </select>

        <label>Text</label>
        <input data-index="${index}" data-field="text" type="text" value="${escapeHtml(item.text || "")}" />
      `;
      break;

    case "paragraph":
      wrapper.innerHTML = `
        <label>Text</label>
        <textarea data-index="${index}" data-field="text">${escapeHtml(item.text || "")}</textarea>
      `;
      break;

    case "hyperlink":
      wrapper.innerHTML = `
        <label>Text</label>
        <input data-index="${index}" data-field="text" type="text" value="${escapeHtml(item.text || "")}" />

        <label>URL</label>
        <input data-index="${index}" data-field="url" type="text" value="${escapeHtml(item.url || "")}" />
      `;
      break;

    case "list":
      wrapper.innerHTML = `
        <label>Items (one per line)</label>
        <textarea data-index="${index}" data-field="items">${escapeHtml((item.items || []).join("\n"))}</textarea>
      `;
      break;

    case "code":
      wrapper.innerHTML = `
        <label>Inline Code</label>
        <textarea data-index="${index}" data-field="text">${escapeHtml(item.text || "")}</textarea>

        <label>External src</label>
        <input data-index="${index}" data-field="src" type="text" value="${escapeHtml(item.src || "")}" />
      `;
      break;

    case "image":
      wrapper.innerHTML = `
        <label>Image src</label>
        <input data-index="${index}" data-field="src" type="text" value="${escapeHtml(item.src || "")}" />

        <label>Alt text</label>
        <input data-index="${index}" data-field="alt" type="text" value="${escapeHtml(item.alt || "")}" />
      `;
      break;
  }

  wrapper.querySelectorAll("input, textarea, select").forEach(input => {
    input.addEventListener("input", handleNodeEdit);
    input.addEventListener("change", handleNodeEdit);
  });

  return wrapper;
}

function handleNodeEdit(event) {
  const index = Number(event.target.dataset.index);
  const field = event.target.dataset.field;
  const value = event.target.value;

  if (!pageData.content[index]) return;

  if (field === "items") {
    pageData.content[index].items = value
      .split("\n")
      .map(item => item.trim())
      .filter(Boolean);
  } else if (field === "level") {
    pageData.content[index].level = Number(value);
  } else {
    pageData.content[index][field] = value;
  }

  renderPreview();
  updateJsonPreview();
}

function moveNode(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= pageData.content.length) return;

  [pageData.content[index], pageData.content[newIndex]] =
    [pageData.content[newIndex], pageData.content[index]];

  renderAll();
}

function deleteNode(index) {
  pageData.content.splice(index, 1);
  renderAll();
}

function renderPreview() {
  mainContent.innerHTML = "";

  for (const item of pageData.content) {
    let contentElement = null;

    switch (item.type) {
      case "heading":
        contentElement = document.createElement(`h${item.level || 1}`);
        contentElement.textContent = item.text || "";
        break;

      case "paragraph":
        contentElement = document.createElement("p");
        contentElement.textContent = item.text || "";
        break;

      case "hyperlink":
        contentElement = document.createElement("a");
        contentElement.href = item.url || "#";
        contentElement.target = "_blank";
        contentElement.rel = "noopener noreferrer";
        contentElement.textContent = item.text || item.url || "Link";
        contentElement.style.display = "block";
        contentElement.style.marginTop = "0.5rem";
        break;

      case "list":
        contentElement = document.createElement("ul");
        (item.items || []).forEach(text => {
          const li = document.createElement("li");
          li.textContent = text;
          contentElement.appendChild(li);
        });
        break;

      case "code":
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.style.whiteSpace = "pre-wrap";
        code.style.fontFamily = "Consolas, 'Courier New', monospace";
        code.textContent = item.text || "";
        code.style.whiteSpace = "pre";
        code.style.fontFamily = "Consolas, 'Courier New', monospace";
        code.style.color = "#ffafe1";

        pre.appendChild(code);
        pre.style.padding = "1vmin";
        pre.style.overflowX = "auto";
        pre.style.backgroundColor = "#362747";
        pre.style.borderRadius = "5px";
        contentElement = pre;

        if (item.src) {
          fetch(item.src)
            .then(res => {
              if (!res.ok) throw new Error("Failed to fetch code src");
              return res.text();
            })
            .then(text => code.textContent = text)
            .catch(() => code.textContent = item.text || "[Could not load external code]");
        }
        break;

      case "image":
        contentElement = document.createElement("img");
        contentElement.src = item.src || "";
        contentElement.alt = item.alt || "";
        break;
    }

    if (contentElement) {
      mainContent.appendChild(contentElement);
    }
  }
}

function updateJsonPreview() {
  jsonPreview.textContent = JSON.stringify(pageData, null, 2);
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(pageData, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(pageData.title || "page")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function saveJsonToFile() {
  if (!window.showSaveFilePicker) {
    alert("This browser does not support direct file saving. Use Download JSON instead.");
    return;
  }

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: `${slugify(pageData.title || "page")}.json`,
      types: [
        {
          description: "JSON Files",
          accept: { "application/json": [".json"] }
        }
      ]
    });

    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(pageData, null, 2));
    await writable.close();
    alert("File saved.");
  } catch (error) {
    console.error(error);
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}