import "./icon-button.css";

export type IconButtonType = "Primary" | "Secondary" | "Danger";

interface IconButtonProps {
    type?: IconButtonType;
    title: string;
    onClick: () => void;
}

export const IconButton = (props: IconButtonProps) => {
    const { type = "Primary", title, onClick } = props;

    return (
        <div className="icon-button-container" onClick={onClick}>
            <div className="icon-button-icon">{typeToIcon(type)}</div>
            <div className="icon-button-title">{title}</div>
        </div>
    );
};

const typeToIcon = (type: IconButtonType) => {
    let svg = (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
            <rect width="256" height="256" fill="none" />
            <path
                d="M96,216H48a8,8,0,0,1-8-8V163.31a8,8,0,0,1,2.34-5.65L165.66,34.34a8,8,0,0,1,11.31,0L221.66,79a8,8,0,0,1,0,11.31Z"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="16"
            />
            <line
                x1="216"
                y1="216"
                x2="96"
                y2="216"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="16"
            />
            <line
                x1="136"
                y1="64"
                x2="192"
                y2="120"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="16"
            />
        </svg>
    );

    switch (type) {
        case "Primary":
            svg = (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                    <rect width="256" height="256" fill="none" />
                    <path
                        d="M96,216H48a8,8,0,0,1-8-8V163.31a8,8,0,0,1,2.34-5.65L165.66,34.34a8,8,0,0,1,11.31,0L221.66,79a8,8,0,0,1,0,11.31Z"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="16"
                    />
                    <line
                        x1="216"
                        y1="216"
                        x2="96"
                        y2="216"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="16"
                    />
                    <line
                        x1="136"
                        y1="64"
                        x2="192"
                        y2="120"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="16"
                    />
                </svg>
            );
            break;
        default:
            svg = (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                    <rect width="256" height="256" fill="none" />
                    <path
                        d="M96,216H48a8,8,0,0,1-8-8V163.31a8,8,0,0,1,2.34-5.65L165.66,34.34a8,8,0,0,1,11.31,0L221.66,79a8,8,0,0,1,0,11.31Z"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="16"
                    />
                    <line
                        x1="216"
                        y1="216"
                        x2="96"
                        y2="216"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="16"
                    />
                    <line
                        x1="136"
                        y1="64"
                        x2="192"
                        y2="120"
                        fill="none"
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="16"
                    />
                </svg>
            );
            break;
    }

    return <div className="svg-container">{svg}</div>;
};
