global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
      this.callback = callback;
  }

  observe() {}

  unobserve() {}

  disconnect() {}
};



import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import Journal from 'src/components/custom/Journal'; 
import { BrowserRouter } from 'react-router-dom';
import * as AuthContext from 'src/context/AuthContext'; 
import * as api from 'src/lib/api'; 
import { waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';


jest.mock('src/context/AuthContext');


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));


jest.mock('src/lib/api');

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
};


describe('Journal', () => {
    beforeEach(() => {
      AuthContext.useAuth.mockReturnValue({ user: { userID: 1} });
      api.Delete.mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
      api.Get.mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));

      
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });

it('renders correctly when the given theme', async () => {
    const { getByText } = renderWithRouter(<Journal journalID="1" title="My Journal" theme="Theme 1" ownerUsername="testUser" isOwner={true} styleVariant="variant1"  />);
    await act(async () => {
      const journalElement = getByText('My Journal').closest('div');
    
      const expectedColor = 'turquoise';
      expect(journalElement).toHaveStyle(`background-color: ${expectedColor}`);
    });
  });

  it('renders correctly with the given theme', async () => {
    const { getByText } = renderWithRouter(<Journal journalID="1" title="My Journal" theme="Theme 2" ownerUsername="testUser" isOwner={true} styleVariant="variant1" />);
    await act(async () => {
      const journalElement = getByText('My Journal').closest('div');
    
      const expectedColor = 'lightpink';
      expect(journalElement).toHaveStyle(`background-color: ${expectedColor}`);
    });
  });

  it('renders correctly with the given theme', async () => {
    const { getByText } = renderWithRouter(<Journal journalID="1" title="My Journal" theme="Theme 3" ownerUsername="testUser" isOwner={true} styleVariant="variant1" />);
    await act(async () => {
      const journalElement = getByText('My Journal').closest('div');
    
      const expectedColor = 'lightyellow';
      expect(journalElement).toHaveStyle(`background-color: ${expectedColor}`);
    });
  });

  it('displays friend username under journal', async () => {
    const { getByText } = renderWithRouter(<Journal journalID="1" title="My Journal" theme="Theme 3" ownerUsername="testUser" isOwner={true} />);
    await act(async () => {
      expect(screen.getByText("@testUser")).toBeInTheDocument();
    });
  });

  it('displays title under journal', async () => {
    const { getByText } = renderWithRouter(<Journal journalID="1" title="My Journal" theme="Theme 3" ownerUsername="testUser" isOwner={true} />);
    await act(async () => {
      expect(screen.getByText("My Journal")).toBeInTheDocument();
    });
  });

  it('navigates to journal details on click', () => {
    const navigate = jest.fn();
    useNavigate.mockImplementation(() => navigate);
  
    renderWithRouter(<Journal journalID="1" title="My Journal" theme="Theme 1" />);
    const journalElement = screen.getByText('My Journal');
    fireEvent.click(journalElement);
    
  
    expect(navigate).toHaveBeenCalledWith(`/journals/1`);
  });
  
  
  it('shows edit and delete options for the owner', async () => {
    renderWithRouter(<Journal journalID="1" title="My Journal" theme="Theme 1" isOwner={true} />);
    
    
    await act(async () => { 
      const deleteButton = screen.getByTestId('delete-journal-button');
      const editButton = screen.getByTestId('edit-journal-button');

      expect(deleteButton).toBeInTheDocument();
      expect(editButton).toBeInTheDocument();
    });
  
  });

  it('shows edit and delete options for the owner', async () => {
    renderWithRouter(<Journal journalID="1" title="My Journal" theme="Theme 1" isOwner={false} />);
    
    
    await act(async () => { 
      const deleteButton = screen.queryByTestId('delete-journal-button');
      const editButton = screen.queryByTestId('edit-journal-button');

      expect(deleteButton).toBeNull();
      expect(editButton).toBeNull();
    });
  
  });

  it('confirms deletion completion process with delete button in AlertDialog', async () => {
    const user = userEvent.setup();
    const mockOnDeleteJournal = jest.fn();
    renderWithRouter(<Journal journalID="1" title="My Journal" theme="Theme 1" isOwner={true} onDeleteJournal={mockOnDeleteJournal} />);


    await act(async () => {
  
      await user.click(screen.getByRole('button', { name: 'Delete' }));
    
    });

    await expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();

    await act(async () => {
  
      await user.click(screen.getByRole('button', { name: 'Continue' }));
    
    });
    
    await waitFor(() => {
      expect(mockOnDeleteJournal).toHaveBeenCalledWith("1"); 
    });
    
  });

  it('confirms deletion cancellation with the cancel button in AlertDialog', async () => {
    const user = userEvent.setup();
    const mockOnDeleteJournal = jest.fn();
    renderWithRouter(<Journal journalID="1" title="My Journal" theme="Theme 1" isOwner={true} onDeleteJournal={mockOnDeleteJournal} />);


    await act(async () => {
  
      await user.click(screen.getByRole('button', { name: 'Delete' }));
    
    });

    await expect(screen.getByText('Are you absolutely sure?')).toBeInTheDocument();

    await act(async () => {
  
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
    
    });
    
    await waitFor(() => {
      expect(screen.getByText('My Journal')).toBeInTheDocument();
    });
    
  });

  it('opens EditJournal on edit button click', async () => {
    const user = userEvent.setup();

    const mockJournal = {
      journalID: '1',
      title: 'My Journal',
      theme: 'Ocean Blue',
      reminder: 'Every day',
      isPrivate: false,
    };
    const mockOnUpdateJournal = jest.fn();

    const { getByTestId} = render(
      <BrowserRouter>
        <Journal
          {...mockJournal}
          onUpdateJournal={mockOnUpdateJournal}
          isOwner={true}
        />
      </BrowserRouter>
    );

    await act(async () => {
  
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    
    });
    

    expect(screen.getByText('Edit your journal')).toBeInTheDocument();

  });

  
});