import React, { useState } from "react";

import { ProblemMetaData, TagType } from "../types";
import { Tag } from "./tags";
import "./cards.css";
import { useEffect } from "react";

interface ProblemDisplayProps {
    metadata: ProblemMetaData;
}

type FieldMap = {
    [key: string]: string[];
};

export const ProblemCards = (props: ProblemDisplayProps) => {
    const { metadata } = props;
    const [f, setF] = useState<FieldMap>({
        description: [],
        examples: [],
        constraints: [],
    });

    const field = ["description", "examples", "constraints"];

    useEffect(() => {
        function htmlToJson(html: string) {
            // Create a new DOM parser
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");

            const parentElement = doc.querySelector("body");
            if (!parentElement) {
                return {};
            }
            console.log(parentElement);
            const childElements = Array.from(parentElement.children);

            const obj: { [key: string]: string[] } = {
                description: [],
                examples: [],
                constraints: [],
            };
            let field_index = 0;

            let i = 0;
            while (i < childElements.length) {
                const child = childElements[i];
                if (child?.tagName === "P") {
                    if (child.textContent?.includes("Constraints")) {
                        field_index = 2;
                    } else if (child.textContent?.includes("Example")) {
                        field_index = 1;
                    } else {
                        obj[field[field_index]].push(child.textContent || "");
                    }
                }
                if (child?.tagName === "PRE") {
                    obj["examples"].push(child.textContent || "");
                }
                if (child?.tagName === "UL") {
                    obj["constraints"].push(
                        ...Array.from(child.children).map(
                            (el) => el.textContent || ""
                        )
                    );
                }
                i += 1;
            }

            setF(obj);

            // Helper to get text content of elements
            const getText = (selector: string): string => {
                const element = doc.querySelector(selector);
                return element ? element.textContent?.trim() || "" : "";
            };

            // Helper to extract all <li> elements as text in constraints
            const getListItems = (selector: string): string[] => {
                const elements = doc.querySelectorAll(selector);
                return Array.from(elements).map(
                    (el) => el.textContent?.trim() || ""
                );
            };

            // Extract description
            const description = getText("p:nth-of-type(1)");

            // Extract notes
            const notes = Array.from(
                doc.querySelectorAll("p:nth-of-type(2), p:nth-of-type(3)")
            ).map((el) => el.textContent?.trim() || "");

            // Extract examples
            const examples: any[] = [];
            doc.querySelectorAll("pre").forEach((pre, index) => {
                const exampleText = pre.textContent?.trim() || "";
                const [inputLine, outputLine, explanationLine] =
                    exampleText.split("\n");
                examples.push({
                    example: index + 1,
                    input: inputLine?.replace("Input: ", "").trim(),
                    output: outputLine?.replace("Output: ", "").trim(),
                    explanation:
                        explanationLine?.replace("Explanation: ", "").trim() ||
                        undefined,
                });
            });

            // Extract constraints
            const constraints = getListItems("ul li");

            // Extract follow-up question
            const followUp = getText("strong + font");

            // Build the final JSON structure
            const json = {
                problem: {
                    description: description,
                    notes: notes,
                    examples: examples,
                    constraints: constraints,
                    follow_up: followUp || undefined,
                },
            };

            return json;
        }

        // Example usage
        const htmlString = metadata.description;

        const jsonResult = htmlToJson(htmlString);
        console.log(jsonResult);
    }, []);

    return (
        <div className="card-container">
            <div className="problem-card">
                <div className="problem-card-title-container">
                    <div className="problem-card-title">
                        <div className="problem-card-title-content">
                            {metadata.title.split(".")[1]}
                        </div>
                        <Tag
                            type={TagType.Difficulty}
                            value={metadata.difficulty}
                        />
                    </div>
                    <div>
                        {metadata.topics.map((topic, index) => (
                            <Tag
                                key={index}
                                type={TagType.Topic}
                                value={topic}
                            />
                        ))}
                    </div>
                </div>
                <div className="problem-card-body">
                    <div>Descripsion</div>
                    <div>{f.description}</div>
                    <div>Examples</div>
                    <div>{f.examples}</div>
                    <div>Constraints</div>
                    <div>{f.constraints}</div>
                </div>
                <div>
                    {metadata.similar_problems.map((topic, index) => (
                        <Tag key={index} type={TagType.Topic} value={topic} />
                    ))}
                </div>
            </div>
        </div>
    );
};
