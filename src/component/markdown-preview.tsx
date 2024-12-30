import React, {
    useEffect,
    useRef,
    Suspense,
    lazy,
    useState,
    useCallback,
} from "react";

import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { ProblemMetaData, TagType } from "../types";
import { Tag } from "./common/tags";
import { IconButton } from "./common/icon-button";
import { nameToTitle } from "../utils/markdown_utils";

import "katex/dist/katex.min.css";
import "./cards.css";

const Markdown = lazy(() => import("react-markdown"));

interface ProblemDisplayProps {
    metadata: ProblemMetaData;
    setMetadata: React.Dispatch<
        React.SetStateAction<ProblemMetaData | undefined>
    >;
}

interface MarkdownPreviewProps {
    title:
        | "description"
        | "examples"
        | "constraints"
        | "follow ups"
        | "solution"
        | "content"
        | "empty";
    markdownString: string | undefined;
    onChange?: (markdownString: string) => void;
    currentUrl?: string;
}

interface AutoResizeTextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = (props) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            // Function to adjust the height
            const adjustHeight = () => {
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
            };

            // Adjust height on initial render
            adjustHeight();

            // Adjust height on input
            textarea.addEventListener("input", adjustHeight);

            // Cleanup event listener on unmount
            return () => {
                textarea.removeEventListener("input", adjustHeight);
            };
        }
    }, []);

    return <textarea ref={textareaRef} {...props} />;
};

export default AutoResizeTextarea;

export const MarkdownPreview = React.memo((props: MarkdownPreviewProps) => {
    const { title, markdownString, currentUrl = "empty", onChange } = props;
    const [editMode, setEditMode] = useState<boolean>(false);

    useEffect(() => {
        if (currentUrl !== "empty" && !!markdownString) {
            console.log("Cache markdown string", title);
            chrome.storage.local.set({ [currentUrl]: markdownString });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editMode, currentUrl]);

    return (
        <div className="markdown-container">
            {title !== "empty" && (
                <div className="markdown-title">
                    <div>{title.charAt(0).toUpperCase() + title.slice(1)}</div>
                </div>
            )}
            <div className="markdown-border">
                {editMode ? (
                    <>
                        <AutoResizeTextarea
                            className="markdown-edit-textarea"
                            onChange={(e) => {
                                e.preventDefault();
                                onChange && onChange(e.target.value);
                            }}
                            value={
                                markdownString &&
                                markdownString !== "**No Content found**"
                                    ? markdownString
                                    : ""
                            }
                        />
                        <div className="markdown-edit-button">
                            <IconButton
                                title="Update"
                                onClick={() => {
                                    setEditMode(false);
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <div className="markdown-content">
                        <Suspense fallback={<div>Loading...</div>}>
                            <Markdown
                                rehypePlugins={[rehypeKatex]} // Remove rehypeRaw to avoid double rendering
                                remarkPlugins={[remarkMath, remarkGfm]}
                                children={
                                    markdownString ?? "**No Content found**"
                                }
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
                                    code({
                                        node,
                                        className,
                                        children,
                                        ...props
                                    }) {
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
                                    span({
                                        node,
                                        className,
                                        children,
                                        ...props
                                    }) {
                                        if (className === "katex") {
                                            return (
                                                <span
                                                    className={className}
                                                    {...props}
                                                    style={{
                                                        backgroundColor:
                                                            "#f2f3f4",
                                                        padding: "0px 2px",
                                                        borderRadius: "8px",
                                                    }}
                                                >
                                                    {children}
                                                </span>
                                            );
                                        }

                                        return (
                                            <span
                                                className={className}
                                                {...props}
                                            >
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
                                    mark({ node, children, ...props }) {
                                        return (
                                            <mark
                                                {...props}
                                                style={{
                                                    backgroundColor: "#ff9",
                                                }}
                                            >
                                                {children}
                                            </mark>
                                        );
                                    },
                                }}
                            />
                        </Suspense>
                        <div className="markdown-edit-button">
                            <IconButton
                                title="Edit"
                                onClick={() => {
                                    setEditMode(true);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

const TagsList = React.memo(
    (props: {
        index: number;
        name: string;
        difficulty: string;
        tags: string[];
        // similar_problems: string[]
    }) => {
        const { index, name, difficulty, tags } = props;
        return (
            <div className="problem-card-title-container">
                <div className="problem-card-title">
                    {String(index) + ". " + nameToTitle(name)}
                </div>
                <div className="problem-card-tags">
                    <Tag type={TagType.Difficulty} value={difficulty} />
                    {tags.slice(0, 3).map((topic, index) => (
                        <Tag key={index} type={TagType.Tag} value={topic} />
                    ))}
                </div>
                {/* <div className="problem-card-tags">
        {similar_problems.map((prob, index) => (
            <Tag
                key={index}
                type={TagType.Tag}
                value={nameToTitle(prob)}
            />
        ))}
    </div> */}
            </div>
        );
    }
);

export const ProblemPreview = (props: ProblemDisplayProps) => {
    const { metadata, setMetadata } = props;

    const handleFieldChange = useCallback(
        (field: keyof ProblemMetaData) => (value: string) => {
            setMetadata((prev) => {
                if (prev) {
                    return { ...prev, [field]: value };
                }
                return prev;
            });
        },
        [setMetadata]
    );

    return (
        <div className="card-container">
            <div className="problem-card">
                <TagsList
                    index={metadata.index}
                    name={metadata.name}
                    difficulty={metadata.difficulty}
                    tags={metadata.tags}
                />
                <div className="problem-card-body">
                    <div style={{ overflow: "scroll", width: "300px" }}>
                        <MarkdownPreview
                            title="description"
                            markdownString={metadata.description}
                            onChange={handleFieldChange("description")}
                        />
                    </div>
                    <div style={{ overflow: "scroll", width: "300px" }}>
                        <MarkdownPreview
                            title="examples"
                            markdownString={metadata.examples}
                            onChange={handleFieldChange("examples")}
                        />
                    </div>
                    <div style={{ overflow: "scroll", width: "300px" }}>
                        <MarkdownPreview
                            title="constraints"
                            markdownString={metadata.constraints}
                            onChange={handleFieldChange("constraints")}
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
