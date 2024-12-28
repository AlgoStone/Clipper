import { htmlToJson } from "./markdown_utils";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { formatMarkdownNewLines } from "./markdown_utils";

export const PlainTextReader = async (
    outerHTML: string | undefined
): Promise<string> => {
    if (!outerHTML) {
        console.error("outerHTML is undefined.");
        return "Undefined Plain Text";
    }

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(outerHTML, "text/html");
    const body = htmlDoc.body;

    const file = await unified()
        .use(rehypeParse)
        .use(rehypeRemark)
        .use(remarkStringify)
        .process(body.innerHTML);

    return formatMarkdownNewLines(String(file));
};

export const LeetcodeProblemReader = async (outerHTML: string | undefined) => {
    let problemMetaData = {
        name: "",
        description: "",
        examples: "",
        constraints: "",
        follow_ups: "",
        index: -1,
        difficulty: "",
        tags: [] as string[],
        similar_problems: [] as string[],
    };

    if (!outerHTML) {
        console.error("outerHTML is undefined.");
        return problemMetaData;
    }

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(outerHTML, "text/html");
    const body = htmlDoc.body;

    const res = body.querySelector('[data-track-load="description_content"]');
    const htmlString = res?.innerHTML ?? "";

    const difficulty = body.querySelectorAll("*[class*='text-difficulty']");
    if (difficulty.length) {
        problemMetaData.difficulty = difficulty[0].innerHTML;
    }

    const fullurl = htmlDoc.querySelector('meta[property="og:url"]');
    const metaContent = fullurl ? fullurl.getAttribute("content") || "" : "";

    const problemSlug = metaContent
        .replace("https://leetcode.com/problems/", "")
        .replace("https://leetcode.cn/problems/", "")
        .replace("/description", "");

    problemMetaData.name = problemSlug;

    const linkElements = body.querySelector(
        `a[href="/problems/${problemSlug}/"]`
    );
    if (linkElements) {
        const index_title = linkElements.innerHTML.split(". ");
        if (index_title.length > 1) {
            problemMetaData.index = parseInt(index_title[0]);
        }
    }

    const topicElements = body.querySelectorAll("a[href^='/tag']");

    if (topicElements.length) {
        problemMetaData.tags = Array.from(topicElements).map(
            (ele) => ele.innerHTML
        );
    }

    const similarElements = Array.from(
        body.querySelectorAll(
            `a[href^='/problems/']:not(a[href='/problems/']):not(a[href='/problems/${problemSlug}/'])`
        )
    ).filter(
        (link) =>
            link.childNodes.length === 1 &&
            link.childNodes[0].nodeType === Node.TEXT_NODE
    );
    if (similarElements.length) {
        problemMetaData.similar_problems = Array.from(similarElements).map(
            (ele) =>
                ele
                    .getAttribute("href")
                    ?.replace("/problems/", "")
                    .replace("/", "") || ""
        );
    }

    await htmlToJson(htmlString)
        .then((data) => {
            problemMetaData.description = formatMarkdownNewLines(
                data.description as string
            );
            problemMetaData.examples = formatMarkdownNewLines(
                data.examples as string
            );
            problemMetaData.constraints = formatMarkdownNewLines(
                data.constraints as string
            );
            problemMetaData.follow_ups = formatMarkdownNewLines(
                data.follow_up as string
            );
        })
        .catch((err) => {
            console.error(err);
        });

    return problemMetaData;
};

export const LeetcodeSolutionReader = async (outerHTML: string | undefined) => {
    if (!outerHTML) {
        console.error("outerHTML is undefined.");
        return "Undefined Solution";
    }
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(outerHTML, "text/html");
    const body = htmlDoc.body;

    const container = body.querySelectorAll("div.mYe_l.WRmCx");
    if (container.length) {
        const file = await unified()
            .use(rehypeParse)
            .use(rehypeRemark)
            .use(remarkStringify)
            .process(container[0].innerHTML);
        return formatMarkdownNewLines(String(file));
    }

    return "Empty Solution";
};
