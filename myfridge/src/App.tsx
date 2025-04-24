import { Routes, Route } from 'react-router-dom';
                    import { useUserContext } from '@/context/AuthContext';
                    import './globals.css';
                    import AuthLayout from './_auth/AuthLayout';
                    import RootLayout from './_root/RootLayout';
                    import SignupForm from './_auth/forms/SignupForm.tsx';
                    import SigninForm from './_auth/forms/SigninForm.tsx';
                    import { Home, Explore, Saved, AllUsers, EditRecipe, RecipeDetails, CreateRecipe, Profile, UpdateProfile, LikedRecipes, Admin, Workshops, Inbox } from './_root/pages';
                    import { Toaster } from '@/components/ui/toaster.tsx';
                    import RecipeAnalytics from './_root/pages/RecipeAnalytics.tsx';
                    import WorkshopDetails from './_root/pages/WorkshopDetails';
                    import NotificationsPage from "./_root/pages/NotificationsPage";
import SendMessage from "@/_root/pages/SendMessage.tsx";
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
                                        <Route index element={<Home />} />
                                        <Route path="/explore" element={<Explore />} />
                                        <Route path="/saved" element={<Saved />} />
                                        <Route path="/all-users" element={<AllUsers />} />
                                        <Route path="/create-recipe" element={<CreateRecipe />} />
                                        <Route path="/update-recipe/:id/*" element={<EditRecipe />} />
                                        <Route path="/recipe/:id/*" element={<RecipeDetails />} />
                                        <Route path="/profile/:id/*" element={<Profile />} />
                                        <Route path="/recipes/:id/*" element={<RecipeDetails />} />
                                        <Route path="/update-profile/:id/*" element={<UpdateProfile />} />
                                        <Route path="/liked-recipes/:id/*" element={<LikedRecipes />} />
                                        <Route path="/admin" element={<Admin />} />
                                        <Route path="/workshops/*" element={<Workshops />} />
                                        <Route path="/notifications" element={<NotificationsPage />} />
                                        <Route path="/recipe-analytics" element={<RecipeAnalytics />} />
                                        <Route path="/workshop/:id" element={<WorkshopDetails />} />
                                        <Route path={"/inbox"} element={<Inbox/>}/>
                                        <Route path={"/send-message/:userId"} element={<SendMessage/>}/>

                                    </Route>
                                </Routes>
                                <Toaster />
                            </main>
                        );
                    };

                    export default App;
