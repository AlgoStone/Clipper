import React, { useEffect, useState } from "react";
import { Client } from "@notionhq/client";
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export interface NotionSelectorProps {
    notionAccessToken: string;
}

export const NotionSelector = (props: NotionSelectorProps) => {
    const { notionAccessToken } = props;
    const [notionData, setNotionData] = useState<DatabaseObjectResponse[]>([]);
    const [selectedOption, setSelectedOption] = useState(""); // State to store selected value

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value); // Update state with selected value
    };

    useEffect(() => {
        const notion = new Client({ auth: notionAccessToken });
        (async () => {
            const response = await notion.search({
                // query: "External tasks",
                // filter: {
                //     value: "database",
                //     property: "object",
                // },
                sort: {
                    direction: "ascending",
                    timestamp: "last_edited_time",
                },
            });
            if (response.results.length > 0) {
                setNotionData(response.results as DatabaseObjectResponse[]);
            } else {
                console.log("No results found");
            }
        })();
    }, [notionAccessToken]);

    return (
        <div>
            {notionAccessToken}
            <h3>Choose an option:</h3>
            <div>
                <select
                    id="selectBox"
                    value={selectedOption}
                    onChange={handleChange}
                    style={{ width: "95%" }}
                >
                    <option value="" disabled>
                        Select an option
                    </option>
                    {notionData.map((option: DatabaseObjectResponse, index) => (
                        <option key={index} value={option.id}>
                            {option.title[0].plain_text}
                        </option>
                    ))}
                </select>
                {/* <p>Selected option: {selectedOption}</p> */}
            </div>
        </div>
    );
};
