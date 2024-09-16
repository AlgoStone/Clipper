import { useEffect, useState } from "react";
import { Preview, Auth } from "./component";
import "./App.css";

function App() {
    const [notionAccessToken, setNotionAccessToken] = useState<string>();

    useEffect(() => {
        chrome.storage.local.get(["accessToken"], function (result) {
            setNotionAccessToken(result.accessToken);
        });
    }, []);

    return (
        <div className="App">
            {notionAccessToken ? (
                <Preview notionAccessToken={notionAccessToken} />
            ) : (
                <Auth />
            )}
        </div>
    );
}

export default App;
