import {Route, Routes} from 'react-router-dom';
import {useUserContext} from '@/context/AuthContext';
import './globals.css';
import AuthLayout from './_auth/AuthLayout';
import RootLayout from './_root/RootLayout';
import SignupForm from './_auth/forms/SignupForm.tsx';
import SigninForm from './_auth/forms/SigninForm.tsx';
import {
    AIFeatures,
    AllUsers,
    ChallengeDetails,
    Challenges,
    CreateChallenge,
    CreateRecipe,
    CreateWorkshop,
    EditRecipe,
    Explore,
    Home,
    Inbox,
    LikedRecipes,
    NotificationsPage,
    Profile,
    RecipeAnalytics,
    RecipeDetails,
    SendMessage,
    UpdateProfile,
    WorkshopDetails,
    Workshops,
} from './_root/pages';
import {Toaster} from '@/components/ui/toaster.tsx';
import Trending from "@/_root/pages/Trending";


const App = () => {
                        const { user } = useUserContext();
                        return (
                            <main className="flex h-screen">
                                <Routes>
                                    {/* public routes */}
                                    <Route element={<AuthLayout />}>
                                        <Route path="/sign-in" element={<SigninForm />} />
                                        <Route path="/sign-up" element={<SignupForm />} />
                                    </Route>
                                    {/* private routes */}
                                    <Route element={<RootLayout />}>
                                        <Route index element={<Home/>} />
                                        <Route path="/explore" element={<Explore/>} />
                                        <Route path="/trending" element={<Trending />} />
                                        <Route path="/challenges" element={<Challenges/>} />
                                        <Route path="/all-users" element={<AllUsers/>} />
                                        <Route path="/create-recipe" element={<CreateRecipe/>} />
                                        <Route path="/update-recipe/:id/*" element={<EditRecipe/>} />
                                        <Route path="/recipe/:id/*" element={<RecipeDetails/>} />
                                        <Route path="/profile/:id/*" element={<Profile/>} />
                                        <Route path="/recipes/:id/*" element={<RecipeDetails/>} />
                                        <Route path="/update-profile/:id/*" element={<UpdateProfile/>} />
                                        <Route path="/liked-recipes/:id/*" element={<LikedRecipes/>} />
                                        <Route path="/challenge/:id/*" element={<ChallengeDetails/>} />
                                        <Route path="/workshops/*" element={<Workshops/>} />
                                        <Route path="/inbox" element={<Inbox/>}/>
                                        <Route path="/recipe-analytics" element={<RecipeAnalytics/>} />
                                        <Route path="/send-message/:userId" element={<SendMessage/>}/>
                                        <Route path="/notifications" element={<NotificationsPage />} />
                                        <Route path="/create-workshop" element={<CreateWorkshop />} />
                                        <Route path="/workshop/:id" element={<WorkshopDetails />} />
                                        <Route path="/create-challenge" element={<CreateChallenge/>}/>
                                        <Route path="/ai-features" element={<AIFeatures/>}/>

                                    </Route>
                                </Routes>
                                <Toaster />
                            </main>
                        );
                    };

                    export default App;
