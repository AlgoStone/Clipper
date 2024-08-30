import React from "react";
import "./preview.css";

export const Preview = () => {
    const [desp, setDesp] = React.useState<string>("Empty");
    const [showDesp, setShowDesp] = React.useState<boolean>(false);
    const [options, setOptions] = React.useState<{
        [key: string]: string | Array<string>;
    }>({
        title: "Title",
        url: "URL",
        difficulty: "Difficulty",
        topics: [],
        similar: [],
    });
    const [showOptions, setShowOptions] = React.useState<boolean>(false);

    return (
        <div>
            <h1>Preview</h1>
            <div style={{ overflowY: "scroll", height: "200px" }}>
                <div
                    onClick={() => {
                        setShowDesp((pre) => !pre);
                    }}
                >
                    {showDesp ? desp : "Description"}
                </div>
                <div
                    onClick={() => {
                        setShowOptions((pre) => !pre);
                    }}
                >
                    {showOptions ? (
                        <div>
                            <div>
                                <div>Title: </div>
                                {options.title}
                                <div>URL: </div>
                                {options.url}
                                <div>Difficulty: </div>
                                {options.difficulty}
                                <div>Topics: </div>
                                {(options.topics as string[]).map((topic) => (
                                    <div key={topic}>{topic}</div>
                                ))}
                                <div>Similar: </div>
                                {(options.similar as string[]).map(
                                    (similar) => (
                                        <div key={similar}>{similar}</div>
                                    )
                                )}
                            </div>
                        </div>
                    ) : (
                        "Options"
                    )}
                </div>
            </div>
            <button
                onClick={() => {
                    chrome.tabs.query(
                        { active: true, currentWindow: true },
                        (tabs) => {
                            const tab = tabs[0];
                            if (!tab.id) {
                                console.error("Tab is undefined.");
                                return;
                            }
                            setOptions((pre) => {
                                return {
                                    ...pre,

                                    url: tab.url || "not found",
                                };
                            });
                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tab.id },
                                    func: () =>
                                        document.documentElement.outerHTML,
                                },
                                (result) => {
                                    if (!result[0].result) return;
                                    const parser = new DOMParser();
                                    const htmlDoc = parser.parseFromString(
                                        result[0].result,
                                        "text/html"
                                    );

                                    const body = htmlDoc.body;

                                    const res = body.querySelectorAll(
                                        '[data-track-load="description_content"]'
                                    );
                                    setDesp(res[0].innerHTML);

                                    const difficulty = body.querySelectorAll(
                                        "*[class*='text-difficulty']"
                                    );
                                    if (!difficulty.length) return;
                                    setOptions((pre) => {
                                        return {
                                            ...pre,
                                            difficulty: difficulty[0].innerHTML,
                                        };
                                    });

                                    const fullurl = htmlDoc.querySelector(
                                        'meta[property="og:url"]'
                                    );
                                    const metaContent = fullurl
                                        ? fullurl.getAttribute("content") || ""
                                        : "";
                                    const problemSlug = metaContent
                                        .replace(
                                            "https://leetcode.com/problems/",
                                            ""
                                        )
                                        .replace(
                                            "https://leetcode.cn/problems/",
                                            ""
                                        )
                                        .replace("/description", "");

                                    const linkElements = body.querySelector(
                                        `a[href="/problems/${problemSlug}/"]`
                                    );
                                    if (linkElements) {
                                        setOptions((pre) => {
                                            return {
                                                ...pre,
                                                title: linkElements.innerHTML,
                                            };
                                        });
                                    }

                                    const topicElements =
                                        body.querySelectorAll(
                                            "a[href^='/tag']"
                                        );

                                    if (topicElements.length) {
                                        setOptions((pre) => {
                                            return {
                                                ...pre,
                                                topics: Array.from(
                                                    topicElements
                                                ).map((ele) => ele.innerHTML),
                                            };
                                        });
                                    }

                                    const similarElements =Array.from(
                                        body.querySelectorAll(
                                            `a[href^='/problems/']:not(a[href='/problems/']):not(a[href='/problems/${problemSlug}/'])`
                                        )).filter(link => link.childNodes.length === 1 && link.childNodes[0].nodeType === Node.TEXT_NODE);
                                    if (similarElements.length) {
                                        setOptions((pre) => {
                                            return {
                                                ...pre,
                                                similar: Array.from(
                                                    similarElements
                                                ).map((ele) => ele.innerHTML),
                                            };
                                        });
                                    }
                                }
                            );
                        }
                    );
                }}
            >
                Refresh
            </button>
        </div>
    );
};
