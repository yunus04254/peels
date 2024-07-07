import React from 'react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "src/components/ui/carousel"

import { useAuth } from '../../context/AuthContext';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "src/components/ui/alert-dialog";
import { toast } from "sonner";

import { Get, Post } from 'src/lib/api';
import { useBanana } from 'src/context/BananaContext';

function ItemsCarousels() {
    const [characters, setcharacters] = React.useState([]);
    const [styles, setStyles] = React.useState([]);
    const { user } = useAuth();
    const [purchased, setPurchased] = React.useState(0);

    const { updateBananas } = useBanana();
    /* Fetch characters and themes from the marketplace */

    function getItems() {
        Get("character/available", null, { user: user }).then((res) => res.json()).then((data) => {
            setcharacters(data);
        });

        Get("style/available", null, { user: user }).then((res) => res.json()).then((data) => {
            setStyles(data);
        });
    }

    React.useEffect(() => {
        getItems();
    }, [purchased]);

    function purchase(itemID, type) {
        if (user) {
            const data = type === "character" ? { characterID: itemID } : { styleID: itemID }
            Post(type + '/purchase', data, null, { user: user }).then((data) => {
                if (data.ok) {
                    toast.success("Item purchased!", {
                        className: "text-white",
                        description: "You just spent your bananas on a new item!",
                    });
                    setPurchased(purchased + 1);
                    updateBananas();
                }
                else {
                    toast.error("Not enough bananas!", {
                        className: "text-white",
                        description: "You don't have enough bananas to purchase this item.",
                    });
                }
            });
        }
    }

    return (
        <div className="px-10 max-w-[100%]">
            <div className="bg-card-background shadow-sm rounded-lg p-10 mb-10">
                <h1 className="mb-4text-xl font-bold md:text-2xl lg:text-4xl">Characters</h1>
                <Carousel className='min-w-0'>
                    <CarouselContent>
                        {characters.map((character) => (
                            <CarouselItem key={character.itemID} className="md:basis-1/2 lg:basis-1/3 p-5 hover:scale-105 ease-in duration-150">
                                <div className="bg-card-background rounded-lg shadow-md p-4">
                                    <h2 className="text-2xl font-bold text-black border-b-[1px] pb-2 mb-4 border-gray-300 text-center">{character.name}</h2>
                                    <img src={character.description} alt="character" className="rounded-full shadow-xl mb-4 border-[5px] border-gray-300"/>
                                    <div className="flex mt-4">
                                        <AlertDialog>
                                            <AlertDialogTrigger className="bg-yellow-600 hover:bg-yellow-700 mx-auto text-white font-bold py-2 px-4 rounded hover:scale-105 ease-in duration-150">
                                                {character.costInBananas} bananas
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure you want this character?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will cost you {character.costInBananas} bananas. Are you sure you want to continue?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className="text-white" name="continue" onClick={() => purchase(character.characterID, "character")}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
            <div className="bg-card-background shadow-sm rounded-lg p-10 mb-10">
                <h1 className="mb-4  text-xl font-bold md:text-2xl lg:text-4xl">Styles</h1>
                <Carousel className='min-w-0'>
                    <CarouselContent>
                        {styles.map((style) => (
                            <CarouselItem key={style.styleID} className="md:basis-1/2 lg:basis-1/3 p-5 hover:scale-105 ease-in duration-150">
                                <div className="bg-card-background rounded-lg shadow-md p-4">
                                    <h2 className="text-2xl font-bold text-black border-b-[1px] pb-2 mb-3 border-gray-300 text-center">{style.name}</h2>
                                    <div className="rounded-[5px] mx-auto shadow-lg w-40 h-40 border-[3px] border-black" style={{ backgroundColor: style.description}}></div>
                                    <div className="flex mt-4">
                                        <AlertDialog>
                                            <AlertDialogTrigger className="bg-yellow-600 mx-auto hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded hover:scale-105 ease-in duration-150">
                                                {style.costInBananas} bananas
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure you want this style?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will cost you {style.costInBananas} bananas. Are you sure you want to continue?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className="text-white" name="continue" onClick={() => purchase(style.styleID, "style")}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </div>
    );
};

export default ItemsCarousels;