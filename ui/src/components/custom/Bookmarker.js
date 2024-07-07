import React, { useState, useEffect } from 'react';
import { Bookmark } from "lucide-react"
import { BookmarkIcon } from "lucide-react"
import { BookmarkCheckIcon } from "lucide-react"
import { Toggle } from "src/components/ui/toggle";
import { toast } from "sonner";
import { Get, Post, Delete } from "src/lib/api";
import { useAuth } from '../../context/AuthContext';

function Bookmarker(props) {
    const [isBookmarked, setIsBookmarked] = useState(false);
   const { user } = useAuth();

    useEffect(() => {
        const fetchBookmarkStatus = async () => {
            try {
                const response = await Get('bookmarks/check_bookmark', {
                    entryID: props.entry.entryID,
                }, { user: user });
                if (!response.ok) throw new Error('Failed to fetch bookmark status');
                const data = await response.json();
                setIsBookmarked(data.isBookmarked);
            } catch (error) {
                console.error('Error fetching bookmark status:', error);
            }
        };

        fetchBookmarkStatus();
    }, [props.entry.entryID, props.user.userID]);

    const handleBookmarkClick = async (pressed) => {
        
        setIsBookmarked(pressed);

        try {
            if (pressed) {
                const response = await Post('bookmarks/bookmark_entry', {
                    entryID: props.entry.entryID,
                }, null, { user: user });
                if (!response.ok) throw new Error('Failed to bookmark entry');
                const data = await response.json();
                toast.success("Bookmark created", {
                    className: "text-white",
                    description: "Entry has been bookmarked!",
                    action: {
                        label: "Okay",
                        onClick: () => {},
                    },
                });
            } else {
              const response = await Post('bookmarks/delete_bookmark', {
                entryID: props.entry.entryID,
            }, null, { user: user });
                if (!response.ok) throw new Error('Failed to delete bookmark');
                const data = await response.json();
                toast.success("Bookmark Deleted", {
                    className: "text-white",
                    description: "Entry has been removed from your bookmarks.",
                    action: {
                        label: "Okay",
                        onClick: () => {},
                    },
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    return (
        <Toggle 
            variant="outline"
            pressed={isBookmarked}
            onPressedChange={handleBookmarkClick}
            aria-label="Bookmark"
        >
            {isBookmarked ? <BookmarkCheckIcon /> : <BookmarkIcon />}
        </Toggle>
    );
}

export default Bookmarker;
