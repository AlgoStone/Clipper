import { useState, useEffect } from "react";
import { LeetcodeProblemReader } from "../utils";
import { ProblemMetaData, ModeType } from "../types";
import { DatabaseSelector } from "./selector";
import { ProblemCards } from "./cards";

import "./preview.css";

export interface PreviewProps {
    notionAccessToken: string;
}

export const Preview = (props: PreviewProps) => {
    const { notionAccessToken } = props;
    const [probMetaData, setProbMetaData] = useState<ProblemMetaData>();
    const [mode, setMode] = useState<ModeType>(ModeType.Home);

    const fetchProblemMetaData = () => {
        const newMetaData = {} as ProblemMetaData;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab.id) {
                console.error("Tab is undefined.");
                return;
            }
            newMetaData.url = tab?.url || "";

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
                    const metadata = LeetcodeProblemReader(result[0].result);
                    newMetaData.description = metadata.description;
                    newMetaData.title = metadata.title;
                    newMetaData.difficulty = metadata.difficulty;
                    newMetaData.topics = metadata.topics;
                    newMetaData.similar_problems = metadata.similar;
                    setProbMetaData(newMetaData);
                }
            );
        });
    };

    useEffect(() => {
        fetchProblemMetaData();
    }, []);

    return (
        <div>
            {mode === ModeType.Home && (
                <>
                    <h1>Home</h1>
                    {probMetaData && (
                        <div
                        // style={{ overflowY: "scroll", height: "200px" }}
                        >
                            <ProblemCards metadata={probMetaData} />
                        </div>
                    )}
                    <button
                        onClick={() => {
                            fetchProblemMetaData();
                        }}
                    >
                        Refresh
                    </button>
                    <button
                        onClick={() => {
                            setMode(ModeType.ChooseDataBase);
                        }}
                    >
                        Choose Database
                    </button>
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
