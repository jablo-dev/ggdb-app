import { RecordType } from '../enum/type.enum';

export interface GameRecord {
    id: number;
    ownerId: number;
    name: string;
    status: string;
    type: keyof typeof RecordType;
    location: string;
    createDate: string;
    finishDate: string;
    note: string;
    replay: number;
    replayValue: number;
    mainQuestDone: number;
    fav: number;
    scoreGameplay: number;
    scorePresentation: number;
    scoreNarrative: number;
    scoreQuality: number;
    scoreSound: number;
    scoreContent: number;
    scorePacing: number;
    scoreBalance: number;
    scoreUIUX: number;
    scoreImpression: number;
    cover?: string;
}
