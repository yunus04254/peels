import React, { useEffect, useState } from 'react';
import { FaFire } from 'react-icons/fa';
import { useAuth, updateUser } from '../context/AuthContext';
import '../styles/pages/Profile.css';
// Level badges
import levelI from '../styles/badges/leveli.png'; //done
import levelII from '../styles/badges/levelii.png'; //done
import levelIII from '../styles/badges/leveliii.png'; //done
import levelIV from '../styles/badges/leveliv.png'; //done
import levelV from '../styles/badges/levelv.png'; //done
// Account badges
import accCreated from '../styles/badges/acccreated.png'; //done
import oneYearAcc from '../styles/badges/oneyearacc.png'; //done
import fiveYearAcc from '../styles/badges/fiveyearacc.png'; //done
// Entry time badges
import morning from '../styles/badges/morning.png'; //done
import night from '../styles/badges/night.png'; //done
import firstday from '../styles/badges/firstday.png'; //done
// Entry day streak badges
import firstEntry from '../styles/badges/firstentry.png'; //done
import oneMonthStreak from '../styles/badges/onemstreak.png'; //done
import threeMonthStreak from '../styles/badges/threemstreak.png'; //done
import sixMonthStreak from '../styles/badges/sixmstreak.png'; //done
import OneYearStreak from '../styles/badges/oneyearstreak.png'; //done
import everyMonthStreak from '../styles/badges/everymonthstreak.png'; //done
// Login streak badges
import firstLogin from '../styles/badges/firstlogin.png';
import oneWeekLogInStreak from '../styles/badges/oneweekloginstreak.png'; //done
import oneMonthLogInStreak from '../styles/badges/onemloginstreak.png'; //done
import threeMonthLogInStreak from '../styles/badges/threemloginstreak.png'; //done
import sixMonthLogInStreak from '../styles/badges/sixmloginstreak.png'; //done
import OneYearLogInStreak from '../styles/badges/oneyearloginstreak.png'; //done

// Entry count badges
import tenEntry from '../styles/badges/tenentry.png'; //done
import fiftyEntry from '../styles/badges/fiftyentry.png'; //done
import hundredEntry from '../styles/badges/hundredentry.png'; //done

import { Get, Post } from 'src/lib/api';

const badges = {
    levelI,
    levelII,
    levelIII,
    levelIV,
    levelV,
    accCreated,
    oneYearAcc,
    fiveYearAcc,
    morning,
    night,
    firstday,
    firstEntry,
    oneMonthStreak,
    threeMonthStreak,
    sixMonthStreak,
    OneYearStreak,
    everyMonthStreak,
    firstLogin,
    oneWeekLogInStreak,
    oneMonthLogInStreak,
    threeMonthLogInStreak,
    sixMonthLogInStreak,
    OneYearLogInStreak,
    tenEntry,
    fiftyEntry,
    hundredEntry,
};

const Profile = () => {

    const { user, updateUser } = useAuth();
    const [userCharacters, setUserCharacters] = useState([]);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [isFavouriteBadge, setIsFavouriteBadge] = useState(false);
    const [isBadgeEarned, setIsBadgeEarned] = useState(false);
    const [friendCount, setFriendCount] = useState(0);
    const [newFavBadge, setNewFavBadge] = useState(null);
    const [initialBadge, setInitialBadge] = useState(null);

    useEffect(() => {
        setInitialBadge(user.favBadge);
    },[])

    useEffect(() => {
        const getCharacters = async () => {
            try {
                const response = await Get('users/characters', { userId: user.userID }, { user: user });

                if (response.ok) {
                    const characters = await response.json();
                    setUserCharacters(characters[0].Characters);
                } else {
                    console.log(response);

                }
            } catch (error) {
                console.error('Failed to get user characters:', error);
            }
        }
        getCharacters();
    }, [user]);


    const openCharacterModal = (character) => {
        setSelectedCharacter(character);
        setIsCharacterModalOpen(true);
    };

    const updateFavouriteCharacter = async (character) => {
        try {
            // Assuming there's an API endpoint to update the favorite character
            const response = await Post('users/updateFavCharacter', {favCharacter: character }, null, { user: user });

            if (response.ok) {
                // Update local user state with new favorite character
                updateUser({ favPfp: character });
                // Close the modal
                setIsCharacterModalOpen(false);
            } else {
                throw new Error('Failed to update favorite character');
            }
        } catch (error) {
            console.error('Failed to update favorite character:', error);
            alert(error.message);
        }
    };

    // Character detail and selection modal
    const CharacterModal = ({ isOpen, character, onClose }) => {
        if (!isOpen || !character) return null;

        const handleSetFavorite = () => {
            updateFavouriteCharacter(character.description); // Update favorite character
            onClose(); // Close the modal
        };

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>{character.name}</h2>
                    <img src={character.description} alt={character.name} />
                    <div className="modal-buttons">
                        <button onClick={handleSetFavorite} className="button-set-favourite">
                            Set as Favourite
                        </button>
                        <button onClick={onClose} className="button-cancel">Close</button>
                    </div>
                </div>
            </div>
        );
    };
    const renderUserCharacters = () => (
        <div>
            <h3>Your Characters</h3>
            <ul className="item-list">
                {userCharacters.map((character) => (
                    <li key={character.characterID}>
                        <div key={character.characterID} onClick={() => openCharacterModal(character)} style={{cursor: 'pointer'}}>
                            <img src={"/"+character.description} alt={character.name} style={{width: '100px', height: '100px'}} />
                        </div>
                    </li>
                ))}
            </ul>
            <CharacterModal
                isOpen={isCharacterModalOpen}
                character={selectedCharacter}
                onClose={() => setIsCharacterModalOpen(false)}
            />
        </div>
    );

    const hasBadge = (badgeName) => {
        return user?.earnedBadges?.includes(badgeName);
    };

    const earnedBadges = Object.keys(badges).filter(badgeName => hasBadge(badgeName));
    const unearnedBadges = Object.keys(badges).filter(badgeName => !hasBadge(badgeName));

    const updateFavouriteBadge = async (badgeName) => {
        const newFavBadge = badgeName === user.favBadge ? null : badgeName;
        try {
            console.log(badges[newFavBadge]);
            const response = await Post('users/updateFavBadge', { uid: user.uid, favBadge: badges[newFavBadge] }, null, { user: user });

            if (response.ok) {
                updateUser({ favBadge: newFavBadge });
                setInitialBadge(null);
                setNewFavBadge(newFavBadge);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update favourite badge');
            }
        } catch (error) {
            console.error('Failed to update favourite badge:', error);
            alert(error.message);
        }
    };

    const openBadgeModal = (badgeName, earned) => {
        setSelectedBadge(badgeName);
        setIsFavouriteBadge(user.favBadge === badgeName);
        setIsModalOpen(true);
        setIsBadgeEarned(earned);
    };

    const closeBadgeModal = () => {
        setIsModalOpen(false);
        setSelectedBadge(null);
        setIsFavouriteBadge(false);
    };

    function BadgeModal({ isOpen, badgeName, onClose, isFavouriteBadge, isEarned }) {
        if (!isOpen) return null;

        const handleFavouriteClick = () => {
            if (isFavouriteBadge) {
                updateFavouriteBadge(null);
            } else {
                updateFavouriteBadge(badgeName);
            }
            onClose();
        };

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Badge Detail</h2>
                    <img src={badges[badgeName]} alt={`${badgeName} Badge`} className="modal-badge" />
                    <div className="modal-buttons">
                        <button onClick={onClose} className="button-cancel">Close</button>
                        {isEarned ? (
                            <button onClick={handleFavouriteClick} className={isFavouriteBadge ? "button-unselect-favourite" : "button-set-favourite"}>
                                {isFavouriteBadge ? 'Unselect as Favourite' : 'Set as Favourite'}
                            </button>
                        ) : (
                            <button disabled className="button-locked">Locked</button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    const renderBadges = (badgeNames, earned = true) => {
        return badgeNames.map((badgeName) => (
            <li key={badgeName} onClick={() => openBadgeModal(badgeName, earned)}>
                <img
                    src={badges[badgeName]}
                    alt={`${badgeName} Badge`}
                    className={earned ? '' : 'unearned'}
                />
            </li>
        ));
    };

    const renderAchievements = () => {
        return (
            <div className="achievements">
                <h3>Achievements</h3>
                <ul className="item-list">
                    {renderBadges(earnedBadges)}
                    {renderBadges(unearnedBadges, false)}
                </ul>
            </div>
        );
    }; 
    return (
        <div className="content profile-content">
            <div className="page-header" style={{ fontSize: '30px', fontWeight: 'Bold' }}>
                <h1>Profile</h1>
            </div>
            <h2>Welcome to your Profile, {user?.username}</h2>
            <div className="profile-detail"><strong>Email:</strong> {user?.email}</div>
            <div className="profile-detail"><strong>Username:</strong> {user?.username}</div>
            <div className="profile-detail"><strong>Registration Date:</strong> {user?.registrationDate}</div>
            <div className="profile-detail"><FaFire className="flame-icon" /><strong>Log-in Streak:</strong> {user?.daysInARow}</div>
            <div className="profile-detail"><strong>Level:</strong> {user?.level}</div>
            <div className="profile-detail"><strong>Experience:</strong> {user?.xp}</div>
            <div className="profile-detail"><strong>Entry Count:</strong> {user?.entryCount}</div>
            <div className="profile-detail"><strong>Friend Count:</strong> {friendCount}</div>
            {initialBadge && 
                <div className="profile-detail"><strong>Favourite Badge:</strong> 
                    <img
                        src={initialBadge}
                        alt="Favourite Badge"
                        className="fav-badge-icon"
                    />
                </div>
            }
            {!initialBadge &&
            <div className="profile-detail"><strong>Favourite Badge:</strong> {newFavBadge ? (
                <img
                    src={badges[newFavBadge]}
                    alt="Favourite Badge"
                    className="fav-badge-icon"
                />
            ) : (
                <span>No favourite badge selected</span>
            )}</div> }
            <div className="profile-detail"><strong>Current Profile Picture:</strong>
                <img 
                    src={user.favPfp}
                    alt="Profile Picture"
                    className="fav-badge-icon"
                />
            </div>
            <div className="profile-detail">
                <strong>Number of Characters:</strong> {1}
            </div>
            {renderUserCharacters()}
            {renderAchievements()}
            <BadgeModal
                isOpen={isModalOpen}
                badgeName={selectedBadge}
                onClose={closeBadgeModal}
                isFavouriteBadge={isFavouriteBadge}
                isEarned={isBadgeEarned}
            />
            <CharacterModal
                isOpen={isCharacterModalOpen}
                character={selectedCharacter}
                onClose={() => setIsCharacterModalOpen(false)}
            />
        </div>
    );
}

export default Profile;