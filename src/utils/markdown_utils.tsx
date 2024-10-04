
export const handleSpace = (
    text: string | null,
    suffix: string = " "
): string => {
    if (!text || text === "") {
        return "";
    }

    const newText = text.replace(/^[ \t]+|[ \t]+$/g, "");

    if (!newText.endsWith("\n")) {
        return newText + suffix;
    }

    return newText.trim() + suffix.trim() + "\n\n";
};

const symbolList = [",", ".", "!"];

export const handleElemenst = (node: Node): string => {
    if (!node.hasChildNodes()) {
        return handleSpace(node.textContent);
    }

    const element = node as HTMLElement;
    const children = Array.from(element.childNodes);

    const innerMD = children.map((child) => handleElemenst(child)).join("");

    switch (element.tagName) {
        case "SUP":
            return "^{" + handleSpace(innerMD, "}");
        case "SUB":
            return "_{" + handleSpace(innerMD, "}");
        case "STRONG":
            return "**" + handleSpace(innerMD, "** ");
        case "B":
            return "**" + handleSpace(innerMD, "** ");
        case "EM":
            return "*" + handleSpace(innerMD, "* ");
        case "CODE":
            return "$$" + handleSpace(innerMD, "$$ ");
        case "LI":
            return "- " + handleSpace(innerMD, "") + "\n";
        case "U":
            return handleSpace(innerMD);
        default:
            console.log("unsupported 2", element.tagName, element);
            return "unsupported";
    }
};

export const htmlToMarkdown = (element: Element): string => {
    let markdown = "";
    if (!element.hasChildNodes()) {
        // IMAGE
        if (element.tagName === "IMG") {
            return `![${element.getAttribute("alt")}](${element.getAttribute(
                "src"
            )})`;
        }

        console.log("special case", element);

        if (!element.textContent || element.textContent === " ") {
            return "";
        }
        const newText = element.textContent.replace(/\n/g, "\n\n");
        markdown += handleSpace(newText);
        return markdown;
    }

    const children = Array.from(element.childNodes);

    children.forEach((child) => {
        const content = handleElemenst(child);
        const firstChar = content?.charAt(0);
        if (firstChar && symbolList.includes(firstChar)) {
            markdown = markdown.trimEnd() + content;
        } else {
            markdown += content;
        }
    });

    return markdown;
};

export const htmlToJson = async (html: string) => {
    const fields = ["description", "examples", "constraints", "follow_up"];
    const problemInfo: { [key: string]: string[] | string } = {
        description: "",
        examples: [],
        constraints: "",
        follow_up: "",
    };

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const parentElement = doc.querySelector("body");
    if (!parentElement) {
        throw new Error("No Problem Information found.");
    }

    const childElements = Array.from(parentElement.children);

    let f_index = 0;
    for (let i = 0; i < childElements.length; i++) {
        const child = childElements[i];
        if (child.tagName === "P" && child.textContent === "\u00A0") {
            f_index = (f_index + 1) % fields.length;
            continue;
        }
        const field_value = fields[f_index];
        const content = htmlToMarkdown(child);

        if (typeof problemInfo[field_value] === "string") {
            problemInfo[field_value] += content.trim() + "\n\n";
        } else if (Array.isArray(problemInfo[field_value])) {
            if (field_value === "examples") {
                if (content.includes("Example ")) {
                    (problemInfo[field_value] as string[]).push(
                        content + "\n\n"
                    );
                } else {
                    (problemInfo[field_value] as string[])[
                        (problemInfo[field_value] as string[]).length - 1
                    ] += content;
                }
            } else {
                (problemInfo[field_value] as string[]).push(content);
            }
        } else {
            console.error("Invalid field value.", field_value);
        }
    }

    return problemInfo;
};
