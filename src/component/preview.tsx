import React from "react";
import "./preview.css";
import { LeetcodeProblemReader } from "../utils";

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
                onClick={async () => {
                    chrome.tabs.query(
                        { active: true, currentWindow: true },
                        (tabs) => {
                            const tab = tabs[0];
                            if (!tab.id) {
                                console.error("Tab is undefined.");
                                return;
                            }
                            setOptions((pre) => ({
                                ...pre,
                                url: tab?.url || "",
                            }));

                            chrome.scripting.executeScript(
                                {
                                    target: { tabId: tab.id },
                                    func: () =>
                                        document.documentElement.outerHTML,
                                },
                                (result) => {
                                    const metadata = LeetcodeProblemReader(
                                        result[0].result
                                    );
                                    setOptions((pre) => ({
                                        ...pre,
                                        title: metadata.title,
                                        difficulty: metadata.difficulty,
                                        topics: metadata.topics,
                                        similar: metadata.similar,
                                    }));

                                    setDesp(metadata.description);
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
