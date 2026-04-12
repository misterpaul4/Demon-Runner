import { useEffect, useMemo, useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import {
    isLandscapeViewport,
    isMobileRuntime,
    requestLandscapeOrientation,
} from "./utils/runtime";

function App() {
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [isLandscape, setIsLandscape] = useState(() => isLandscapeViewport());
    const isMobile = useMemo(() => isMobileRuntime(), []);

    // Event emitted from the PhaserGame component
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const currentScene = (scene: Phaser.Scene) => {
        //
    };

    useEffect(() => {
        if (!isMobile) {
            return;
        }

        const mediaQuery = window.matchMedia("(orientation: landscape)");
        const syncViewport = () => {
            setIsLandscape(mediaQuery.matches);
        };
        const lockOrientation = () => {
            void requestLandscapeOrientation();
        };

        syncViewport();
        lockOrientation();

        mediaQuery.addEventListener("change", syncViewport);
        window.addEventListener("pointerdown", lockOrientation, { passive: true });

        return () => {
            mediaQuery.removeEventListener("change", syncViewport);
            window.removeEventListener("pointerdown", lockOrientation);
        };
    }, [isMobile]);

    return (
        <div
            id="app"
            className={[
                isMobile ? "is-mobile" : "",
                isMobile && !isLandscape ? "is-portrait" : "",
            ].filter(Boolean).join(" ")}
        >
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            {isMobile && !isLandscape && (
                <div className="mobile-rotate-hint">
                    <div className="mobile-rotate-card">
                        <div className="mobile-rotate-title">请横屏游玩</div>
                        <div className="mobile-rotate-copy">
                            已为移动端默认横屏显示。若当前仍为竖屏，请旋转设备后继续。
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
