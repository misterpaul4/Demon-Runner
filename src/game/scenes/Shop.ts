import Phaser, { Scene } from 'phaser';
import config from '../../utils/config';
import { EventBus } from '../EventBus';

type ShopItemConfig = {
    title: string;
    subtitle: string;
    price: number;
};

const SHOP_ITEMS: ShopItemConfig[] = [
    {
        title: '疾跑靴',
        subtitle: '让奔跑速度更快一些',
        price: 30,
    },
    {
        title: '幸运符',
        subtitle: '之后更容易拿到星星',
        price: 60,
    },
    {
        title: '羽披风',
        subtitle: '让二段跳更从容',
        price: 120,
    },
];

const CN_FONT = '"Microsoft YaHei", "PingFang SC", sans-serif';

export class Shop extends Scene {
    constructor() {
        super('Shop');
    }

    create() {
        const centerX = config.gameWidth / 2;
        const centerY = config.gameHeight / 2;
        const stars = Number(localStorage.getItem('stars') || '0');

        this.add.image(centerX, centerY, 'background').setDisplaySize(config.gameWidth, config.gameHeight);
        this.add.rectangle(centerX, centerY, config.gameWidth, config.gameHeight, 0x100f12, 0.56);

        this.add.text(centerX, 108, 'SHOP', {
            fontFamily: 'Bushiroad',
            fontSize: '86px',
            color: '#f3e8cd',
        }).setOrigin(0.5);

        this.add.text(centerX, 170, '之后可以在这里购买升级和外观。', {
            fontFamily: CN_FONT,
            fontSize: '24px',
            color: '#f7f2e7',
        }).setOrigin(0.5);

        this.createWallet(1100, 108, stars);
        this.createCards(centerX, centerY + 30);

        this.createBackLink(140, config.gameHeight - 74);

        EventBus.emit('current-scene-ready', this);
    }

    createWallet(x: number, y: number, stars: number) {
        const chip = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 182, 78, 0x151417, 0.84);
        bg.setStrokeStyle(1, 0xf3e8cd, 0.28);
        bg.setOrigin(0.5);

        const star = this.add.image(-50, 0, 'star');
        star.setScale(0.14);
        star.setAngle(-12);

        const value = this.add.text(12, 0, `${stars}`, {
            fontFamily: 'Bushiroad',
            fontSize: '40px',
            color: '#fff4cf',
        }).setOrigin(0.5);

        chip.add([bg, star, value]);
    }

    createCards(centerX: number, y: number) {
        const gap = 34;
        const cardWidth = 270;
        const totalWidth = SHOP_ITEMS.length * cardWidth + (SHOP_ITEMS.length - 1) * gap;
        let currentX = centerX - totalWidth / 2 + cardWidth / 2;

        SHOP_ITEMS.forEach((item) => {
            const card = this.add.container(currentX, y);

            const frame = this.add.rectangle(0, 0, cardWidth, 292, 0x121115, 0.84);
            frame.setStrokeStyle(1, 0xf3e8cd, 0.18);

            const accent = this.add.rectangle(0, -108, 194, 70, 0xc93a2f, 0.16);
            accent.setStrokeStyle(1, 0xf7c8a9, 0.28);

            const star = this.add.image(0, -110, 'star');
            star.setScale(0.13);
            star.setAngle(-8);

            const title = this.add.text(0, -20, item.title, {
                fontFamily: CN_FONT,
                fontSize: '30px',
                color: '#f3e8cd',
                align: 'center',
                fontStyle: '700',
                wordWrap: { width: 210 },
            }).setOrigin(0.5);

            const subtitle = this.add.text(0, 36, item.subtitle, {
                fontFamily: CN_FONT,
                fontSize: '22px',
                color: '#efe9dc',
                align: 'center',
                wordWrap: { width: 210 },
            }).setOrigin(0.5);

            const priceBar = this.add.rectangle(0, 106, 146, 48, 0x1c1b21, 0.92);
            priceBar.setStrokeStyle(1, 0xf3e8cd, 0.16);

            const priceStar = this.add.image(-34, 106, 'star');
            priceStar.setScale(0.085);

            const price = this.add.text(20, 106, `${item.price}`, {
                fontFamily: 'Bushiroad',
                fontSize: '28px',
                color: '#fff4cf',
            }).setOrigin(0.5);

            card.add([frame, accent, star, title, subtitle, priceBar, priceStar, price]);
            currentX += cardWidth + gap;
        });

        this.add.text(centerX, y + 220, '商店暂时还是展示页，下一步可以接购买逻辑。', {
            fontFamily: CN_FONT,
            fontSize: '22px',
            color: '#d9d3c5',
        }).setOrigin(0.5);
    }

    createBackLink(x: number, y: number) {
        const label = this.add.text(0, 0, 'BACK MENU', {
            fontFamily: 'Bushiroad',
            fontSize: '28px',
            color: '#f4f0d8',
        }).setOrigin(0.5);

        const underline = this.add.rectangle(0, 24, label.width + 14, 2, 0xf4f0d8).setOrigin(0.5);
        const hitArea = this.add.zone(0, 10, label.width + 28, 48).setOrigin(0.5);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on('pointerup', () => {
            this.scene.start('MainMenu');
        });

        this.add.container(x, y, [hitArea, underline, label]).setScrollFactor(0, 1);
    }
}
