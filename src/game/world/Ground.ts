import Phaser from 'phaser';
import config from '../../utils/config';
import { TEX } from '../systems/art';

type Segment = {
    collider: Phaser.Physics.Arcade.Image;
    ground: Phaser.GameObjects.TileSprite;
    edge: Phaser.GameObjects.TileSprite;
    right: number;
};

export class Ground {
    readonly group: Phaser.Physics.Arcade.StaticGroup;
    private scene: Phaser.Scene;
    private segments: Segment[] = [];
    private cursor = 0;
    private gapChance = config.gapChanceStart;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.group = scene.physics.add.staticGroup();

        this.addSegment(-1200, 2600);
        this.cursor = 1400;
    }

    setGapChance(chance: number) {
        this.gapChance = chance;
    }

    private addSegment(left: number, width: number) {
        const top = config.groundTop;

        const collider = this.group.create(left, top, TEX.ground) as Phaser.Physics.Arcade.Image;
        collider.setOrigin(0, 0).setVisible(false);
        collider.displayWidth = width;
        (collider.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();

        const ground = this.scene.add
            .tileSprite(left, top, width, 220, TEX.ground)
            .setOrigin(0, 0)
            .setDepth(-10);
        const edge = this.scene.add
            .tileSprite(left, top - 4, width, 12, TEX.groundEdge)
            .setOrigin(0, 0)
            .setDepth(-9);

        this.segments.push({ collider, ground, edge, right: left + width });
    }

    private recycle(seg: Segment, left: number, width: number) {
        const top = config.groundTop;
        seg.collider.setPosition(left, top);
        seg.collider.displayWidth = width;
        (seg.collider.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();

        seg.ground.setPosition(left, top);
        seg.ground.width = width;
        seg.edge.setPosition(left, top - 4);
        seg.edge.width = width;
        seg.right = left + width;
    }

    update(cameraScrollX: number) {
        const aheadTo = cameraScrollX + config.width + 400;

        while (this.cursor < aheadTo) {
            const gap = Math.random() < this.gapChance
                ? Phaser.Math.Between(config.gapRange[0], config.gapRange[1])
                : 0;
            const left = this.cursor + gap;
            const width = Phaser.Math.Between(config.segmentRange[0], config.segmentRange[1]);

            const recyclable = this.segments.find((s) => s.right < cameraScrollX - 300);
            if (recyclable) {
                this.recycle(recyclable, left, width);
            } else {
                this.addSegment(left, width);
            }
            this.cursor = left + width;
        }
    }
}
