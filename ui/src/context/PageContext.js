// src/context/PageContext.js
import React, {createContext, useContext, useEffect, useState} from 'react';

const PageContext = createContext();

export const usePageContext = () => useContext(PageContext);

export const PageProvider = ({ children }) => {
    const [pageContents, setPageContents] = useState({
        currentPage: '',
        journal: '',
        journalID: '',
        journalTitle: '',
    });

    const updatePageContent = (type, content) => {
        setPageContents(prevContents => ({
            ...prevContents,
            [type]: content,
        }));
    };

    useEffect(() => {
        if (pageContents.currentPage && pageContents.journal) {
            setPageContents(prevContents => ({
                ...prevContents,
                journalID: pageContents.journal.journalID,
                journalTitle: pageContents.journal.title,
            }));
        }
    }, [pageContents]);

    return (
        <PageContext.Provider value={{ pageContents, updatePageContent }}>
            {children}
        </PageContext.Provider>
    );
};
