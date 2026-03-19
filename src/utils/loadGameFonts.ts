const GAME_FONTS = [
    {
        family: 'Bushiroad',
        source: 'url("/fonts/bushiroad.ttf") format("truetype")',
    },
    {
        family: 'BrushScriptStd',
        source: 'url("/fonts/BrushScriptStd.otf") format("opentype")',
    },
] as const;

let gameFontsPromise: Promise<void> | null = null;

export const loadGameFonts = () => {
    if (gameFontsPromise) {
        return gameFontsPromise;
    }

    gameFontsPromise = Promise.all(
        GAME_FONTS.map(async ({ family, source }) => {
            const font = new FontFace(family, source);
            const loadedFont = await font.load();

            document.fonts.add(loadedFont);
            await document.fonts.load(`16px "${family}"`);
        }),
    ).then(() => undefined).catch((error) => {
        gameFontsPromise = null;
        throw error;
    });

    return gameFontsPromise;
};
