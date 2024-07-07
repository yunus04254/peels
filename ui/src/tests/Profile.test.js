import { render, waitFor, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import * as AuthContext from 'src/context/AuthContext';
import Profile from 'src/pages/Profile';
import * as api from 'src/lib/api';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-config';

initializeApp(firebaseConfig);

jest.mock('src/context/AuthContext');
jest.mock('src/lib/api');

const renderWithProviders = (ui, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(ui, { wrapper: BrowserRouter });
};

describe('Profile', () => {
    beforeEach(() => {
        // Setup mock for useAuth hook
        AuthContext.useAuth.mockReturnValue({
            user: {
                userID: 1,
                username: 'testUser',
                favBadge: null,
                earnedBadges: ['levelI', 'levelII', 'morning', 'tenEntry'] // Add some earned badges for testing
            },
            updateUser: jest.fn(),
        });

        jest.spyOn(console, 'error').mockImplementation(() => {}); 

        // Setup mock for API calls
        api.Get.mockImplementation(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve([{ Characters: [] }])
        }));
        api.Post.mockImplementation(() => Promise.resolve({ ok: true }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('displays user profile information correctly', async () => {
        renderWithProviders(<Profile />);

        await waitFor(() => expect(screen.getByText('Welcome to your Profile, testUser')).toBeInTheDocument());
        expect(screen.getByText('Email:')).toBeInTheDocument();
        expect(screen.getByText('Username:')).toBeInTheDocument();
        expect(screen.getByText('Registration Date:')).toBeInTheDocument();
        expect(screen.getByText('Log-in Streak:')).toBeInTheDocument();
        expect(screen.getByText('Level:')).toBeInTheDocument();
        expect(screen.getByText('Experience:')).toBeInTheDocument();
        expect(screen.getByText('Entry Count:')).toBeInTheDocument();
        expect(screen.getByText('Favourite Badge:')).toBeInTheDocument();
        expect(screen.getByText('Current Profile Picture:')).toBeInTheDocument();
        expect(screen.getByText('Number of Characters:')).toBeInTheDocument();
    });

    it('loads and displays user characters', async () => {
        api.Get.mockImplementationOnce(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve([{ Characters: [{ characterID: '1', name: 'Character One', description: 'http://example.com/char1.png' }] }])
        }));

        renderWithProviders(<Profile />);

        await waitFor(() => expect(screen.getByAltText('Character One')).toBeInTheDocument());
    });

    it('opens and interacts with the character modal', async () => {
        api.Get.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ Characters: [{ characterID: '1', name: 'Character One', description: 'http://example.com/char1.png' }] }]
        });

        renderWithProviders(<Profile />);

        // Wait for the character image to appear and click it
        const characterImages = await screen.findAllByAltText('Character One');
        expect(characterImages.length).toBeGreaterThan(0);
        await userEvent.click(characterImages[0]);

        // Now, wait for the 'Set as Favourite' button to appear in the modal and click it
        const setAsFavouriteButtons = await screen.findAllByText('Set as Favourite');
        expect(setAsFavouriteButtons.length).toBeGreaterThan(0);
        await userEvent.click(setAsFavouriteButtons[0]);

        // Verify that the API call was made
        expect(api.Post).toHaveBeenCalled();
    });

    it('updates favorite badge', async () => {
        renderWithProviders(<Profile />);
    
        // Wait for the element to appear asynchronously before interacting
        const allLevelIBadges = await screen.findAllByAltText('levelI Badge');
        expect(allLevelIBadges.length).toBeGreaterThan(0);
    
        // Wrap async actions with act()
        await act(async () => {
            await userEvent.click(allLevelIBadges[0]);
        });
    
        // Similarly, wait for the next element asynchronously
        const allSetAsFavouriteButtons = await screen.findAllByText('Set as Favourite');
        expect(allSetAsFavouriteButtons.length).toBeGreaterThan(0);
    
        await act(async () => {
            await userEvent.click(allSetAsFavouriteButtons[0]);
        });
    });

    it('renders both earned and unearned badges correctly', async () => {
        renderWithProviders(<Profile />);
    
        // Check for an earned badge
        const earnedBadge = screen.getByAltText('levelI Badge');
        expect(earnedBadge).toBeInTheDocument();
        expect(earnedBadge).not.toHaveClass('unearned');
    
        // Check for an unearned badge
        const unearnedBadge = screen.getByAltText('levelIII Badge');
        expect(unearnedBadge).toBeInTheDocument();
        expect(unearnedBadge).toHaveClass('unearned');
    });

    it('opens and closes the character modal correctly', async () => {
        api.Get.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ Characters: [{ characterID: '2', name: 'Character Two', description: 'http://example.com/char2.png' }] }]
        });
    
        renderWithProviders(<Profile />);

        const characterImage = await screen.findByAltText('Character Two');
        await act(async () => {userEvent.click(characterImage);} );
        
        // Use findByText to wait for the asynchronous rendering of modal content
        const setAsFavouriteButtons = await screen.findAllByText('Set as Favourite');
        expect(setAsFavouriteButtons.length).toBeGreaterThanOrEqual(1);
        await act(async () => {userEvent.click(setAsFavouriteButtons[0]);} );
     
    });
    
});
