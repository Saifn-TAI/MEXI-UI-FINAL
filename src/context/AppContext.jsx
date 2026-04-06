import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [showExecBrief, setShowExecBrief] = useState(false);
    const [execBriefContent, setExecBriefContent] = useState(null);
    /** GET /tenant — { displayName?, logoUrl? } */
    const [engineTenant, setEngineTenant] = useState(null);
    /** GET /bootstrap — { statusLabel, envLabel } */
    const [engineBootstrap, setEngineBootstrap] = useState(null);
    /** GET /data-sync/status — { statusText, lastRunText } */
    const [engineDataSync, setEngineDataSync] = useState(null);
    /** GET /me — profile for top bar + overlays */
    const [engineMe, setEngineMe] = useState(null);
    return (
        <AppContext.Provider
            value={{
                showExecBrief,
                setShowExecBrief,
                execBriefContent,
                setExecBriefContent,
                engineTenant,
                setEngineTenant,
                engineBootstrap,
                setEngineBootstrap,
                engineDataSync,
                setEngineDataSync,
                engineMe,
                setEngineMe,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
