//JEST Testing file for EntryView component
import EntryView from 'src/components/custom/entries/EntryView';
import { render, fireEvent } from '@testing-library/react';
import { initializeApp } from 'firebase/app';
import * as firebase from 'firebase/storage'; 
import firebaseConfig from '../firebase-config';
import {expect, jest, test} from '@jest/globals';
import { act } from 'react-dom/test-utils';
import * as api from 'src/lib/api';
import * as AuthContext from 'src/context/AuthContext';
import * as React from 'react';


initializeApp(firebaseConfig);

jest.mock('src/lib/api');
jest.mock('src/context/AuthContext');
jest.mock('firebase/storage');

const entry = {
    entryID: 1,
    mood: "🙂",
    date: new Date(),
    image: "",
    isDraft: false,
    title: "title",
    content : {},
    Journal: {
        User: {
            userID: 1,
            username: "username",
        }
    }
}

const toggleRefresh = jest.fn();
const click = jest.fn();

describe('EntryView component', () => {

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

it('should render EntryView component', () => {

    const { getByText, getByLabelText, getByRole, container } = render(<EntryView
                                    contentjson={{}}
                                    entry={entry}
                                    click={()=>{click();}}
                                    toggleRefresh={toggleRefresh}
                                    />);
    expect(getByText('title')).toBeInTheDocument();
    expect(getByText('🙂')).toBeInTheDocument()
    expect(getByText('Just now')).toBeInTheDocument();
    expect(()=>getByText('by - username')).toThrow();
    expect(getByRole('button', {name:'Bookmark', pressed:false})).toBeInTheDocument();
    expect(getByLabelText('itemmanager')).toBeInTheDocument();
    const itemmanager = getByLabelText('itemmanager');
    expect(itemmanager).toHaveAttribute('aria-label', 'itemmanager');
    expect(itemmanager).toHaveAttribute('aria-expanded', 'false');
    expect(itemmanager).toHaveAttribute('aria-haspopup', 'menu');
    expect(firebase.getStorage).toHaveBeenCalledTimes(0);
    expect(firebase.ref).toHaveBeenCalledTimes(0);
    expect(firebase.deleteObject).toHaveBeenCalledTimes(0);

});

it('should render component without edit options if not journal owner', () => {
    AuthContext.useAuth.mockReturnValue({ user: { userID: 999 } });
    const new_entry = {
        entryID: 7,
        mood: "🙂",
        date: "2022-01-01",
        image: "mycustomimage.jpg",
        isDraft: false,
        title: "title",
        content : {},
        Journal: {
            User: {
                userID: 2,
                username: "username",
            }
        }
    }
    const { getByText, getByLabelText, getByRole, container } = render(<EntryView
                                    contentjson={{}}
                                    entry={entry}
                                    click={()=>{click();}}
                                    toggleRefresh={toggleRefresh}
                                    />);
    expect(getByText('title')).toBeInTheDocument();
    expect(getByText('🙂')).toBeInTheDocument()
    expect(getByText('Just now')).toBeInTheDocument();
    expect(getByText('by - username')).toBeInTheDocument();
    expect(getByRole('button', {name:'Bookmark', pressed:false})).toBeInTheDocument();

    //no editing options
    expect(() => getByLabelText('itemmanager')).toThrow();
});

it('should render component with avatar and username if not journal owner', () => {
    AuthContext.useAuth.mockReturnValue({ user: { userID: 999 } });
    const new_entry = {
        entryID: 7,
        mood: "🙂",
        date: "2022-01-01",
        image: "",
        isDraft: false,
        title: "title",
        content : {},
        Journal: {
            User: {
                userID: 2,
                username: "username",
            }
        }
    }
    const { getByText, getByLabelText, getByRole, container } = render(<EntryView
                                    contentjson={{}}
                                    entry={entry}
                                    click={()=>{click();}}
                                    toggleRefresh={toggleRefresh}
                                    />);

    expect(getByText('by - username')).toBeInTheDocument();
    expect(getByText('User')).toBeInTheDocument();
});

it('owner should be able to delete entry', async () => {
    api.Post.mockImplementation(async (url, data, params, options) => {
        // URL IS : 'entries/delete_entry' used by the delete_entry function in EntryView
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    const refresh_test = jest.fn();
    refresh_test.mockImplementation(() => {});

    jest.spyOn(console,'log');

    const { getByText, getByLabelText, getByRole, container } = render(<EntryView
        contentjson={{}}
        entry={entry}
        click={()=>{click();}}
        toggleRefresh={refresh_test}
        />);

    const itemmanager = getByLabelText('itemmanager');
    await act(() => {
        fireEvent.click(itemmanager);
    });

    //opens warning dialog button
    const delete_button = getByText('Delete');
    await act(() => {
        fireEvent.click(delete_button);
    });

    //make assertions on the alert dialog that has been opened

    expect(getByText('Are you sure you want to delete this entry? This action cannot be undone.')).toBeInTheDocument();
    expect(getByText('Delete Entry')).toBeInTheDocument();
    expect(getByRole('button', {name:'Cancel'})).toBeInTheDocument();
    expect(getByRole('button', {name:'Delete'})).toBeInTheDocument();

    const delete_entry_button = getByRole('button', {name:'Delete'});

    jest.spyOn(firebase,'getStorage').mockImplementation(() => {});
    jest.spyOn(firebase,'ref').mockImplementation(() => {});
    jest.spyOn(firebase,'deleteObject').mockImplementation(() => {});

    await act(() => {
        fireEvent.click(delete_entry_button);
    });

    expect(firebase.ref).toHaveBeenCalledTimes(0);
    expect(firebase.deleteObject).toHaveBeenCalledTimes(0);

    expect(refresh_test).toHaveBeenCalled();
    expect(api.Post).toHaveBeenCalledTimes(1);
    expect(api.Post).toHaveBeenCalledWith('entries/delete_entry', {id: 1}, null, {user: {userID: 1}});
    expect(console.log).toHaveBeenCalledWith('Entry Deleted');
})

it('owner should delete entry which also deletes media', async () => {
    api.Post.mockImplementation(async (url, data, params, options) => {
        // URL IS : 'entries/delete_entry' used by the delete_entry function in EntryView
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    const entry_with_video = {
        entryID: 7,
        mood: "🙂",
        date: "2022-01-01",
        image: "video.mp4",
        isDraft: false,
        title: "title",
        content : {},
        Journal: {
            User: {
                userID: 1,
                username: "username",
            }
        }}

    jest.spyOn(firebase,'getStorage').mockImplementation(() => {});
    jest.spyOn(firebase,'ref').mockImplementation(() => {});
    jest.spyOn(firebase,'deleteObject').mockImplementation(() => {});

    const refresh_test = jest.fn();
    refresh_test.mockImplementation(() => {});

    jest.spyOn(console,'log');
    
    const { getByText, getByLabelText, getByRole, container } = render(<EntryView  
        contentjson={{}}
        entry={entry_with_video} 
        click={()=>{click();}}
        toggleRefresh={refresh_test}
        />);

    const itemmanager = getByLabelText('itemmanager');
    await act(() => {
        fireEvent.click(itemmanager);
    });

    //opens warning dialog button 
    const delete_button = getByText('Delete');
    await act(() => {
        fireEvent.click(delete_button);
    });

    //make assertions on the alert dialog that has been opened

    expect(getByText('Are you sure you want to delete this entry? This action cannot be undone.')).toBeInTheDocument();
    expect(getByText('Delete Entry')).toBeInTheDocument();
    expect(getByRole('button', {name:'Cancel'})).toBeInTheDocument();
    expect(getByRole('button', {name:'Delete'})).toBeInTheDocument();

    const delete_entry_button = getByRole('button', {name:'Delete'});

    await act(() => {
        fireEvent.click(delete_entry_button);
    });

    expect(firebase.getStorage).toHaveBeenCalledTimes(1);
    expect(firebase.ref).toHaveBeenCalledTimes(1);
    expect(firebase.deleteObject).toHaveBeenCalledTimes(1);
    expect(refresh_test).toHaveBeenCalled();
    expect(api.Post).toHaveBeenCalledTimes(1);
    expect(api.Post).toHaveBeenCalledWith('entries/delete_entry', {id: 7}, null, {user: {userID: 1}});
    expect(console.log).toHaveBeenCalledWith('Entry Deleted');
})

it('EntryView component should safeguard against errors when deleting entry', async () => {
    api.Post.mockImplementation(async (url, data, params, options) => {
       // URL IS : 'entries/delete_entry' used by the delete_entry function in EntryView
        return Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
    });

    const refresh_test = jest.fn();
    refresh_test.mockImplementation(() => {});

    jest.spyOn(console,'log');

    const { getByText, getByLabelText, getByRole, container } = render(<EntryView
        contentjson={{}}
        entry={entry}
        click={()=>{click();}}
        toggleRefresh={refresh_test}
        />);

    const itemmanager = getByLabelText('itemmanager');
    await act(() => {
        fireEvent.click(itemmanager);
    });

    //opens warning dialog button
    const delete_button = getByText('Delete');
    await act(() => {
        fireEvent.click(delete_button);
    });

    //make assertions on the alert dialog that has been opened
    expect(getByRole('button', {name:'Cancel'})).toBeInTheDocument();
    expect(getByRole('button', {name:'Delete'})).toBeInTheDocument();

    const delete_entry_button = getByRole('button', {name:'Delete'});

    await act(() => {
        fireEvent.click(delete_entry_button);
    });

    expect(api.Post).toHaveBeenCalledTimes(1);
    expect(api.Post).toHaveBeenCalledWith('entries/delete_entry', {id: 1}, null, {user: {userID: 1}});
    expect(console.log).toHaveBeenCalledWith('Error deleting entry');

    //make assertions that the alert dialog is closed
    expect(() => getByText('Are you sure you want to delete this entry? This action cannot be undone.')).toThrow();
    expect(() => getByText('Delete Entry')).toThrow();
});

it("should render component with image", () => {
    const entry_with_image = {
        entryID: 7,
        mood: "🙂",
        date: "2022-01-01",
        image: "https://github.com/shadcn.png",
        isDraft: false,
        title: "title",
        content : {},
        Journal: {
            User: {
                userID: 2,
                username: "username",
            }
        }
    }

    //mock resize observer
    window.ResizeObserver = jest.fn().mockImplementation(() => {
        return {
            observe: jest.fn(),
            unobserve: jest.fn(),
            disconnect: jest.fn()
        }
    });

    const { getByText, getByLabelText, getByRole, container } = render(<EntryView  
        contentjson={{}}
        entry={entry_with_image} 
        click={()=>{click();}}
        toggleRefresh={toggleRefresh}
        />);

    expect(getByText('title')).toBeInTheDocument();
    expect(getByText('🙂')).toBeInTheDocument();
    expect(getByText('by - username')).toBeInTheDocument();
    expect(getByRole('button', {name:'Bookmark', pressed:false})).toBeInTheDocument();
    expect(container.querySelector('img')).toBeInTheDocument();
    expect(container.querySelector('video')).toBeNull();
});

it("should render component with video", () => {
    const entry_with_video = {
        entryID: 7,
        mood: "🙂",
        date: "2022-01-01",
        image: "video.mp4",
        isDraft: false,
        title: "title",
        content : {},
        Journal: {
            User: {
                userID: 2,
                username: "username",
            }
        }}

    //mock resize observer
    window.ResizeObserver = jest.fn().mockImplementation(() => {
        return {
            observe: jest.fn(),
            unobserve: jest.fn(),
            disconnect: jest.fn()
        }
    });

    const { getByText, getByLabelText, getByRole, container } = render(<EntryView  
        contentjson={{}}
        entry={entry_with_video} 
        click={()=>{click();}}
        toggleRefresh={toggleRefresh}
        />);

    expect(getByText('title')).toBeInTheDocument();
    expect(getByText('🙂')).toBeInTheDocument();
    expect(getByText('by - username')).toBeInTheDocument();
    expect(getByRole('button', {name:'Bookmark', pressed:false})).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('video')).toBeInTheDocument();


});

});