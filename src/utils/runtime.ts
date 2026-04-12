const MOBILE_USER_AGENT =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

type NavigatorWithUAData = Navigator & {
    userAgentData?: {
        mobile?: boolean;
    };
};

export const isMobileRuntime = () => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
        return false;
    }

    const nav = navigator as NavigatorWithUAData;

    return Boolean(nav.userAgentData?.mobile) ||
        MOBILE_USER_AGENT.test(navigator.userAgent) ||
        (window.matchMedia("(any-pointer: coarse)").matches && window.innerWidth <= 1024);
};

export const isLandscapeViewport = () => {
    if (typeof window === "undefined") {
        return true;
    }

    return window.matchMedia("(orientation: landscape)").matches;
};

export const requestLandscapeOrientation = async () => {
    if (typeof screen === "undefined" || !isMobileRuntime()) {
        return false;
    }

    const orientation = screen.orientation;

    if (!orientation || typeof orientation.lock !== "function") {
        return false;
    }

    try {
        await orientation.lock("landscape");
        return true;
    } catch {
        return false;
    }
};
