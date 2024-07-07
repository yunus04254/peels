import React from "react";
import { useBanana } from '../../context/BananaContext';

const BananaCounter = ({ user, bananaLogo }) => {
    const { updateBananas, bananas } = useBanana();
    
    React.useEffect(() => {
        if (user) {
            updateBananas();
        }
    }, []);

    return (
        <div className="money-counter">
            <div className="banana-icon-background">
                <img src={bananaLogo} alt="Banana" className="banana-icon" />
            </div>
            <div className="banana-count">{bananas}</div>
        </div>
    );
};

export default BananaCounter;