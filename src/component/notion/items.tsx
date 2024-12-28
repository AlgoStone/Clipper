import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import "./items.css";

export interface DatabaseItemProps {
    item: DatabaseObjectResponse;
}

export const DatabaseItem = (props: DatabaseItemProps) => {
    const { item } = props;

    // const getIcon = (item: DatabaseObjectResponse) => {
    //     if (item.icon) {
    //         if (item.icon.type === "emoji") {
    //             return <div>{item.icon.emoji}</div>;
    //         }
    //         if (item.icon.type === "external") {
    //             return (
    //                 <img
    //                     src={item.icon.external.url}
    //                     alt={`${item.id}-icon`}
    //                     style={{ width: "15px" }}
    //                 />
    //             );
    //         }
    //         if (item.icon.type === "file") {
    //             return <div>{item.icon.file.url}</div>;
    //         }
    //     }
    //     return <div></div>;
    // };

    return (
        <div className="db-item-container">
            {/* <div className="db-item-icon">{getIcon(item)}</div> */}
            <div className="db-item-title"> {item.title[0].plain_text}</div>
        </div>
    );
};
// <div className="database-selector-db-item" key={option.id}>{option.title[0].plain_text}</div>
