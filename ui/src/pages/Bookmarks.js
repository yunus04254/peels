import React from 'react';
import BookmarksView from '../components/custom/BookmarksView';

function Bookmarks() {
    return (
        <div className='content'>
            <div className="page-header" style = {{fontSize: '30px', fontWeight:'Bold'}}>
                <h1>Bookmarks</h1>
            </div>
            <div className="page-sub-header" style = {{fontSize: '20px'}}>
                <p style={{fontsize:'20px'}}> <h5>Here are all the entries you have bookmarked!</h5></p>
            </div>
            <BookmarksView />
        </div>
    );
}

export default Bookmarks;
