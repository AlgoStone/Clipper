import { TagType } from "../types";
import "./tags.css";

export type TagProps = {
    type: TagType;
    value: string;
    onClick?: () => void;
};

export const Tag = (props: TagProps) => {
    const { type, value, onClick } = props;
    const color = getTagColor(type, value);

    if (!color) {
        console.error("Invalid tag type or value", type, value);
    }

    return (
        <div className="tag-container" onClick={onClick}>
            <div
                className="tag-content"
                style={{
                    color: color.font,
                    background: color.background,
                }}
            >
                {value}
            </div>
        </div>
    );
};

// =================================== //
//          Helper Functions           //
// =================================== //

type ColorPair = {
    font: string;
    background: string;
    // dark_font?: string;
    // dark_background?: string;
};

const getTagColor = (type: TagType, value: string) => {
    const colorOptions: { [key: string]: ColorPair } = {
        // default: {
        //     background: "#FFFFFF",
        //     font: "#373530",
        // },
        gray: {
            background: "#F1F1EF",
            font: "#787774",
        },
        brown: {
            background: "#F3EEEE",
            font: "#976D57",
        },
        orange: {
            background: "#F8ECDF",
            font: "#CC782F",
        },
        yellow: {
            background: "#FAF3DD",
            font: "#C29343",
        },
        green: {
            background: "#EEF3ED",
            font: "#548164",
        },
        blue: {
            background: "#E9F3F7",
            font: "#487CA5",
        },
        purple: {
            background: "#F6F3F8",
            font: "#8A67AB",
        },
        pink: {
            background: "#F9F2F5",
            font: "#B35488",
        },
        red: {
            background: "#FAECEC",
            font: "#C4554D",
        },
    };

    const difficultyColorOptions: { [key: string]: ColorPair } = {
        easy: {
            font: "#1cb8b8",
            background: "#f0f0f0",
        },
        简单: {
            font: "#1cb8b8",
            background: "#f0f0f0",
        },
        medium: {
            font: "#ffb800",
            background: "#f0f0f0",
        },
        中等: {
            font: "#ffb800",
            background: "#f0f0f0",
        },
        hard: {
            font: "#f63636",
            background: "#f0f0f0",
        },
        困难: {
            font: "#f63636",
            background: "#f0f0f0",
        },
    };

    function getRandomColorOption() {
        const keys = Object.keys(colorOptions);
        const randomIndex = Math.floor(Math.random() * keys.length);
        const randomKey = keys[randomIndex];
        return colorOptions[randomKey];
    }

    switch (type) {
        case TagType.Difficulty:
            return difficultyColorOptions[value.trim().toLowerCase()];
        case TagType.Tag:
            return getRandomColorOption();
        case TagType.Similar:
            return getRandomColorOption();
    }
};
