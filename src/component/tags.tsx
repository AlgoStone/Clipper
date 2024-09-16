import { TagType } from "../types";
import "./tags.css";

export type TagProps = {
    type: TagType;
    value: string;
    onClick?: () => void;
};

export const Tag = (props: TagProps) => {
    const { type, value, onClick } = props;
    return (
        <div className="tag-container" onClick={onClick}>
            <div>{value}</div>
        </div>
    );
};

// =================================== //
//          Helper Functions           //
// =================================== //

const getTagColor = (type: TagType) => {};
