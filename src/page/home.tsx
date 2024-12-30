import { useState, useEffect } from "react";
import {
    LeetcodeProblemReader,
    LeetcodeSolutionReader,
    PlainTextReader,
    generateMarkdownStr,
    nameToTitle,
} from "../utils";
import { ProblemMetaData, ModeType } from "../types";
import { DatabaseSelector } from "../component/notion";
import { ProblemPreview, MarkdownPreview } from "../component";
import { Button } from "../component/common";
import { ButtonType } from "../types";
import {} from "../utils/markdown_utils";
import { AnkiClient } from "../utils";
import "../component/cards.css";

export interface PreviewProps {
    notionAccessToken: string;
}

export enum ExtractorType {
    LeetCodeProblem,
    LeetCodeSolution,
    Generic,
}

export const Home = (props: PreviewProps) => {
    const { notionAccessToken } = props;
    const [probMetaData, setProbMetaData] = useState<ProblemMetaData>();
    const [mode, setMode] = useState<ModeType>(ModeType.Home);
    const [currentUrl, setCurrentUrl] = useState<string>();
    const [extractorType, setExtractorType] = useState<ExtractorType>(
        ExtractorType.Generic
    );
    const [plainText, setPlainText] = useState<string>();
    let url: URL;

    const fetchProblemMetaData = async (forceRefresh: boolean = false) => {
        const newMetaData = {} as ProblemMetaData;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab.id) {
                console.error("Tab is undefined.");
                return;
            }
            if (!tab.url) {
                console.error("Tab URL is undefined.");
                return;
            }

            url = new URL(tab.url);
            let newExtractorType = extractorType;
            if (
                url.hostname.includes("leetcode.com") ||
                url.hostname.includes("leetcode.cn")
            ) {
                if (url.pathname.includes("/description")) {
                    newExtractorType = ExtractorType.LeetCodeProblem;
                } else if (url.pathname.includes("/solutions")) {
                    newExtractorType = ExtractorType.LeetCodeSolution;
                }
            }
            setExtractorType(newExtractorType);
            setCurrentUrl(tab.url);

            let skip = false;

            try {
                chrome.storage.local.get([tab.url], (result) => {
                    if (!forceRefresh && result) {
                        switch (newExtractorType) {
                            case ExtractorType.LeetCodeProblem:
                                if (!!result[tab.url as string]) {
                                    console.log("Fetching data from cache.");
                                    setProbMetaData(
                                        result[
                                            tab.url as string
                                        ] as ProblemMetaData
                                    );
                                    skip = true;
                                }
                                break;
                            case ExtractorType.LeetCodeSolution:
                            case ExtractorType.Generic:
                                if (!!result[tab.url as string]) {
                                    console.log("Fetching data from cache.");
                                    setPlainText(
                                        result[tab.url as string] as string
                                    );
                                    skip = true;
                                }
                                break;
                        }
                    }
                });
            } catch (e) {
                console.log("Error fetching data from cache.");
                console.log(e);
            }

            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    func: () => document.documentElement.outerHTML,
                },
                (result) => {
                    if (skip || !result || result.length === 0) {
                        console.log("No result found.");
                        return;
                    }

                    switch (newExtractorType) {
                        case ExtractorType.Generic:
                            PlainTextReader(result[0].result).then((data) => {
                                setPlainText(data);
                            });
                            break;
                        case ExtractorType.LeetCodeProblem:
                            LeetcodeProblemReader(result[0].result).then(
                                (data) => {
                                    newMetaData.name = data.name;
                                    newMetaData.index = data.index;
                                    newMetaData.difficulty = data.difficulty;
                                    newMetaData.tags = data.tags;
                                    newMetaData.similar_problems =
                                        data.similar_problems;
                                    newMetaData.description = data.description;
                                    newMetaData.constraints = data.constraints;
                                    newMetaData.examples = data.examples;
                                    newMetaData.follow_ups = data.follow_ups;
                                    setProbMetaData(newMetaData);
                                }
                            );
                            break;
                        case ExtractorType.LeetCodeSolution:
                            LeetcodeSolutionReader(result[0].result).then(
                                (data) => {
                                    setPlainText(data);
                                }
                            );
                            break;
                    }
                }
            );
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchProblemMetaData();
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (
            extractorType === ExtractorType.LeetCodeProblem &&
            !!currentUrl &&
            !!probMetaData
        ) {
            chrome.storage.local.set({ [currentUrl as string]: probMetaData });
        }
    }, [probMetaData, currentUrl, extractorType]);

    // const handleCollectButton = () => {
    //     const baseUrl = "http://127.0.0.1:8000";
    //     const url = "/api/v1/leetcode/add_question";

    //     fetch(baseUrl + url, {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //             name: probMetaData?.name,
    //             index: probMetaData?.index,
    //             difficulty: probMetaData?.difficulty,
    //             tags: probMetaData?.tags,
    //             similar_problems: probMetaData?.similar_problems,
    //             description: probMetaData?.description,
    //             constraints: probMetaData?.constraints,
    //             examples: probMetaData?.examples,
    //             follow_ups: probMetaData?.follow_ups,
    //         }),
    //     })
    //         .then((response) => response.json())
    //         .then((data) => console.log(data))
    //         .catch((error) => {
    //             console.error("Error:", error);
    //             // setStatus(false);
    //         });
    // };

    return (
        <div
            style={{
                display: "flex",
                alignContent: "center",
                justifyContent: "center",
            }}
        >
            {mode === ModeType.Home &&
                extractorType === ExtractorType.LeetCodeProblem && (
                    <>
                        {probMetaData && (
                            <ProblemPreview
                                metadata={probMetaData}
                                setMetadata={setProbMetaData}
                            />
                        )}
                        <div className="button-group">
                            {/* <Button
                            text="Choose Notion Database"
                            type={ButtonType.Secondary}
                            onClick={() => {
                                setMode(ModeType.ChooseDataBase);
                            }}
                        /> */}
                            <Button
                                text="Refresh"
                                type={ButtonType.Primary}
                                onClick={async () => {
                                    await fetchProblemMetaData(true);
                                }}
                            />
                            <Button
                                text="Copy"
                                type={ButtonType.Primary}
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        generateMarkdownStr(probMetaData)
                                    );
                                }}
                            />
                            <Button
                                text="Add to Anki"
                                type={ButtonType.Primary}
                                onClick={async () => {
                                    await AnkiClient.addNote(
                                        "LeetCode",
                                        "LeetCode",
                                        {
                                            Title: `${
                                                probMetaData?.index
                                            }. ${nameToTitle(
                                                probMetaData?.name || ""
                                            )}`,
                                            Difficulty:
                                                probMetaData?.difficulty ?? "",
                                            Description:
                                                probMetaData?.description ?? "",
                                            Topics:
                                                probMetaData?.tags
                                                    .map((tag) =>
                                                        tag.replaceAll(" ", "")
                                                    )
                                                    .join(" ") ?? "",
                                            Examples:
                                                probMetaData?.examples ?? "",
                                            Constraints:
                                                probMetaData?.constraints ?? "",
                                            Solution: "",
                                            SimilarQuestions:
                                                probMetaData?.similar_problems.join(
                                                    " "
                                                ) ?? "",
                                        },
                                        (probMetaData?.tags || []).map((tag) =>
                                            tag.replaceAll(" ", "")
                                        )
                                    );
                                }}
                            />

                            {/* <Button
                            text="Collect"
                            type={ButtonType.Primary}
                            onClick={() => {
                                handleCollectButton();
                            }}
                        /> */}
                        </div>
                    </>
                )}
            {mode === ModeType.ChooseDataBase &&
                extractorType === ExtractorType.LeetCodeProblem && (
                    <DatabaseSelector
                        notionAccessToken={notionAccessToken}
                        backBtn={() => {
                            setMode(ModeType.Home);
                        }}
                    />
                )}
            {(extractorType === ExtractorType.Generic ||
                extractorType === ExtractorType.LeetCodeSolution) && (
                <>
                    <div className="card-container">
                        <div className="problem-card">
                            <div className="problem-card-body">
                                <div
                                    style={{
                                        overflow: "scroll",
                                        width: "312px",
                                    }}
                                >
                                    <MarkdownPreview
                                        title="empty"
                                        markdownString={plainText}
                                        onChange={(newText) => {
                                            setPlainText(newText);
                                        }}
                                        currentUrl={currentUrl}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="button-group">
                        <Button
                            text="Refresh"
                            type={ButtonType.Primary}
                            onClick={async () => {
                                await fetchProblemMetaData(true);
                            }}
                        />
                        <Button
                            text="Copy"
                            type={ButtonType.Primary}
                            onClick={() => {
                                navigator.clipboard.writeText(plainText || "");
                            }}
                        />
                    </div>
                </>
            )}
        </div>
    );
};
