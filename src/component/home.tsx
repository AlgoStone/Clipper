import { useState, useEffect } from "react";
import {
    LeetcodeProblemReader,
    LeetcodeSolutionReader,
    PlainTextReader,
} from "../utils";
import { ProblemMetaData, ModeType } from "../types";
import { DatabaseSelector } from "./selector";
import { ProblemPreview, MarkdownPreview } from "./markdown-preview";
import { Button } from "./button";
import { ButtonType } from "../types";
import { formatMarkdown, nameToTitle } from "../utils/markdown_utils";
import { AnkiClient } from "../utils";
import "./cards.css";

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
    const [extractorType, setExtractorType] = useState<ExtractorType>(
        ExtractorType.Generic
    );
    const [plainText, setPlainText] = useState<string>();
    let url: URL;

    useEffect(() => {
        console.log("plainText state updated:", plainText);
    }, [plainText]);

    const fetchProblemMetaData = async () => {
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

            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    func: () => document.documentElement.outerHTML,
                },
                (result) => {
                    if (!result || result.length === 0) {
                        console.error("No result found.");
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
    }, []);

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
                            <ProblemPreview metadata={probMetaData} />
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
                                text="Copy"
                                type={ButtonType.Primary}
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        formatMarkdown(probMetaData)
                                    );
                                }}
                            />
                            <Button
                                text="Add to Anki"
                                type={ButtonType.Primary}
                                onClick={async () => {
                                    await AnkiClient.addNote(
                                        "Default",
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
                                                probMetaData?.examples.join(
                                                    "\n\n"
                                                ) ?? "",
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
            {extractorType === ExtractorType.Generic && (
                <div style={{ overflow: "scroll", width: "300px" }}>
                    <MarkdownPreview
                        title="content"
                        markdownString={plainText ?? "**No Content found**"}
                        onChange={(newText) => {
                            setPlainText(newText);
                        }}
                    />
                </div>
            )}
            {extractorType === ExtractorType.LeetCodeSolution && (
                <div style={{ overflow: "scroll", width: "300px" }}>
                    <MarkdownPreview
                        title="examples"
                        markdownString={plainText ?? "**No Content found**"}
                        onChange={(newText) => {
                            setPlainText(newText);
                        }}
                    />
                </div>
            )}
        </div>
    );
};
