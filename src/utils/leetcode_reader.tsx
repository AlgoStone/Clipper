export const LeetcodeProblemReader = (outerHTML: string | undefined) => {
    let problemMetaData = {
        title: "Unknown",
        url: "Unknown",
        difficulty: "Unknown",
        description: "Unknown",
        topics: [] as string[],
        similar: [] as string[],
    };

    if (!outerHTML) {
        console.error("outerHTML is undefined.");
        return problemMetaData;
    }

    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(outerHTML, "text/html");

    const body = htmlDoc.body;

    const res = body.querySelector('[data-track-load="description_content"]');
    problemMetaData.description = res?.innerHTML ?? "Unknown";


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

    const linkElements = body.querySelector(
        `a[href="/problems/${problemSlug}/"]`
    );
    if (linkElements) {
        problemMetaData.title = linkElements.innerHTML;
    }

    const topicElements = body.querySelectorAll("a[href^='/tag']");

    if (topicElements.length) {
        problemMetaData.topics = Array.from(topicElements).map(
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
        problemMetaData.similar = Array.from(similarElements).map(
            (ele) => ele.innerHTML
        );
    }

    return problemMetaData;
};

export const LeetcodeSolutionReader = async () => {};
