import React, { useEffect, useState } from "react";

export const Auth = () => {
    const [code, setCode] = useState<String | undefined>(undefined);

    useEffect(() => {
        chrome.storage.local.get(["accessToken"], function (result) {
            console.log("Access token retrieved");
            setCode(result.accessToken);
        });
    }, []);

    const handlerClick = () => {
        if (chrome.identity) {
            console.log(chrome.identity);
            console.log("Identity API is available");
        }
        if (code) {
            console.log("Access token already exists");
            return;
        }

        const url = new URL("https://api.notion.com/v1/oauth/authorize");
        url.searchParams.append(
            "client_id",
            "ebfc1d3a-a5e3-4d9d-9938-8e533562b455"
        );
        url.searchParams.append("response_type", "code");
        url.searchParams.append("owner", "user");
        url.searchParams.append(
            "redirect_uri",
            chrome.identity.getRedirectURL()
        );
        chrome.identity.launchWebAuthFlow(
            {
                url: url.toString(),
                interactive: true,
            },
            async (redirectUrl) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    return;
                }

                if (!redirectUrl) {
                    console.error("Failed to obtain redirect URL");
                    return;
                }

                // Extract the authorization code from the redirect URL
                const urlParams = new URLSearchParams(
                    new URL(redirectUrl).search
                );
                const code = urlParams.get("code");

                if (code) {
                    // Exchange the authorization code for an access token
                    const response = await fetch(
                        "https://api.notion.com/v1/oauth/token",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Basic ${btoa(
                                    "ebfc1d3a-a5e3-4d9d-9938-8e533562b455:secret_4qb26S7tGcJzzA2CorM5kflYjqp7nBqHwOstzdlrL1B"
                                )}`, // Replace with actual client_secret
                            },
                            body: JSON.stringify({
                                grant_type: "authorization_code",
                                code: code,
                                redirect_uri: chrome.identity.getRedirectURL(),
                            }),
                        }
                    );

                    const tokenData = await response.json();
                    if (tokenData.access_token) {
                        setCode(tokenData.access_token);
                        console.log("Access Token:", tokenData.access_token);
                        // Use the access token for authorized API requests
                        chrome.storage.local.set({
                            accessToken: tokenData.access_token,
                        });
                    } else {
                        setCode("Failed to obtain access token");
                        console.error(
                            "Failed to obtain access token:",
                            tokenData
                        );
                    }
                }
            }
        );
    };
    // chrome.identity.launchWebAuthFlow(
    //     {
    //         url: url.toString(),
    //         interactive: true,
    //     },
    //     async function (redirect_url) {
    //         if (redirect_url) {
    //             const url = new URL(redirect_url);
    //             const code = url.searchParams.get("code");

    //             setCode(code || "empty");

    //             // encode in base 64
    //             const clientId = "ebfc1d3a-a5e3-4d9d-9938-8e533562b455";
    //             const clientSecret =
    //                 "secret_4qb26S7tGcJzzA2CorM5kflYjqp7nBqHwOstzdlrL1B";
    //             const encoded = btoa(`${clientId}:${clientSecret}`);

    //             // get access token
    //             const response = await fetch(
    //                 "https://api.notion.com/v1/oauth/token",
    //                 {
    //                     method: "POST",
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                         Accept: "application/json",
    //                         mode: "no-cors",
    //                         Authorization: `Basic ${encoded}`,
    //                     },
    //                     body: JSON.stringify({
    //                         grant_type: "authorization_code",
    //                         code: code,
    //                         redirect_uri:
    //                             "https://kejphnhdpeajebgcfagehfadlpphflic.chromiumapp.org/",
    //                     }),
    //                 }
    //             );

    //             if (response.ok) {
    //                 const data = await response.json();
    //                 console.log(data);
    //             }
    //         }
    //     }
    // );

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div>{code}</div>
            <div style={{ width: "20px" }}>
                <button onClick={handlerClick}>Authorize</button>
            </div>
        </div>
    );
};
