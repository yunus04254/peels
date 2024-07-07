//JEST Testing file for EntryView component
import ShortEntryView from 'src/components/custom/entries/ShortEntryView';
import { render, fireEvent } from '@testing-library/react';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';
import {expect, jest, test} from '@jest/globals';
import { act } from 'react-dom/test-utils';
import * as api from 'src/lib/api';
import * as AuthContext from 'src/context/AuthContext'; 
import * as React from 'react'; 
import { BrowserRouter as Router } from 'react-router-dom'; 


initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');

function findByTextContent(textContent) {
    return document.evaluate(
        `//*[contains(text(), '${textContent}')]`,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
  }

const entry = {
    entryID: 1,
    mood: "🙂",
    date: new Date(),
    image: "",
    isDraft: false, 
    title: "title",
    content : "",
    Journal: {
        User: {
            userID: 1,
            username: "username",
            favPfp: "pfp.jpg"
        }
    }
}

const toggleRefresh = jest.fn();
const click = jest.fn();
  
describe('ShortEntryView component', () => {

beforeEach(() => {
        
    AuthContext.useAuth.mockReturnValue({ user: { userID: 1 } });

    api.Get.mockImplementation(async (url, params, options) => {
        // URL IS : 'bookmarks/check_bookmark' used by the Bookmarker component
        return Promise.resolve({ ok: true, json: () => Promise.resolve({isBookmarked: false}) });
    });
});

afterEach(() => {
    jest.clearAllMocks();
});

it('should render ShortEntryView component', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { getByText, getByLabelText, getByRole, container } = render(
    <Router>
    <ShortEntryView  key={entry.entryID}
                title={entry.title}
                journalName={entry.Journal.title}
                journalID={entry.Journal.journalID}
                date={entry.date}
                content={entry.content}
                user={entry.Journal.User} />
                                    </Router>);
    expect(getByText("Jump to Journal")).toBeInTheDocument();
    expect(getByText('username')).toBeInTheDocument();
    expect(getByText("from:")).toBeInTheDocument();
});

// it('should render component without edit options if not journal owner', () => {
//     AuthContext.useAuth.mockReturnValue({ user: { userID: 999 } });
//     const new_entry = {
//         entryID: 7,
//         mood: "🙂",
//         date: "2022-01-01",
//         image: "mycustomimage.jpg",
//         isDraft: false, 
//         title: "title",
//         content : {},
//         Journal: {
//             User: {
//                 userID: 2,
//                 username: "username",
//             }
//         }
//     }
//     const { getByText, getByLabelText, getByRole, container } = render(<ShortEntryView  
//                                     contentjson={{}}
//                                     entry={entry} 
//                                     click={()=>{click();}}
//                                     toggleRefresh={toggleRefresh}
//                                     />);
//     expect(getByText('title')).toBeInTheDocument();
//     expect(getByText('🙂')).toBeInTheDocument()
//     expect(getByText('Just now')).toBeInTheDocument();
//     expect(getByText('by - username')).toBeInTheDocument();
//     expect(getByRole('button', {name:'Bookmark', pressed:false})).toBeInTheDocument();

//     //no editing options 
//     expect(() => getByLabelText('itemmanager')).toThrow();
// });

// it('should render component with avatar and username if not journal owner', () => {
//     AuthContext.useAuth.mockReturnValue({ user: { userID: 999 } });
//     const new_entry = {
//         entryID: 7,
//         mood: "🙂",
//         date: "2022-01-01",
//         image: "",
//         isDraft: false, 
//         title: "title",
//         content : {},
//         Journal: {
//             User: {
//                 userID: 2,
//                 username: "username",
//             }
//         }
//     }
//     const { getByText, getByLabelText, getByRole, container } = render(<ShortEntryView  
//                                     contentjson={{}}
//                                     entry={entry} 
//                                     click={()=>{click();}}
//                                     toggleRefresh={toggleRefresh}
//                                     />);

//     expect(getByText('by - username')).toBeInTheDocument();
//     expect(getByText('User')).toBeInTheDocument();
// });

});