import React, { useEffect, useMemo, useState } from "react";
import { Client } from "@notionhq/client";
import {
    DatabaseObjectResponse,
    PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

import { DatabaseItem } from "./items";
import "./selector.css";

interface DatabaseSelectorProps {
    notionAccessToken: string;
    backBtn: () => void;
}

export const DatabaseSelector = (props: DatabaseSelectorProps) => {
    const { notionAccessToken, backBtn } = props;
    const [databaseOptions, setDataBaseOptions] = useState<
        DatabaseObjectResponse[]
    >([]);
    const [pageOptions, setPageOptions] = useState<PageObjectResponse[]>([]);
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [searchResult, setSearchResult] = useState<DatabaseObjectResponse[]>(
        []
    );

    const notion = useMemo(
        () => new Client({ auth: notionAccessToken }),
        [notionAccessToken]
    );

    useEffect(() => {
        (async () => {
            const response = await notion.search({
                // query: "External tasks",
                filter: {
                    value: "database",
                    property: "object",
                },
                sort: {
                    direction: "descending",
                    timestamp: "last_edited_time",
                },
                page_size: 5,
            });
            const pageOps: PageObjectResponse[] = [];
            const databaseOps: DatabaseObjectResponse[] = [];

            if (response.results.length > 0) {
                response.results.forEach((result) => {
                    if (result.object === "database") {
                        databaseOps.push(result as DatabaseObjectResponse);
                    } else {
                        pageOps.push(result as PageObjectResponse);
                    }
                });
                setDataBaseOptions(databaseOps);
                setPageOptions(pageOps);
            } else {
                console.log("No results found");
            }
        })();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (searchKeyword === "") {
            return;
        }
        (async () => {
            const response = await notion.search({
                query: searchKeyword,
                filter: {
                    value: "database",
                    property: "object",
                },
                sort: {
                    direction: "descending",
                    timestamp: "last_edited_time",
                },
            });
            const databaseOps: DatabaseObjectResponse[] = [];
            if (response.results.length > 0) {
                response.results.forEach((result) => {
                    if (result.object === "database") {
                        databaseOps.push(result as DatabaseObjectResponse);
                    }
                });
                setSearchResult(databaseOps);
            } else {
                console.log("No results found");
            }
        })();
    }, [notion, searchKeyword]);

    return (
        <div>
            <button onClick={backBtn}>Back</button>
            <div>Choose a database:</div>
            <div className="database-selector-db-container">
                {databaseOptions.map((option) => (
                    <DatabaseItem key={option.id} item={option} />
                ))}
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Search"
                    value={searchKeyword}
                    onChange={(e) => {
                        setSearchKeyword(e.target.value);
                    }}
                />
            </div>
            <div>
                {searchResult.map((option) => (
                    <div key={option.id}>{option.title[0].plain_text}</div>
                ))}
            </div>
        </div>
    );
};
