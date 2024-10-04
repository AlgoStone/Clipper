import { useEffect, useState } from "react";
import { Home, Auth } from "./component";
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
                <Home notionAccessToken={notionAccessToken} />
            ) : (
                <Auth />
            )}
        </div>
    );
}

export default App;
