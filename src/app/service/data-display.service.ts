import { Injectable } from '@angular/core';
import { GameRecord } from '../models/record.model';

@Injectable({
    providedIn: 'root'
})
export class DataDisplayService {
    getTotalScore(record?: GameRecord): number {
        if (!record) return 0;

        const scores = [
            'scoreGameplay', 'scorePresentation', 'scoreNarrative', 'scoreQuality',
            'scoreSound', 'scoreContent', 'scorePacing', 'scoreBalance',
            'scoreUIUX', 'scoreImpression'
        ] as const;

        let reachedPoints = 0;
        let countedCategories = 0;

        for (const key of scores) {
            const value = record[key] ?? 0;
            if (value > 0) {
                reachedPoints += value;
                countedCategories++;
            }
        }

        if (countedCategories === 0) return 0;
        return Math.round((reachedPoints / (countedCategories * 10)) * 100);
    }

    isTierScore(score: number): boolean {
        return score >= 85;
    }

    getTierGradient(score: number): string {
        if (this.isRpgRarityEnabled()) {
            return this.getRpgTierGradient(score);
        }
        if (score >= 95) return 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)';
        if (score >= 90) return 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 50%, #A8A8A8 100%)';
        if (score >= 85) return 'radial-gradient(circle, #e49a6e 30%, #b4693e 90%)';
        return 'transparent';
    }

    isRpgRarityEnabled(): boolean {
        return localStorage.getItem('rpgRarityEnabled') === 'true';
    }

    getRpgTierGradient(score: number): string {
        if (score >= 95) return 'linear-gradient(135deg, #FFD700 0%, #FFC200 50%, #B8860B 100%)';
        if (score >= 90) return 'linear-gradient(135deg, #BF5FFF 0%, #9B30FF 50%, #7B00FF 100%)';
        if (score >= 85) return 'linear-gradient(135deg, #4FC3F7 0%, #1E88E5 50%, #1565C0 100%)';
        return 'transparent';
    }

    getScoreTextColor(score: number): string {
        if (score >= 80) return 'limegreen';
        if (score >= 75) return 'yellowgreen';
        if (score >= 70) return 'yellow';
        if (score >= 65) return 'orange';
        return 'red';
    }

    getPlatformLabel(location: string): string {
        switch (location) {
            case 'STEAM': return 'Steam';
            case 'BATTLE_NET': return 'Battle.net';

            case 'PLAYSTATION_1': return 'PlayStation 1';
            case 'PLAYSTATION_2': return 'PlayStation 2';
            case 'PLAYSTATION_3': return 'PlayStation 3';
            case 'PLAYSTATION_4': return 'PlayStation 4';
            case 'PLAYSTATION': return 'PlayStation 5';
            case 'PS_VITA': return 'PlayStation Vita';
            case 'PSP': return 'PlayStation Portable';

            case 'XBOX': return 'Xbox Series X/S';
            case 'XBOX_ONE': return 'Xbox One';
            case 'XBOX_360': return 'Xbox 360';
            case 'XBOX_ORIGINAL': return 'Original Xbox';
            case 'XBOX_GAME_PASS': return 'Xbox Game Pass';

            case 'NINTENDO_CONSOLE': return 'Nintendo Switch';
            case 'NINTENDO_CONSOLE2': return 'Nintendo Switch 2';
            case 'WII': return 'Nintendo Wii';
            case 'WII_U': return 'Nintendo Wii U';
            case 'NINTENDO_3DS': return 'Nintendo 3DS';
            case 'NINTENDO_DS': return 'Nintendo DS';
            case 'GBA': return 'Game Boy Advance';
            case 'GAME_BOY': return 'Game Boy';
            case 'NES': return 'Nintendo Entertainment System';
            case 'SNES': return 'Super Nintendo Entertainment System';
            case 'N64': return 'Nintendo 64';
            case 'GAMECUBE': return 'Nintendo GameCube';

            case 'EPIC_GAMES': return 'Epic Games';
            case 'EA_PLAY': return 'EA Play';
            case 'UPLAY': return 'UPlay';
            case 'GOG': return 'GOG';

            case 'GENESIS': return 'Sega Genesis / Mega Drive';
            case 'SATURN': return 'Sega Saturn';
            case 'DREAMCAST': return 'Sega Dreamcast';
            case 'ATARI_2600': return 'Atari 2600';

            case 'OTHER': return 'Other';

            default: return location || '—';
        }
    }

    getPlatformIconClass(location: string): string {
        switch (location) {
            case 'STEAM': return 'bi bi-steam';
            case 'BATTLE_NET':
            case 'EPIC_GAMES':
            case 'EA_PLAY':
            case 'UPLAY':
            case 'GOG': return 'bi bi-pc-display';

            case 'PLAYSTATION_1':
            case 'PLAYSTATION_2':
            case 'PLAYSTATION_3':
            case 'PLAYSTATION_4':
            case 'PLAYSTATION': return 'bi bi-playstation';

            case 'XBOX':
            case 'XBOX_ONE':
            case 'XBOX_360':
            case 'XBOX_ORIGINAL':
            case 'XBOX_GAME_PASS': return 'bi bi-xbox';

            case 'PS_VITA':
            case 'PSP':
            case 'NINTENDO_3DS':
            case 'NINTENDO_DS':
            case 'GBA':
            case 'GAME_BOY': return 'bi bi-device-hdd';

            case 'NES':
            case 'SNES':
            case 'N64':
            case 'GAMECUBE':
            case 'WII':
            case 'WII_U':
            case 'GENESIS':
            case 'SATURN':
            case 'DREAMCAST':
            case 'ATARI_2600': return 'bi bi-controller';

            case 'NINTENDO_CONSOLE':
            case 'NINTENDO_CONSOLE2': return 'bi bi-nintendo-switch';

            case 'OTHER': return 'bi bi-disc';
            default: return 'bi bi-disc';
        }
    }
}
