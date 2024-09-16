export type ProblemMetaData = {
    title: string;
    description: string;
    url: string;
    difficulty: string;
    topics: string[];
    similar_problems: string[];
};

export enum ModeType {
    Home = "home",
    ChooseDataBase = "chooseDataBase",
    ChoosePage = "choosePage",
    Preview = "preview",
}
