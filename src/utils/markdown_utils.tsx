import { ProblemMetaData } from "../types";

export const nameToTitle = (name: string, reverse: boolean = false) => {
    const avoidCapitalization = ["and", "or", "in", "on", "of", "to", "a"];
    const allCaptial = ["i", "ii", "iii", "iv", "v"];
    if (reverse) {
        return name
            .split(" ")
            .map((word) => word.toLowerCase())
            .join("-");
    }

    return name
        .split("-")
        .map((word) => {
            if (avoidCapitalization.includes(word.toLowerCase()))
                return word.toLowerCase();
            if (allCaptial.includes(word.toLowerCase()))
                return word.toUpperCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
};

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
        if ((node as Element).tagName === "SPAN") {
            const text = handleSpace(node.textContent);
            if (text.trim() === "") {
                return "";
            } else {
                return "$" + handleSpace(node.textContent, "$ ");
            }
        } else {
            return handleSpace(node.textContent);
        }
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
            return "$" + handleSpace(innerMD, "$ ");
        case "LI":
            return "- " + handleSpace(innerMD, "") + "\n";
        case "U":
            return handleSpace(innerMD);
        case "DIV":
            return handleSpace(innerMD);
        case "SPAN":
            return handleSpace(innerMD);
        case "P":
            return handleSpace(innerMD) + "\n";
        case "PRE":
            return "```\nEmpty Code```\n";
        case "UL":
            return handleSpace(innerMD);
        case "H4":
            return "#### " + handleSpace(innerMD) + "\n";
        case "H3":
            return "### " + handleSpace(innerMD) + "\n";
        case "H2":
            return "## " + handleSpace(innerMD) + "\n";
        case "H1":
            return "# " + handleSpace(innerMD) + "\n";
        case "svg":
            return "";
        default:
            console.log("unsupported element", element.tagName, element);
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
    const problemInfo: { [key: string]: string } = {
        description: "",
        examples: "",
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
            f_index = Math.min(f_index + 1, fields.length - 1);
            continue;
        }
        const field_value = fields[f_index];
        const content = htmlToMarkdown(child);

        if (typeof problemInfo[field_value] === "string") {
            problemInfo[field_value] += content.trim() + "\n\n";
        } else {
            console.error("Invalid field value.", field_value);
        }
        // else if (Array.isArray(problemInfo[field_value])) {
        //     if (field_value === "examples") {
        //         if (content.includes("Example ") || content.includes("示例 ")) {
        //             (problemInfo[field_value] as string[]).push(
        //                 content + "\n\n"
        //             );
        //         } else {
        //             (problemInfo[field_value] as string[])[
        //                 (problemInfo[field_value] as string[]).length - 1
        //             ] += content.replace(/\n/g, "\n\n");
        //         }
        //     } else {
        //         (problemInfo[field_value] as string[]).push(content);
        //     }
        // }
    }

    problemInfo.constraints = problemInfo.constraints
        .replace("**Constraints:**", "")
        .replace("**提示：**", "")
        .trim();

    return problemInfo;
};

export const generateMarkdownStr = (metadata: ProblemMetaData | undefined) => {
    let markdown = "";
    if (!metadata) {
        return markdown;
    }

    const yaml = `---
difficulty: ${metadata.difficulty}
tags:\n  - ${metadata.tags.map((tag) => tag.replaceAll(" ", "")).join("\n  - ")}
similar:\n  - ${metadata.similar_problems
        .map((p) => nameToTitle(p))
        .join("\n  - ")}
date updated: 2024-12-26 19:18
---`;

    markdown += yaml + "\n\n";
    markdown += `## ${metadata.index}. ${nameToTitle(metadata.name)}\n\n`;
    markdown += `## Description\n\n${metadata.description.replaceAll(
        "\n\n",
        "\n"
    )}\n\n`;
    markdown += `## Constraints\n\n${metadata.constraints.replaceAll(
        "\n\n",
        "\n"
    )}\n\n`;
    markdown += `## Examples\n\n`;
    markdown += metadata.examples.replaceAll("\n\n", "\n") + "\n\n";
    if (metadata.follow_ups) {
        markdown += `## Follow-ups\n\n${metadata.follow_ups.replaceAll(
            "\n\n",
            "\n"
        )}`;
    }
    return markdown;
};

export const formatMarkdownNewLines = (md: string) => {
    // replace all "\n\n\n\n" with "\n\n"
    let formattedMD = md.replace(/\n\n\n\n/g, "\n\n");
    // replace all "\n\n\n" with "\n\n"
    formattedMD = formattedMD.replace(/\n\n\n/g, "\n\n");
    // remove trailing whitespaces and newlines
    formattedMD = formattedMD.trimEnd();
    return formattedMD;
};
