import React, { useState, useEffect } from 'react';
import EntryView from 'src/components/custom/entries/EntryView';
import { useAuth } from '../../context/AuthContext';
import { Get } from 'src/lib/api';



function BookmarksView() {
    const [bookmarks, setBookmarks] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchBookmarks = async () => {
            try {
                // Assuming Get function handles headers and errors internally
                const response = await Get('bookmarks/fetch_user_bookmarks',null, { user:user });

                if (!response.ok) throw new Error('Failed to fetch bookmarks');

                const data = await response.json();
                setBookmarks(data.map(bookmark => bookmark.Entry));
            } catch (error) {
                console.error('Error fetching bookmarks:', error);
            }
        };

        fetchBookmarks();
    }, [user.userID]); // Dependency array includes user.userID

    return (
        <div className="bookmarks-container" style={{ flexDirection: 'column', paddingTop:'0px', display: 'flex', marginTop: '0px', width: '100%', height: '100vh' }}>
            {bookmarks.map(entry => (
                <div key={entry.entryID} className="bookmark-entry" style = {{display: 'flex', width: '100vh'}}>
                    <EntryView 
                        title={entry.title} 
                        contentjson={JSON.parse(entry.content)}
                        entry={entry}
                        click={()=>{}}
                        toggleRefresh={()=>{}}
                    />
                </div>
            ))}
        </div>
    );
}

export default BookmarksView;