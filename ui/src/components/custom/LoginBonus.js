import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "src/components/ui/alert-dialog";
import { Button } from "src/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "src/components/ui/carousel";
import { Post, Get } from "src/lib/api";
import { useAuth } from "src/context/AuthContext";
import { useBanana } from "src/context/BananaContext";

const LoginBonus = () => {
  const { user } = useAuth();
  const [api, setApi] = React.useState(null);
  const [showCarousel, setShowCarousel] = React.useState(false);
  const [bananas, setBananas] = React.useState(0);
  const [showBonus, setShowBonus] = React.useState(true);
  const { updateBananas } = useBanana();

  const rewardDays = [2, 4, 6, 8, 10];
  const refs = React.useRef([]);

  React.useEffect(() => {
    Get("users/loggedInToday", null, { user: user })
      .then((response) => response.json())
      .then((response) => {
        if (showBonus != response.loggedInToday) {
          setShowBonus(response.loggedInToday);
        }
      });
  }, [showBonus]);

  const handleClaim = () => {
    setShowCarousel(true);
    let daysInARow = user.daysInARow;
    let loggedInYesterday = false;

    Get("users/loggedInYesterday", null, { user: user })
      .then((response) => response.json())
      .then((response) => {
        loggedInYesterday = response.loggedInYesterday;
        if (!loggedInYesterday) {
          Post("users/resetDaysInARow", {}, null, { user: user });
          daysInARow = 0;
        }

        const ref = refs.current[daysInARow < 5 ? daysInARow : 4];
        ref.className = "bg-green-300 shadow-md p-5";

        for (let i = 0; i < daysInARow; i++) {
          api.scrollNext();
          console.log("scrolling");
        }

        setBananas(rewardDays[daysInARow < 5 ? daysInARow : 4]);
      });
  };

  const handleExit = () => {
    Post("users/dailyLogin", {}, null, { user: user });
    Post("users/updateBananas", { bananas: bananas }, null, {
      user: user,
    }).then(() => {
      updateBananas(bananas);
    });
    setShowBonus(true);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        hidden={showBonus}
        className="button py-2.5 px-5 text-white rounded-sm"
      >
        Daily Bonus
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Daily bonus bananas!</AlertDialogTitle>
          <div className="text-center">
            <div hidden={!showCarousel}>
              <Carousel setApi={setApi} className="">
                <CarouselContent>
                  {rewardDays.map((reward, index) => (
                    <CarouselItem key={index} className="basis-1/2">
                      <div
                        ref={(ref) => {
                          refs.current[index] = ref;
                        }}
                        className="bg-white shadow-md p-5"
                      >
                        <div className="card-content text-center">
                          <h1 className="text-md font-bold text-black">
                            {index == 4 ? "Days 5+" : "Day " + (index + 1)}
                          </h1>
                          <h1 className="text-lg font-extrabold text-black">
                            {reward}
                          </h1>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
            <div hidden={showCarousel}>
              <Button
                onClick={handleClaim}
                className="button"
              >
                Claim my bananas!
              </Button>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div hidden={!showCarousel}>
            <AlertDialogAction onClick={handleExit} className="button">
              *happy monkey noises*
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LoginBonus;
