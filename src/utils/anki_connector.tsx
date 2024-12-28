export type BasicParamsType = Record<
    string,
    string | string[] | number | number[] | true
>;

export interface AnkiNote {
    noteId: number;
    profile: string;
    modelName: string;
    tags: string[];
    fields: Record<string, { value: string; order: number }>;
    mod: number;
    cards: number[];
}

export enum AnkiNoteType {
    LeetCode = "LeetCode",
}

type FieldValue = { value: string; order: number };

export interface LeetCodeFields {
    Title: FieldValue;
    Difficulty: FieldValue;
    Description: FieldValue;
    Topics: FieldValue;
    Examples: FieldValue;
    Constraints: FieldValue;
    Solution: FieldValue;
    SimilarQuestions: FieldValue;
}

type UpdateNoteParams = {
    note: {
        id: number;
        fields: Record<string, string>;
        tags: string[];
    };
};

type AddNoteParams = {
    note: {
        deckName: string;
        modelName: string;
        fields: Record<string, string>;
        tags: string[];
    };
};

export class AnkiClient {
    private static url = "http://127.0.0.1:8765/";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static async request<ParamsType, ResponseType>(
        action: string,
        params: ParamsType
    ): Promise<ResponseType> {
        try {
            const data = {
                action: action,
                params: params,
                version: 6,
            };

            console.log(action.toUpperCase(), params);

            const response = await fetch(this.url, {
                method: "POST",
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            return responseData.result;
        } catch (error) {
            console.error("Error making POST request:", error);
            return {} as ResponseType;
        }
    }

    static async getDeckNames() {
        const deckNames = await this.request<BasicParamsType, string[]>(
            "deckNames",
            {}
        );
        return deckNames;
    }

    static async getDeckNamesAndIds() {
        const deckNamesAndIds = await this.request<
            BasicParamsType,
            Record<string, number>
        >("deckNamesAndIds", {});
        console.log(deckNamesAndIds);
        return deckNamesAndIds;
    }

    static async getNotes(deckName: string) {
        const noteIds = await this.request<BasicParamsType, number[]>(
            "findNotes",
            { query: `deck:${deckName}` }
        );

        const notes = await this.request<BasicParamsType, AnkiNote[]>(
            "notesInfo",
            { notes: noteIds }
        );

        return notes;
    }

    static async updateNoteFields(
        noteId: number,
        fields: Record<string, string>,
        tags: string[]
    ) {
        try {
            await this.request<UpdateNoteParams, boolean | undefined>(
                "updateNote",
                {
                    note: {
                        id: noteId,
                        fields: fields,
                        tags: tags,
                    },
                }
            );

            await this.request<BasicParamsType, AnkiNote[]>("notesInfo", {
                notes: [noteId],
            }).then((notes) => {
                console.log(notes);
            });
        } catch (error) {
            console.log(error);
        }
    }

    static async addNote(
        deckName: string,
        modelName: string,
        fields: Record<string, string>,
        tags: string[]
    ) {
        const noteId = await this.request<AddNoteParams, number | undefined>(
            "addNote",
            {
                note: {
                    deckName: deckName,
                    modelName: modelName,
                    fields: fields,
                    tags: tags,
                },
            }
        );

        if (noteId) {
            console.log("Note added with id", noteId);
        }
    }

    // async deleteDeck(deckName: string) {
    //     await this.request<BasicParamsType, boolean>("deleteDecks", {
    //         decks: [deckName],
    //         cardsToo: true,
    //     });
    // }
}
