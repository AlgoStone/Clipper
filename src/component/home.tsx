import { useState, useEffect } from "react";
import { LeetcodeProblemReader } from "../utils";
import { ProblemMetaData, ModeType } from "../types";
import { DatabaseSelector } from "./selector";
import { ProblemPreview } from "./markdown-preview";
import { Button } from "./button";
import { ButtonType } from "../types";
import "./cards.css";

export interface PreviewProps {
    notionAccessToken: string;
}

export const Home = (props: PreviewProps) => {
    const { notionAccessToken } = props;
    const [probMetaData, setProbMetaData] = useState<ProblemMetaData>();
    const [mode, setMode] = useState<ModeType>(ModeType.Home);
    const [status, setStatus] = useState<boolean>(false);

    const fetchProblemMetaData = async () => {
        const newMetaData = {} as ProblemMetaData;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab.id) {
                console.error("Tab is undefined.");
                return;
            }
            // newMetaData.url = tab?.url || "";

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
                    LeetcodeProblemReader(result[0].result).then((data) => {
                        newMetaData.name = data.name;
                        newMetaData.index = data.index;
                        newMetaData.difficulty = data.difficulty;
                        newMetaData.tags = data.tags;
                        newMetaData.similar_problems = data.similar_problems;
                        newMetaData.description = data.description;
                        newMetaData.constraints = data.constraints;
                        newMetaData.examples = data.examples;
                        newMetaData.follow_ups = data.follow_ups;
                        setProbMetaData(newMetaData);
                    });
                }
            );
        });
    };

    useEffect(() => {
        fetchProblemMetaData();
    }, []);

    const handleCollectButton = () => {
        const baseUrl = "http://127.0.0.1:8000";
        const url = "/api/v1/leetcode/add_question";

        fetch(baseUrl + url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: probMetaData?.name,
                index: probMetaData?.index,
                difficulty: probMetaData?.difficulty,
                tags: probMetaData?.tags,
                similar_problems: probMetaData?.similar_problems,
                description: probMetaData?.description,
                constraints: probMetaData?.constraints,
                examples: probMetaData?.examples,
                follow_ups: probMetaData?.follow_ups,
            }),
        })
            .then((response) => response.json())
            .then((data) => console.log(data))
            .catch((error) => {
                console.error("Error:", error);
                setStatus(false);
            });
    };

    return (
        <div
            style={{
                display: "flex",
                alignContent: "center",
                justifyContent: "center",
            }}
        >
            {mode === ModeType.Home && (
                <>
                    {probMetaData && <ProblemPreview metadata={probMetaData} />}
                    <div className="button-group">
                        <Button
                            text="Choose Notion Database"
                            type={ButtonType.Secondary}
                            onClick={() => {
                                setMode(ModeType.ChooseDataBase);
                            }}
                        />
                        <Button
                            text="Collect"
                            type={ButtonType.Primary}
                            onClick={() => {
                                handleCollectButton();
                            }}
                        />
                    </div>
                </>
            )}
            {mode === ModeType.ChooseDataBase && (
                <DatabaseSelector
                    notionAccessToken={notionAccessToken}
                    backBtn={() => {
                        setMode(ModeType.Home);
                    }}
                />
            )}
        </div>
    );
};
