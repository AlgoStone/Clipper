import React, { Suspense, lazy, useState } from "react";

import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { ProblemMetaData, TagType } from "../types";
import { Tag } from "./tags";

import "katex/dist/katex.min.css";
import "./cards.css";

const Markdown = lazy(() => import("react-markdown"));

interface ProblemDisplayProps {
    metadata: ProblemMetaData;
}

const nameToTitle = (name: string, reverse: boolean = false) => {
    const avoidCapitalization = ["and", "or", "in", "on", "of", "to", "a"];
    if (reverse) {
        return name
            .split(" ")
            .map((word) => word.toLowerCase())
            .join("-");
    }

    return name
        .split("-")
        .map((word) => {
            if (avoidCapitalization.includes(word.toLowerCase()))
                return word.toLowerCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
};

interface MarkdownPreviewProps {
    title: "description" | "examples" | "constraints" | "follow ups";
    markdownString: string;
    onChange?: (markdownString: string) => void;
}

export const MarkdownPreview = (props: MarkdownPreviewProps) => {
    const { title, markdownString, onChange } = props;
    const [editMode, setEditMode] = useState<boolean>(false);
    const [md, setMD] = useState<string>(markdownString);

    return (
        <div className="markdown-container">
            <div className="markdown-title">
                {title.charAt(0).toUpperCase() + title.slice(1)}
            </div>

            <div className="markdown-border">
                {editMode ? (
                    <textarea
                        onChange={(e) => {
                            e.preventDefault();
                            setMD(e.target.value);
                        }}
                        value={md}
                    />
                ) : (
                    <Suspense fallback={<div>Loading...</div>}>
                        <Markdown
                            rehypePlugins={[rehypeKatex]} // Remove rehypeRaw to avoid double rendering
                            remarkPlugins={[remarkMath, remarkGfm]}
                            children={md}
                            className={"markdown-body"}
                            components={{
                                p({ node, children, ...props }) {
                                    return (
                                        <p
                                            {...props}
                                            style={{ margin: "4px 0px" }}
                                        >
                                            {children}
                                        </p>
                                    );
                                },
                                code({ node, className, children, ...props }) {
                                    return (
                                        <code
                                            className={className}
                                            {...props}
                                            style={{
                                                backgroundColor: "#fff9c4",
                                            }}
                                        >
                                            {children}
                                        </code>
                                    );
                                },
                                span({ node, className, children, ...props }) {
                                    if (className === "katex") {
                                        return (
                                            <span
                                                className={className}
                                                {...props}
                                                style={{
                                                    backgroundColor: "#f2f3f4",
                                                    padding: "0px 2px",
                                                    borderRadius: "8px",
                                                }}
                                            >
                                                {children}
                                            </span>
                                        );
                                    }

                                    return (
                                        <span className={className} {...props}>
                                            {children}
                                        </span>
                                    );
                                },
                                img({ node, src, alt, ...props }) {
                                    return (
                                        <img
                                            src={src}
                                            alt={alt}
                                            {...props}
                                            style={{
                                                display: "block",
                                                maxWidth: "68%",
                                                borderRadius: "8px",
                                                marginLeft: "auto",
                                                marginRight: "auto",
                                            }}
                                        />
                                    );
                                },
                                ul({ node, children, ...props }) {
                                    return (
                                        <ul
                                            {...props}
                                            style={{
                                                paddingInlineStart: "16px",
                                                margin: "1px",
                                            }}
                                        >
                                            {children}
                                        </ul>
                                    );
                                },
                                li({ node, children, ...props }) {
                                    return (
                                        <li {...props} style={{}}>
                                            {children}
                                        </li>
                                    );
                                },
                            }}
                        />
                    </Suspense>
                )}
            </div>
        </div>
    );
};

export const ProblemPreview = (props: ProblemDisplayProps) => {
    const { metadata } = props;
    // const [description, setDescription] = useState<string[]>([]);
    // const [examples, setExamples] = useState<string[]>([]);
    // const [constraints, setConstraints] = useState<string>("");
    // const [followUps, setFollowUps] = useState<string>("");

    return (
        <div className="card-container">
            <div className="problem-card">
                <div className="problem-card-title-container">
                    <div className="problem-card-title">
                        {String(metadata.index) +
                            ". " +
                            nameToTitle(metadata.name)}
                    </div>
                    <div className="problem-card-tags">
                        <Tag
                            type={TagType.Difficulty}
                            value={metadata.difficulty}
                        />
                        {metadata.tags.map((topic, index) => (
                            <Tag key={index} type={TagType.Tag} value={topic} />
                        ))}
                    </div>
                    <div className="problem-card-tags">
                        {metadata.similar_problems.map((prob, index) => (
                            <Tag
                                key={index}
                                type={TagType.Tag}
                                value={nameToTitle(prob)}
                            />
                        ))}
                    </div>
                </div>
                <div className="problem-card-body">
                    <div style={{ overflow: "scroll", width: "300px" }}>
                        <MarkdownPreview
                            title="description"
                            markdownString={metadata.description}
                        />
                    </div>
                    <div style={{ overflow: "scroll", width: "300px" }}>
                        <MarkdownPreview
                            title="examples"
                            markdownString={metadata.examples.join("\n\n")}
                        />
                    </div>
                    <div style={{ overflow: "scroll", width: "300px" }}>
                        <MarkdownPreview
                            title="constraints"
                            markdownString={metadata.constraints}
                        />
                    </div>
                    {(metadata.follow_ups ?? "").length > 0 && (
                        <div style={{ overflow: "scroll", width: "300px" }}>
                            <MarkdownPreview
                                title="follow ups"
                                markdownString={metadata.follow_ups ?? ""}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
