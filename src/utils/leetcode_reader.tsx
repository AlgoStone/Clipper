import { htmlToJson } from "./markdown_utils";

const formatMarkdown = (md: string) => {
    // replace all "\n\n\n\n" with "\n\n"
    let formattedMD = md.replace(/\n\n\n\n/g, "\n\n");
    // replace all "\n\n\n" with "\n\n"
    formattedMD = formattedMD.replace(/\n\n\n/g, "\n\n");
    // remove trailing whitespaces and newlines
    formattedMD = formattedMD.trimEnd();
    return formattedMD;
};

export const LeetcodeProblemReader = async (outerHTML: string | undefined) => {
    let problemMetaData = {
        name: "",
        description: "",
        examples: [] as string[],
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
            problemMetaData.description = formatMarkdown(
                data.description as string
            );
            problemMetaData.examples = (data.examples as string[]).map((ex) =>
                formatMarkdown(ex)
            );
            problemMetaData.constraints = formatMarkdown(
                data.constraints as string
            );
            problemMetaData.follow_ups = formatMarkdown(
                data.follow_up as string
            );

            console.log(problemMetaData);
        })
        .catch((err) => {
            console.error(err);
        });

    return problemMetaData;
};

export const LeetcodeSolutionReader = async () => {};
