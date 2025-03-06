import { useNavigate, useParams, Link, Outlet, useLocation, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LikedRecipes } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import { GridRecipeList, Loader } from "@/components/shared";
import { useGetUserById } from "@/lib/react-query/queriesAndMutations";
import { IUser } from "@/types";

interface StatBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StatBlockProps) => (
    <div className="flex-center gap-2">
      <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
      <p className="small-medium lg:base-medium text-light-2">{label}</p>
    </div>
);

const Profile = () => {
  const { id } = useParams(); // The profile user's ID
  const { user } = useUserContext(); // Authenticated user context
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { data: currentUser, isLoading } = useGetUserById(id || "");

  if (isLoading || !currentUser)
    return (
        <div className="flex-center w-full h-full">
          <Loader />
        </div>
    );

  return (
      <div className="profile-container">
        <div className="profile-inner_container">
          <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
            <img
                src={
                    currentUser.pfp ||
                    "/assets/icons/profile-placeholder.svg"
                }
                alt="profile"
                className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
            />
            <div className="flex flex-col flex-1 justify-between md:mt-2">
              <div className="flex flex-col w-full">
                <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                  {currentUser.first_name} {currentUser.last_name}
                </h1>
                <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                  @{currentUser.username}
                </p>
              </div>
              <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
                <StatBlock value={currentUser.recipes.length || 0} label="Recipes" />
                <StatBlock value={currentUser.followers.length || 0} label="Followers" />
                <StatBlock value={currentUser.following.length || 0} label="Following" />
              </div>
              <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
                {currentUser.bio}
              </p>
            </div>
            <div className="flex justify-center gap-4">
              {/* Edit Profile Button */}
              {user.id === currentUser.id && (
                  <Link
                      to={`/update-profile/${currentUser.id}`}
                      className="h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg"
                  >
                    <img
                        src={"/assets/icons/edit.svg"}
                        alt="edit"
                        width={20}
                        height={20}
                    />
                    <p className="flex whitespace-nowrap small-medium">Edit Profile</p>
                  </Link>
              )}
              {/* Follow Button */}
              {user.id !== currentUser.id && (
                  <Button type="button" className="shad-button_primary px-8">
                    Follow
                  </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs for Recipes and Liked Recipes */}
        {user.id === currentUser.id && (
            <div className="flex max-w-5xl w-full">
              <Link
                  to={`/profile/${id}`}
                  className={`profile-tab rounded-l-lg ${
                      pathname === `/profile/${id}` && "!bg-dark-3"
                  }`}
              >
                <img
                    src={"/assets/icons/recipes.svg"}
                    alt="recipes"
                    width={20}
                    height={20}
                />
                Recipes
              </Link>
              <Link
                  to={`/profile/${id}/liked-recipes`}
                  className={`profile-tab rounded-r-lg ${
                      pathname === `/profile/${id}/liked-recipes` && "!bg-dark-3"
                  }`}
              >
                <img
                    src={"/assets/icons/like.svg"}
                    alt="like"
                    width={20}
                    height={20}
                />
                Liked Recipes
              </Link>
            </div>
        )}

        {/* Routes */}
        <Routes>
          <Route
              index
              element={<GridRecipeList recipes={currentUser.recipes} showUser={false} />}
          />
          {user.id === currentUser.id && (
              <Route path="liked-recipes" element={<LikedRecipes />} />
          )}
        </Routes>
        <Outlet />
      </div>
  );
};

export default Profile;
