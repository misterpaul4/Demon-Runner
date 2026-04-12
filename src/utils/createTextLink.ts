import Phaser from 'phaser';

type TextLinkOptions = {
    fontSize?: number;
    color?: string;
    backgroundHeight?: number;
    backgroundPaddingX?: number;
    minBackgroundWidth?: number;
    lineSpacing?: number;
    underlineOffsetY?: number;
    underlineThickness?: number;
    underlineWidthPadding?: number;
};

const createTextLink = (
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    options: TextLinkOptions = {},
) => {
    const textColor = options.color ?? '#ffffff';
    const underlineOffsetY = options.underlineOffsetY ?? 16;
    const underlineThickness = options.underlineThickness ?? 4;
    const text = scene.add.text(0, 0, label.toUpperCase(), {
        fontFamily: 'Bushiroad',
        fontSize: `${options.fontSize ?? 42}px`,
        color: textColor,
        align: 'center',
    });
    text.setOrigin(0.5);
    text.setLineSpacing(options.lineSpacing ?? 0);

    const underline = scene.add.rectangle(
        0,
        text.height / 2 + underlineOffsetY,
        text.width + (options.underlineWidthPadding ?? 18),
        underlineThickness,
        Phaser.Display.Color.HexStringToColor(textColor).color,
    );
    underline.setOrigin(0.5);

    const hitWidth = Math.max(text.width + (options.backgroundPaddingX ?? 48), options.minBackgroundWidth ?? 0);
    const hitHeight = options.backgroundHeight ?? Math.max(text.height + underlineOffsetY + underlineThickness + 24, 72);
    const container = scene.add.container(x, y, [underline, text]);
    container.setSize(hitWidth, hitHeight);

    // Ensure the interactive area is centered relative to the container's contents
    container.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, hitWidth, hitHeight),
        Phaser.Geom.Rectangle.Contains,
    );
    if (container.input) {
        container.input.cursor = 'pointer';
    }

    container.on('pointerup', onClick);

    return container;
};

export default createTextLink;
