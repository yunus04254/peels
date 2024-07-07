import { useContext, useState, createContext } from 'react';
import { Get } from 'src/lib/api';
import { useAuth } from 'src/context/AuthContext';

const BananaContext = createContext();

export const BananaProvider = ({ children }) => {
    const [bananas, setBananas] = useState(0);
    const { user } = useAuth();

    function updateBananas() {
        Get("users/findByUid", { uid: user.uid }).then((res) => res.json()).then((data) => {
            setBananas(data.bananas);
        });
    }


    return (
        <BananaContext.Provider value={{ updateBananas, bananas }}>
        {children}
        </BananaContext.Provider>
    )
}

 export const useBanana = () => useContext(BananaContext);