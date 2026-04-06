import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [showExecBrief, setShowExecBrief] = useState(false);
    return (
        <AppContext.Provider value={{ showExecBrief, setShowExecBrief }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    return useContext(AppContext);
}
