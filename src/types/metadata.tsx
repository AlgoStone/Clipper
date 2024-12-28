export type ProblemMetaData = {
    name: string;
    index: number;
    difficulty: string;
    tags: string[];
    similar_problems: string[];

    description: string;
    constraints: string;
    examples: string;
    follow_ups?: string;

    hints?: string[];
    solutions?: string[];
    notes?: string[];
};

export enum ModeType {
    Home = "home",
    ChooseDataBase = "chooseDataBase",
    ChoosePage = "choosePage",
    Preview = "preview",
}
