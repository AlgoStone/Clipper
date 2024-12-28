import { ButtonType } from "../../types";
import "./button.css";

export interface ButtonProps {
    type: ButtonType;
    onClick: () => void;
    text: string;
}

export const Button = (props: ButtonProps) => {
    const { type, onClick, text } = props;
    return (
        <button className={`clipper-btn btn-${type}`} onClick={onClick}>
            {text}
        </button>
    );
};
