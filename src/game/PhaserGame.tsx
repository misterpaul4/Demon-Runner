import { forwardRef, useEffect, useRef, useState } from "react";
import StartGame from "./main";
import { EventBus } from "./EventBus";
import { loadGameFonts } from "../utils/loadGameFonts";

export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface IProps {
    currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

export const PhaserGame = forwardRef<IRefPhaserGame, IProps>(
    function PhaserGame({ currentActiveScene }, ref) {
        const game = useRef<Phaser.Game | null>(null!);
        const [isBooting, setIsBooting] = useState(true);

        useEffect(() => {
            let mounted = true;

            const bootGame = async () => {
                try {
                    await loadGameFonts();
                } catch (error) {
                    console.error("Failed to preload game fonts.", error);
                }

                if (!mounted || game.current !== null) {
                    return;
                }

                game.current = StartGame("game-container");

                if (typeof ref === "function") {
                    ref({ game: game.current, scene: null });
                } else if (ref) {
                    ref.current = { game: game.current, scene: null };
                }

                setIsBooting(false);
            };

            void bootGame();

            return () => {
                mounted = false;

                if (game.current) {
                    game.current.destroy(true);
                    if (game.current !== null) {
                        game.current = null;
                    }
                }
            };
        }, [ref]);

        useEffect(() => {
            EventBus.on(
                "current-scene-ready",
                (scene_instance: Phaser.Scene) => {
                    if (
                        currentActiveScene &&
                        typeof currentActiveScene === "function"
                    ) {
                        currentActiveScene(scene_instance);
                    }

                    if (typeof ref === "function") {
                        ref({ game: game.current, scene: scene_instance });
                    } else if (ref) {
                        ref.current = {
                            game: game.current,
                            scene: scene_instance,
                        };
                    }
                }
            );
            return () => {
                EventBus.removeListener("current-scene-ready");
            };
        }, [currentActiveScene, ref]);

        return (
            <>
                {isBooting && <div className="game-boot-status">Loading game...</div>}
                <div id="game-container"></div>
            </>
        );
    }
);

