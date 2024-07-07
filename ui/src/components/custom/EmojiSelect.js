import React from "react";
import { useState, useEffect } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "src/components/ui/popover"

import Picker  from 'emoji-picker-react';
import "src/styles/components/EmojiSelect.css"

function EmojiSelect (props) {
    const [mood, setMood] = useState(props.initial? props.initial : "🙂");

    //"1f622" Crying Emoji 
    //"1f621" Angry Emoji
    //"1f610" Straight Face Emoji
    //"1f914" Thinking Emoji
    //"1f62f" Shocked Emoji
    //"1f642" Slightly Smiling Emoji
    //"1f604" Very Happy Emoji
    const reactions = ["1f622", "1f621", "1f610", "1f914", "1f62f", "1f642", "1f604"];

    function handleReactionClick(mood) {
        setMood(mood.emoji);
    }

    useEffect(() => {
        props.onChange(mood);
    },[mood]);

    return (
        <Popover className="">
            <PopoverTrigger role="button" className="text-3xl popupIcon" name="emoji-button">{mood}</PopoverTrigger>
            <PopoverContent className=" bg-white p-0 w-full rounded-full">
                <Picker 
                        emojiStyle={"native"}
                        reactionsDefaultOpen={true}
                        onReactionClick={handleReactionClick}
                        allowExpandReactions={false}
                        searchDisabled={true}
                        reactions={reactions}  
                    />
            </PopoverContent>
        </Popover>
    );

}

export default EmojiSelect;